# Toallatón UNAM 2026

Aplicación Next.js + TypeScript para Salud UNAM. Incluye los dos escudos originales y el video entregado (856 × 1072, aproximadamente 5 segundos). Diseño azul, blanco, dorado y rosa; estilos CSS propios. No utiliza Tailwind.

## Estado de entrega

Compilación y TypeScript verificados. Rutas `/pantalla` y `/admin` disponibles. Sin datos ficticios. **La conexión real y las pruebas de escritura en PostgreSQL están pendientes** porque todavía no se ha creado la base. No se ha publicado en Internet. La implementación usa el controlador HTTP de Neon; para un PostgreSQL de otro proveedor se debe adaptar `lib/db.ts`.

Se revisaron el mapa y las 17 sedes en el navegador integrado (Chromium), el administrador y la reproducción del video. Safari y el flujo completo entre dos equipos con base real quedan pendientes de validación antes del evento.

## Inicio

Usar Node.js 24 LTS y npm. Desde esta carpeta:

```sh
npm ci
cp .env.example .env.local
```

Agregar exactamente estas variables a `.env.local`:

```dotenv
DATABASE_URL=postgresql://USUARIO:CONTRASENA@HOST/BASE?sslmode=require
ADMIN_PASSWORD=una-clave-larga-privada-del-evento
```

Obtener DATABASE_URL de una base Neon propia. La clave administrativa se introduce en `/admin`; no se guarda en localStorage. Nunca compartir `.env.local` ni subirlo a Git.

```sh
npm run db:check
npm run db:migrate
npm run build
npm start -- --port 3217
```

Abrir `http://localhost:3217/pantalla` y `http://localhost:3217/admin`. Para dos equipos en una misma red, sustituir localhost por la IP del servidor. En producción utilizar HTTPS. Configurar ambas variables también en Vercel o Render, y ejecutar la migración una vez antes del evento. Render: build `npm ci && npm run build`, start `npm start -- --port $PORT`. Vercel: importar esta carpeta como proyecto Next.js y agregar las variables.

## Nuevas sedes

En `/admin`, introducir la clave y pulsar **Agregar sede**. Capturar nombre completo, nombre corto, estado, ciudad/alcaldía, latitud y longitud. Se guardan en PostgreSQL y aparecen automáticamente en el selector y el mapa. El formulario necesita una conexión activa. Facultad de Música y Prepa 6 Antonio Caso ya forman parte de las 17 sedes iniciales.

Las coordenadas iniciales son referencias aproximadas y deben confirmarse con el punto de acopio concreto, especialmente las facultades con varios campus. Antes de la primera migración pueden ajustarse en `data/sedes.ts`. Una vez insertadas, ese archivo no sobrescribe coordenadas ya guardadas: actualizar el registro de `sites` en la base. La vista metropolitana separa visualmente los puntos cercanos, unidos a su ubicación por líneas.

## Operación

- El administrador confirma cada donación. El formulario conserva la sede, limpia cantidad/donante/observaciones tras guardar y utiliza un UUID de idempotencia durante los reintentos de la misma confirmación.
- Las cantidades son enteros positivos y se validan en servidor y base de datos. Los acumulados se calculan de registros vigentes.
- Deshacer afecta únicamente al último registro activo y requiere confirmación. Es una baja lógica (`deleted_at`), conserva auditoría básica y descuenta los totales.
- La pantalla consulta eventos cada segundo, recorre todos los eventos nuevos mediante cursor secuencial y los encola. Las inserciones se serializan en PostgreSQL para evitar saltos por commits fuera de orden. La cola pendiente y el cursor se conservan en el navegador. La donación activa se marca al comenzar para no repetirla tras una recarga; una recarga durante esa animación la interrumpe.
- En una pantalla nueva se empieza desde el evento más reciente, sin reproducir el historial. Debe abrirse antes de registrar donaciones del evento.
- Se muestra aviso, zoom, agradecimiento, confetti y video sin controles, sin sonido y sin texto superpuesto. Al finalizar vuelve al mapa. Si el video falla, continúa automáticamente.
- Totales y sedes se actualizan durante las animaciones. No se exponen donantes ni observaciones en las API públicas.
- Durante fallos de conexión conserva el último estado conocido. Los mapas base necesitan acceso a OpenStreetMap; no requieren API de pago.
- El total se actualiza al recibir los datos, sin esperar al final del video, para mantener información actual durante una cola larga.

