# Cierre aprobado para publicación

La revisión visual fue aprobada por el usuario. Se retiró el servidor temporal de simulación fuera del repositorio y se detuvieron sus tres instancias locales. La aplicación conserva exclusivamente sus consultas reales existentes. No se modificaron variables, credenciales, Neon ni donaciones.

Lectura de producción antes del cierre: 50 toallas, 1 donación. Meta definitiva: 15,000. Build y TypeScript correctos; 18 pruebas aprobadas. Se conservan el diseño aprobado horizontal y vertical, la zona segura de la Puma, el video transparente y el audio existente.

# Toallatón UNAM 2026 · Revisión local del 5 de octubre

## Cambios actuales

- Título del mapa: **LA UNAM NOS UNE**.
- Meta única `DONATION_GOAL = 15000` en `lib/goal.ts`, compartida por pantalla, dashboard, informe, porcentajes, faltantes y celebración.
- Medidor público con META, LLEVAMOS, NOS FALTAN, porcentaje, degradado, brillo al aumentar e iconos discretos de toallas. Animación de cifras de 1.1 segundos; el contador principal conserva sus 1.4 segundos.
- Estado festivo permanente desde 15,000: fondo rosa/magenta, destellos, confeti, mensaje grande y total real cuando supera la meta. Se desactiva si vuelve a bajar del umbral.
- Última aportación más visible y donante cuando existe. La consulta de lectura de estadísticas incluye ahora el campo `donor`; no se alteró el registro de donaciones.
- Botón discreto para activar sonido y conservar la preferencia en sessionStorage. Se prepara el mismo elemento de video mediante interacción y se pausa inmediatamente fuera de una donación. Si el navegador deniega autoplay, aparece un botón pequeño de recuperación.
- Agradecimiento con overlay translúcido, Puma central y destellos/corazones discretos. Se cierra y pausa al terminar.

## Video transparente

Nuevo archivo: `public/videos/gracias-donacion-queen-transparente.webm`.

Se decodificó el MP4 original y se retiraron píxeles de fondo cuyo máximo RGB es 16/255, conectados al borde. Se retiraron también grandes bolsas cerradas de fondo entre extremidades, por debajo de la cabeza; se conservaron las zonas oscuras pequeñas para proteger ojos y contornos. Se revisaron fotogramas a 0, 4, 8, 12, 16, 20 y 22 segundos, además de una imagen extraída del WebM final y compuesta sobre fondo rosa. No se observa el rectángulo negro; ojos, cabeza, manos, brazos, uniforme, falda, piernas y zapatos permanecen visibles.

VP9 con alfa, codificación visual lossless, 868×1060, 24 fps, 552 fotogramas y pista de video de 23 segundos. Audio Queen convertido desde la pista original a Opus de 192 kb/s, sin filtros, ajustes de volumen ni desplazamientos. El audio decodificado contiene exactamente 1,104,000 muestras a 48 kHz (23 segundos). La correlación de señal confirma la alineación con el original. WebM informa 23.008 segundos de contenedor por el relleno de paquetes Opus; el contenido audiovisual útil conserva 23 segundos.

El MP4 original y `Puma_transparente_mapa.webm` no fueron modificados. La Puma permanente sigue silenciada, en loop y sin controles. La conversión se ejecutó con herramientas locales, sin nuevas dependencias del proyecto.

## Validación

- `npm test`: **18 pruebas aprobadas** (5 de Node y 13 de Vitest).
- `npm run build`: correcto.
- `npm run typecheck`: correcto.
- Verificados 14,999, 15,000 y 15,500; faltantes, porcentaje, total real, activación y reversión de celebración.
- Verificados dashboard e informe con meta 15,000 y 125 registros de prueba.
- Verificados cola sin duplicados, pausa/cierre de Queen, recuperación de autoplay, preferencia de sonido y Puma permanente silenciada.
- Pruebas aisladas de registro exitoso/fallido e historial privado; no se escribieron registros de prueba en Neon.
- `/pantalla` y `/admin` responden HTTP 200 localmente.

