# Toallatón UNAM 2026 · Actualización del 2 de octubre

## Estado

Implementación local terminada. `npm test` pasó 14 pruebas (5 de cálculo/configuración y 9 de componentes/API), `npm run build` y `npm run typecheck` terminaron correctamente. Pantallas y videos responden HTTP 200; el historial privado devuelve 401 sin clave.

**Pendiente antes de commit/push:** revisión en navegador real a 1920×1080, 1366×768, tablet y teléfono; reproducción completa con audio y validación visual de transparencia. El entorno de ejecución bloqueó el inicio de Chromium con `bootstrap_check_in ... Permission denied`. No se presenta una simulación DOM como prueba real de navegador. Se conserva la condición del documento de completar la revisión antes de publicar: no se hizo commit, push ni despliegue de estos cambios.

Vista previa local: http://localhost:3218/pantalla y http://localhost:3218/admin. Necesita que el servidor local continúe activo y, para consultar datos, la configuración de base ya existente. No se alteraron variables ni credenciales para la vista previa.

## Videos

- `public/videos/gracias-donacion-queen.mp4`: copia exacta de `Toallaton_Puma_Queen_FINAL (1).mp4`. H.264, 868×1060, 23 segundos, audio AAC original. No se cambia volumen, imagen ni audio; no tiene `muted`, no repite en bucle y se cierra al recibir `ended`. Se retiró el corte fijo anterior a los 45 segundos. Un guardián de bloqueo solo actúa si el video deja de avanzar durante más de un minuto, no por su duración.
- `public/videos/Puma_transparente_mapa.webm`: copia exacta de `Puma_transparente_mapa (1).webm`. VP9, 900×844, 7.042 segundos, metadato alpha=1; no contiene audio. Se reproduce con autoPlay, loop, muted, playsInline y preload=auto. Se refuerza `muted=true` al iniciar y ante cambios de volumen. Sin controles, eventos de ratón, fondo, bordes ni caja. Sustituye exclusivamente el recuadro metropolitano; continúa detrás del agradecimiento.

Se compararon hashes SHA-256 de ambas copias con sus archivos originales: idénticos. El video anterior ya no se utiliza en la reproducción; se mantiene el archivo antiguo sin editar.

## Límite real del autoplay con audio

La aplicación intenta reproducir el MP4 automáticamente con sonido. Chrome/Safari pueden denegarlo si el sitio no tiene permiso o interacción previa. No se puede garantizar autoplay audible sin permiso desde JavaScript. Cuando ocurre `NotAllowedError`, se conserva la donación en curso y aparece «Reproducir agradecimiento con audio». No se sustituye por reproducción muda ni se pierde la cola. Se reutiliza el mismo elemento de video para las donaciones siguientes, lo que ayuda a conservar el permiso por elemento de Safari.

Referencias: https://developer.chrome.com/blog/autoplay/ y https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/

## Meta y celebración

Meta fija: **12,001**. `lib/goal.ts` calcula faltantes como `max(0,12001-total)` y avance visual como `min(100,total/12001*100)`. El total real se conserva al superar la meta. El contador y el medidor usan el total recibido por el polling existente, incluida su recuperación tras recarga.

A partir de 12,001, la pantalla adopta gradualmente el fondo rosa, muestra el mensaje permanente, ilumina el medidor y mantiene fuegos artificiales ligeros en canvas con `pointer-events:none`. No producen audio. Los intervalos se limpian al desmontar o bajar del umbral; se respetan las preferencias de movimiento reducido y se suspenden los lanzamientos con la pestaña oculta.

## Dashboard e informe

Sección **DASHBOARD** dentro de `/admin`, debajo del historial, tras autenticarse. Conserva el formulario actual. Incluye ocho indicadores, acumulados y última aportación por sede, barras por sede, evolución acumulada diaria en horario CDMX, progreso de meta y detalle completo de donantes y observaciones. Los donantes vacíos aparecen como Anónimo.

`GET /api/donations?all=1` devuelve todos los registros vigentes solo con autenticación, sin el límite previo de 100. La consulta sin parámetro sigue conservando su comportamiento anterior. El dashboard tiene páginas visuales de 50 registros; «Generar informe» imprime todos los registros, no solo la página visible. El diálogo de impresión del navegador permite guardar PDF.

Se reutiliza el mismo polling del administrador; no se creó un segundo sistema de sincronización. Los sondeos administrativos no se solapan. El mapa evita recrear marcadores si los datos no cambiaron. No se cambiaron sedes, coordenadas, logos, mapa base, conexiones, claves, variables de entorno ni esquema de base.

## Archivos

Modificados:

- `app/pantalla/page.tsx`, `app/admin/page.tsx`, `app/globals.css`.
- `app/api/donations/route.ts`.
- `components/DonationCelebration.tsx`, `components/DonationMap.tsx`.
- `package.json`, `package-lock.json` (dependencias de desarrollo para las pruebas; ninguna versión existente fue actualizada).

Creados:

- `components/PumaMap.tsx`, `components/GoalProgress.tsx`, `components/GoalCelebration.tsx`, `components/AdminDashboard.tsx`.
- `lib/goal.ts`, `lib/dashboard.ts`.
- Los dos videos indicados arriba.
- `tests/event-goal.test.mjs`, `tests/event-ui.test.tsx`, `tests/donations-api.test.tsx`, `vitest.config.ts`.
- Este informe.

El archivo no versionado `scripts/neon-setup.sql` ya existía antes de esta tarea y no fue modificado.

## Alcance de las pruebas

Se probaron registros exitosos y fallidos, reintento con el mismo ID, conservación de sede, cola de eventos sin dobles reproducciones, cierre único del MP4 y pausa de audio, ausencia de corte fijo, recuperación ante bloqueo del autoplay, Puma siempre silenciada, cálculo al llegar/superar/bajar de la meta, limpieza de efectos, dashboard con 125 registros y privacidad del endpoint.

Estas pruebas usan un DOM y respuestas de prueba aislados. No insertan donaciones en Neon, no envían correos y no cambian producción. La reproducción audiovisual real y la revisión responsive no se pudieron ejecutar en este entorno y continúan pendientes.
