# Guía de uso del material — Jardín de Mariposas

Los archivos fueron renombrados con nombres descriptivos, en minúsculas y separados por guiones para que sean más fáciles de mantener y usar en una web.

## Prioridad recomendada

### HERO PRINCIPAL
**Video:** `mariposa-flor-amarilla-hero-4k.mp4`
- Mejor candidato para el hero de escritorio.
- Es horizontal 16:9, 4K y tiene fondo suave.
- La mariposa y la flor transmiten inmediatamente la temática del sitio.
- Conviene comprimir una copia a 1080p/WebM antes de producción.

**Imagen de respaldo / portada:** `mariposa-azul-hoja-tropical.jpg`
- Es la fotografía más impactante del grupo.
- El azul crea un punto focal fuerte sobre el verde tropical.
- Útil como fallback del video, portada móvil, Open Graph o sección destacada.

**Hero móvil:** `mariposas-entre-hojas-vertical-4k.mp4`
- Formato vertical 9:16.
- Ideal para sustituir el video horizontal en pantallas móviles.
- No conviene usarlo como hero de escritorio porque obligaría a recortar demasiado.

## SECCIÓN “NUESTRAS MARIPOSAS” / ESPECIES DESTACADAS
- `mariposa-negra-amarilla-flor-roja.jpg`
  - Perfil claro de una mariposa sobre una flor roja.
  - Excelente para tarjeta de especie o bloque destacado.

- `mariposa-azul-pequena-flor-violeta.jpg`
  - Macro limpio y fondo suave.
  - Añade variedad de tamaño y color sin repetir el aspecto de la mariposa azul grande.

- `mariposa-azul-hoja-tropical.jpg`
  - También puede reutilizarse como la especie visualmente protagonista.

> Antes de mostrar nombres científicos o nombres de especie, conviene confirmar la identificación de cada mariposa. Los nombres de archivo se dejaron descriptivos para no afirmar una especie incorrecta.

## SECCIÓN “LA EXPERIENCIA” / “VIVE EL MARIPOSARIO”
**Video:** `mariposa-flores-tropicales-detalle.mp4`
- Plano cercano, vegetación y flores.
- Funciona mejor dentro de la página que como hero porque visualmente es más cargado.
- Puede acompañar texto sobre observar mariposas de cerca.

**Imagen:** `mariposa-cola-larga-volando-flores.jpg`
- Captura comportamiento y movimiento.
- Muy buena para comunicar que el visitante verá mariposas libres entre flores.

## SECCIÓN NATURALEZA / FLORA / POLINIZACIÓN
- `mariposa-sobre-flor-amarilla.jpg`
  - La relación mariposa-flor es muy clara.
  - Buena para una sección sobre plantas, alimentación, hábitat o conservación.

## GALERÍA
- `grupo-mariposas-naranjas-en-planta.jpg`
  - Vertical y con varias mariposas; aporta variedad a una galería tipo masonry.

- `mariposas-naranjas-fondo-natural.jpg`
  - Vertical, oscuro y elegante; útil para romper una galería llena de imágenes claras.

- `mariposas-naranjas-en-vuelo.jpg`
  - Imagen artística con movimiento.
  - Mejor como pieza visual/decorativa que como fotografía de identificación de especies.

## Orden visual sugerido en la landing

1. Hero — video de mariposa sobre flor amarilla.
2. Introducción — texto + mariposa azul sobre hoja tropical.
3. Nuestras mariposas — fotografías negra/amarilla, azul pequeña y azul grande.
4. La experiencia — video de mariposa entre flores + mariposa volando.
5. Naturaleza / conservación — mariposa sobre flor amarilla.
6. Galería — fotografías verticales y fotografía de vuelo.
7. Ubicación / contacto — aquí conviene usar una foto REAL del propio mariposario o de su entrada, no una foto de stock.

## Nota importante para producción
No cargues directamente los videos 4K tal como están en la web final. Conserva estos originales como fuente y crea versiones optimizadas:
- escritorio: 1920×1080
- móvil: 1080×1920
- MP4 H.264 y, si es posible, WebM
- sin audio si serán fondos automáticos
- `autoplay muted loop playsinline`

Esto reducirá mucho el tiempo de carga.