## Rutas

| Ruta | Uso |
| --- | --- |
| `/` | Redirección a `/pantalla` |
| `/pantalla` | Proyección, mapa, contador, cola y video |
| `/admin` | Registro, indicadores, historial y alta de sedes |
| `GET /api/stats` | Totales y sedes públicas |
| `GET /api/sites` | Catálogo público |
| `POST /api/sites` | Crear sede; requiere `x-admin-password` |
| `GET /api/donations` | Últimos 100 registros; requiere clave |
| `POST /api/donations` | Donación con `id` UUID, `site_id`, `quantity`, `donor`, `notes`; requiere clave |
| `GET /api/donations/latest` | Cursor actual para inicialización |
| `GET /api/donations/latest?after=123` | Hasta 100 eventos posteriores, en orden |
| `DELETE /api/donations/[id]` | Deshacer último registro; requiere clave |

La protección por clave compartida está pensada para operadores del evento. Para una operación institucional prolongada conviene integrar autenticación institucional, control por usuarios y limitación de intentos en el proveedor de despliegue.

## Verificación realizada

- `npm run build`: correcto.
- `npm run typecheck`: correcto.
- GET `/pantalla`, `/admin`, assets JavaScript y video: HTTP 200.
- GET de historial y POST sin clave: HTTP 401.
- APIs dependientes de base sin DATABASE_URL: HTTP 503, conservando interfaz y mostrando reconexión.
- Encuadre verificado a 1366 × 768 y 1920 × 1080; administrador móvil a 390 px sin desbordamiento horizontal.
- Pendiente: migración y POST/GET/DELETE reales, creación persistente de sede, secuencia de varias donaciones entre dos dispositivos y prueba final en Safari.

## Archivos creados

No había proyecto en la carpeta de trabajo. Todos los archivos están en esta carpeta; no se modificaron los originales del escritorio o Descargas.

- `package.json`, `package-lock.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `.gitignore`, `.env.example`, `README.md`.
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- `app/pantalla/page.tsx`, `app/admin/page.tsx`.
- `app/api/donations/route.ts`, `app/api/donations/latest/route.ts`, `app/api/donations/[id]/route.ts`.
- `app/api/stats/route.ts`, `app/api/sites/route.ts`.
- `components/Brand.tsx`, `components/DonationCounter.tsx`, `components/DonationMap.tsx`, `components/MetroMap.tsx`, `components/DonationCelebration.tsx`, `components/Fireworks.tsx`.
- `data/sedes.ts`, `lib/db.ts`, `lib/http.ts`, `lib/types.ts`.
- `scripts/schema.sql`, `scripts/migrate.mjs`.
- `public/logos/unam.webp`, `public/logos/salud-unam.png`, `public/videos/gracias.mp4`.

`node_modules/`, `.next/` y `tsconfig.tsbuildinfo` son artefactos locales generados y no deben versionarse.

## Configuración segura de Neon

El archivo `.env.local` está preparado y tiene permisos de lectura y escritura solo para tu usuario (600). Pega la cadena de conexión de Neon como valor de `DATABASE_URL`, directamente en ese archivo. No uses el prefijo `NEXT_PUBLIC_`: la conexión se consume exclusivamente en el servidor. `.gitignore` excluye los archivos de entorno.

Después de guardar, ejecuta `npm run db:check` para una comprobación de solo lectura que no imprime credenciales. Luego ejecuta `npm run db:migrate` para crear las tablas e insertar las sedes iniciales sin sobrescribir las existentes, y reinicia el servidor para cargar las variables nuevas. Configura también `ADMIN_PASSWORD` para habilitar el registro administrativo.

Archivo adicional creado: `scripts/check-db.mjs`. Se añadió el comando `db:check` a `package.json`.

## Publicación en Vercel

Consulta [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) para publicar esta carpeta directamente con la CLI de Vercel, reutilizando la base Neon existente `toallaton-unam-2026`. La configuración de Vercel está en `vercel.json`; los secretos locales se excluyen mediante `.vercelignore`.
