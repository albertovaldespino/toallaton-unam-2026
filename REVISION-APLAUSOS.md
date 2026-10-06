# Revisión local: agradecimiento con aplausos · 6 octubre 2026

Se sustituyó el único src del reproductor compartido por `/videos/Toallaton_Gracias_Puma_Aplausos_CORREGIDO.webm`. No hay referencias a Queen ni a audio adicional en los componentes activos. Los archivos históricos no se borraron. Producción no se ha actualizado: esta revisión no tiene commit, push ni despliegue.

El archivo es una copia exacta (SHA-256 db20944144c513b1499b5eacbc28fdf066e87589fdf79e3e80bd307a77b46816). VP9 con alfa, 1024×800, 24 fps, Opus estéreo 48 kHz, 1,165,439 bytes, contenedor 5.048 s. No se alteró audio, volumen, duración ni imagen. Se verificó alfa real componiendo un fotograma decodificado sobre azul: no aparece rectángulo de fondo, pero hay huecos transparentes en la cara ya presentes en el adjunto. Se conserva exactamente como fue proporcionado.

Se eliminó la tarjeta HTML de agradecimiento y se mantiene un único elemento video precargado y reutilizado. A los 600 ms de detectar cada evento aparece mediante transform/opacity; ended pausa el audio e inicia salida de 300 ms. La cola existente continúa después. El botón de sonido conserva preferencia de sesión. Si autoplay es denegado se muestra recuperación durante 15 segundos; al no intervenir, se cierra ese intento para no bloquear la cola. No se sustituye por otro audio ni se reproduce en mute el agradecimiento.

La Puma permanente permanece visible en su posición aprobada; solo pausa mientras se reproduce efectivamente el agradecimiento y reanuda en mute conservando el fotograma. El contador pulsa brevemente y continúa el medidor actual; se muestra la etiqueta AVANCE. La celebración permanente de meta no cambió.

Efectos individuales: 24 piezas de confeti (4.4 s más retardos), 4 destellos CSS y 2 fuegos de 8 rayos: 44 elementos gráficos, con dos contenedores de fuego. Solo transform/opacity animados, sin canvas nuevo, sin intervalos de partículas, destruidos al finalizar. Efectos a los extremos y detrás del video. Video contain, hasta 65dvh horizontal/55dvh vertical, limitado por el mapa y el ancho disponible. No se recorta el archivo ni se superpone texto HTML a su mensaje.

Validación: build y TypeScript correctos; 21 pruebas aprobadas (5 Node +16 Vitest). Cinco eventos en cola, un solo elemento video estable, cinco llamadas de reproducción, total real de prueba 17,500, partículas eliminadas tras cada ended. Verificados bloqueo de autoplay, pausa/reanudación silenciosa de Puma, metadatos y hash del video. Estas son pruebas de lógica y archivo; no demuestran ausencia de congelamientos en hardware real.

Preparadas comprobaciones de viewport 1920×1080, 1366×768, 1280×720, 1080×1920, 900×1600 y 768×1366 en `work/aplausos/responsive.cjs` (fuera del repositorio). Chrome fue terminado por el entorno antes de iniciar, de modo que la revisión responsive, reproducción audible y rendimiento real siguen pendientes.

Comparación: 1.17 MB frente a unos 79 MB del Queen transparente (98.5% menos transferencia). 5 s frente a 23 s. Sin canvas para la donación individual y con pausa de la Puma permanente. No se afirma una medición de FPS/CPU en televisión.

Vistas de revisión: http://localhost:3231/pantalla y http://localhost:3231/pantalla-vertical. Activar sonido y usar los botones locales Simular 1 donación, Simular 5 donaciones o Probar sobre meta. Proxy temporal `work/aplausos/preview.mjs` fuera del repositorio; datos y almacenamiento solo en memoria, endpoints reales bloqueados. Desactivar/eliminar antes de publicación. No se consultó ni escribió Neon, ni se cambiaron variables, credenciales, sedes, coordenadas, formulario o dashboard.
