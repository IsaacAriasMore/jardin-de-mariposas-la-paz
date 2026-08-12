# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Node.js + Express 4 + EJS (MVC, aprobado en Fase 1). CSS nativo con tokens OKLCH, JavaScript vanilla, sin framework frontend ni paso de build. MySQL previsto para fases futuras.

## Users

- Familias y visitantes nacionales de Costa Rica (salidas de fin de semana desde el Valle Central).
- Amantes de la naturaleza y la fotografía.
- Turistas internacionales interesados en turismo de naturaleza.
- Grupos escolares y educativos: no priorizados por ahora (confirmado por el dueño).

## Product Purpose

Ser la presencia digital oficial del mariposario. Ayudar a descubrir el lugar, entender qué tipo de espacio es, despertar el interés por visitarlo, contactar por WhatsApp, encontrar cómo llegar y conocer horarios; a largo plazo, acercar contenido educativo y SEO. Éxito en esta versión: presencia creíble y contacto efectivo, ambos por igual (confirmado por el dueño).

## Positioning

Un mariposario rural real en Bajo La Paz, San Ramón (Alajuela, Costa Rica), donde las mariposas viven en vuelo libre entre plantas y flores. La fotografía y el video reales son el producto; una web de turismo de naturaleza hecha con criterio editorial, no una plantilla turística.

## Operating Context

- Ubicación: Bajo La Paz, San Ramón, Alajuela, Costa Rica. Referencia: 200 metros sureste de la Escuela/Liceo Arredondo Blanco. Plus Code: `5F36+VVC`.
- Horario: lunes a viernes 8:00 a. m. – 5:00 p. m.; sábado 8:00 a. m. – 12:00 m.; domingo cerrado.
- Teléfono/WhatsApp principal: +506 8889-4483. Secundario: +506 8880-3433.
- Precio de entrada: "Consultar por WhatsApp" (decisión confirmada; no publicar tarifas).
- Redes: Facebook `facebook.com/mariposaslapaz` (única red confirmada).
- Entorno asociado a la marca: naturaleza, paisaje rural, biodiversidad, bosque nuboso, San Ramón, turismo natural.

## Capabilities and Constraints

- Sitio informativo público, sin autenticación. WhatsApp como canal de contacto principal (helper único de enlaces `wa.me`).
- Sin base de datos en esta etapa. Ruta `/guias` reservada sin contenido (confirmado: no crear artículos).
- No inventar: especies (la identificación científica está pendiente), testimonios, premios, estadísticas, datos históricos o biológicos.
- Dominio definitivo pendiente de compra; provisional `jardindemariposaslapaz.com`. Enlace de Google Maps desacoplado (`GOOGLE_MAPS_URL`), provisionalmente el Plus Code.
- SEO desacoplado por página (title, description, canonical, OG, sitemap, robots).

## Brand Commitments

- Nombre oficial: "Jardín de Mariposas La Paz".
- Idea editorial: **"Donde la naturaleza cobra alas."**
- Personalidad: natural, auténtica, humana, serena, cálida, tropical, editorial, cuidada, local, costarricense.
- No debe sentirse: corporativa, tecnológica, artificial, genérica, lujosa de forma ostentosa, infantil ni como plantilla turística.
- La fotografía y el video reales son protagonistas; el diseño los acompaña sin competir.
- Sin colores "tecnológicos" (morados/gradientes) ni estética SaaS.

## Evidence on Hand

- 8 fotografías y 3 videos 4K en `Fotos/` y `Videos/` (masters; mapeo en `MAPEO-NOMBRES-ORIGINALES.txt`, uso recomendado en `GUIA-DE-USO.md`).
- Datos oficiales del negocio en `src/config/business.js`.
- Ausencias que no deben rellenarse: especies identificadas, testimonios, premios, precios específicos, materiales físicos del negocio (folletos/QR).

## Product Principles

1. El material real manda; el diseño es un soporte editorial silencioso.
2. Nada inventado: especies, cifras, premios y testimonios solo cuando existan.
3. El contacto por WhatsApp es el corazón de la conversión; siempre a un toque.
4. Editorial, cálida y rural costarricense, nunca plantilla.
5. Rendimiento y accesibilidad sin excusas: sitio liviano, legible y usable, también en móviles y zonas de señal limitada.

## Accessibility & Inclusion

Web pública en español (Costa Rica). Se mantiene un estándar WCAG AA: contraste, navegación por teclado, focus visible, alt descriptivos, `prefers-reduced-motion`.
