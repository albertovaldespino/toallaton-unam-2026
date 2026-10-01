# Publicar el proyecto actual en Vercel

Se utiliza la base Neon existente `toallaton-unam-2026`. No hay que crear otra base ni activar una integración de almacenamiento de Vercel. Este procedimiento publica los archivos actuales, incluidos los escudos y el video.

## 1. Enlazar esta carpeta con Vercel

Abre Terminal y ejecuta:

```sh
cd '/Users/albertovaldespinoparedes/Documents/Codex/2026-10-01/c/outputs/toallaton-unam'
npx vercel@latest login
npx vercel@latest link
```

Inicia sesión en el navegador. En el asistente de `link`, selecciona tu cuenta/equipo y crea un **proyecto de aplicación** llamado `toallaton-unam-2026` (o enlaza el existente si ya creaste uno en Vercel). Crear este proyecto no crea una base de datos. Usa esta carpeta como raíz, acepta Next.js y conserva las opciones de compilación. No hace falta repositorio GitHub.

## 2. Configurar los secretos en Vercel

En el panel del proyecto, abre **Settings → Environment Variables**. Agrega para **Production**:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de tu base Neon existente `toallaton-unam-2026`, obtenida en Connect. Conserva los parámetros SSL proporcionados por Neon. |
| `ADMIN_PASSWORD` | Una clave privada larga para quienes registrarán donaciones. |

Introduce los valores directamente en Vercel, sin pegarlos en el chat ni en comandos de Terminal. No uses el prefijo `NEXT_PUBLIC_`. El archivo `.env.local` no se sube: Vercel necesita sus propias variables configuradas en el panel. No actives una integración que aprovisione una base nueva.

## 3. Preparar las tablas en la base existente

Si todavía no ejecutaste la migración, configura localmente `DATABASE_URL` en `.env.local` con la misma conexión de Neon. Desde la carpeta del proyecto:

```sh
npm run db:check
npm run db:migrate
```

`db:check` prueba la conexión sin escribir registros ni imprimir credenciales. `db:migrate` crea las tablas en esa base e inserta las 17 sedes iniciales; no ejecuta CREATE DATABASE, no borra donaciones y no sobrescribe sedes existentes. No se ejecuta automáticamente durante la compilación ni en cada despliegue.

## 4. Publicar

Después de configurar las variables y preparar las tablas:

```sh
npx vercel@latest --prod
```

Vercel instalará las dependencias y compilará el proyecto con Next.js y Node.js 24. Al finalizar entregará la URL HTTPS de producción. No uses `npm start` en Vercel ni configures una exportación estática: la aplicación necesita sus rutas API.

Añade a la URL entregada:

- `/pantalla` para la proyección pública.
- `/admin` para el registro, usando ADMIN_PASSWORD.

La URL funcionará desde computadoras, tablets y teléfonos con Internet; tu computadora no necesita permanecer encendida. No se debe compartir una URL localhost ni una URL temporal de preview.

## 5. Verificar

Abre la URL de producción en otro dispositivo y en una ventana privada. Comprueba que la pantalla deja de mostrar «Reconectando», que las 17 sedes cargan y que el administrador admite la clave configurada. Valida el ciclo completo con una donación identificada como prueba y deshaz ese último registro al terminar, antes de comenzar la captura real. Prueba también Safari.

Si aparece una pantalla de acceso propia de Vercel, revisa con el responsable de la cuenta la protección configurada para el dominio de producción; no confundas ese acceso con la clave del administrador de la aplicación.

Para cambios futuros, ejecuta de nuevo `npx vercel@latest --prod` desde esta misma carpeta. Si cambias las variables en el panel, vuelve a desplegar para que el nuevo despliegue las utilice.

## Preparación realizada

- `vercel.json`: framework Next.js, instalación `npm ci`, compilación `npm run build`.
- `package.json` y `package-lock.json`: Node.js 24.x.
- `.vercelignore`: excluye credenciales, dependencias, cachés y archivos locales.
- `.gitignore`: excluye también `.vercel`.
- `lib/http.ts`: evita imprimir mensajes internos de conexión que puedan contener datos sensibles en los registros del servidor.
- `.env.local`: conservado sin leer ni modificar su contenido.

Esta preparación no publica por sí sola, no crea bases y no modifica datos en Neon. La prueba final en Vercel y la conexión real dependen de que configures las variables y ejecutes los pasos anteriores.

Referencias oficiales: [desplegar desde la CLI](https://vercel.com/docs/projects/deploy-from-cli), [variables de entorno](https://vercel.com/docs/environment-variables), [archivos excluidos](https://vercel.com/docs/deployments/vercel-ignore).