**Pendiente de validación visual en navegador real:** 1920×1080, tablet y móvil, así como reproducción audible completa con la política real del navegador. El proceso de Chrome automatizado fue terminado por el entorno antes de abrir una página. Las pruebas DOM y la inspección de fotogramas no se presentan como sustituto de estas comprobaciones. Los estilos incluyen ajustes para esos tamaños.

## Revisión local

- https://toallaton-unam.vercel.app/pantalla
- https://toallaton-unam.vercel.app/pantalla-vertical

El servidor local debe permanecer en ejecución. Pulse «Activar sonido de celebraciones» al preparar la pantalla. La preferencia no evade las políticas del navegador; permanece disponible la recuperación manual si todavía se bloquea el audio.

No se cambiaron conexión con Neon, variables, credenciales, sedes, coordenadas, rutas, logos ni formulario. El dashboard solo cambió en las cifras derivadas de la meta.

**No se realizó commit, push ni despliegue.**


## Ampliación: televisión vertical y celebración

Se creó `components/PublicScreen.tsx` extrayendo la pantalla existente, sin duplicar lógica de datos. `/pantalla` y la nueva `/pantalla-vertical` reutilizan este componente, el polling existente y todos los componentes de contador, mapa, sonido y celebración. La variante vertical usa una cuadrícula propia con contador/meta arriba, mapa central, última aportación y resumen abajo. Los estilos usan proporciones de viewport para 1080×1920, 900×1600 y 768×1366. Leaflet admite zoom fraccionario para ajustar el encuadre nacional al espacio disponible, sin cambiar sedes ni coordenadas.

La celebración incorpora entrada del número 15,000 (70% → 110% → 100%), brillo posterior, iconos iluminados secuencialmente, el mensaje «JUNTAS Y JUNTOS, LA UNAM LO HIZO POSIBLE», fuegos laterales más visibles y caída moderada de confeti. Un mismo canvas y dos intervalos acotados mantienen los efectos; se suspenden lanzamientos con pestaña oculta y se limpian al desmontar. Las nuevas aportaciones después de la meta generan una explosión adicional. El panel de cifras mantiene su azul institucional.

Durante la revisión, la simulación vivía fuera del repositorio, en el archivo temporal ahora eliminado `work/preview-meta-local.mjs`, escucha solo en loopback y bloquea todas las escrituras y llamadas a API real. Inyecta almacenamiento en memoria en las páginas de revisión para no persistir cifras simuladas. Ambas rutas muestran 15,250; se verificaron también 8,000, 14,999, 15,000, 16,000 y retorno a 8,000, y se restauró 15,250. No se escribieron datos en Neon. El video y su audio no se volvieron a modificar en esta ampliación.

Archivos de esta ampliación: `app/pantalla/page.tsx`, `app/pantalla-vertical/page.tsx` (nuevo), `components/PublicScreen.tsx` (nuevo), `components/DonationMap.tsx`, `components/GoalCelebration.tsx`, `components/GoalProgress.tsx`, `app/globals.css`, `tests/event-ui.test.tsx` y este informe. Continúan sin commit los cambios de la revisión anterior documentados arriba.

Build y TypeScript correctos. 18 pruebas automatizadas aprobadas, incluidas sincronización de estado en vertical, umbrales, retorno al estado normal y limpieza de los temporizadores de efectos. Las dos rutas de simulación devuelven HTTP 200 y un intento de escritura en el proxy devuelve 403 sin alcanzar la aplicación.

**Pruebas visuales pendientes:** 1920×1080, 1366×768, 1080×1920, 900×1600, 768×1366, 390×844 y 768×1024. Chrome automatizado volvió a finalizar antes de abrir páginas; no se afirma que se hayan comprobado ausencia de superposición/recortes ni reproducción audible en navegador real. Ambas vistas se abren para revisión manual local. No hubo commit, push ni despliegue.
