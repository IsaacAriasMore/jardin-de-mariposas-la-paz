'use strict';

const config = require('../config');
const business = require('../config/business');

// URL absoluta basada en SITE_URL (desacoplada del dominio definitivo).
function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${config.siteUrl}${clean}`;
}

// Construye el objeto de metadata SEO por página (title, description,
// canonical, Open Graph). Las vistas lo consumen vía el partial head.
function buildPageMeta({
  title,
  description,
  path = '/',
  locale = 'es',
  alternatePaths = null,
  ogImage = '/media/img/mariposa-azul-hoja-tropical-1920.jpg',
  noindex = false,
}) {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes(business.name) ? title : `${title} · ${business.name}`;

  return {
    title: fullTitle,
    description,
    canonical,
    robots: noindex ? 'noindex, follow' : 'index, follow',
    alternates: alternatePaths
      ? {
          es: absoluteUrl(alternatePaths.es),
          en: absoluteUrl(alternatePaths.en),
          xDefault: absoluteUrl(alternatePaths.es),
        }
      : null,
    og: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'es_CR',
      alternateLocale: locale === 'en' ? 'es_CR' : 'en_US',
      siteName: business.name,
      title: fullTitle,
      description,
      url: canonical,
      ...(ogImage
        ? {
            image: absoluteUrl(ogImage),
            imageWidth: 1920,
            imageHeight: 1080,
            imageAlt: business.tagline,
          }
        : {}),
    },
  };
}

// --- LocalBusiness structured data ---------------------------------------
// Datos de negocio: ÚNICAMENTE lo confirmado en business.js + config.
// No se inventan coordenadas, precios, email ni servicios. El Plus Code
// (5F36+VVC) no forma parte del esquema porque schema.org no lo define.

// Etiqueta de días (business.hours[].days) -> dayOfWeek de schema.org.
const DAY_GROUP_TO_SCHEMA = {
  'Lunes a viernes': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  Sábado: ['Saturday'],
  Domingo: ['Sunday'],
};

// "8:00 a. m." | "5:00 p. m." | "12:00 m." -> ISO 24h ("08:00", "17:00", "12:00").
function toISO24(timeStr) {
  const meridiem = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*([ap])\.?\s*m\.?$/i);
  if (meridiem) {
    let hours = Number(meridiem[1]);
    const minutes = meridiem[2];
    const period = meridiem[3].toLowerCase();
    if (period === 'p' && hours < 12) hours += 12;
    if (period === 'a' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  const noon = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*m\.?$/i);
  if (noon) return `${String(Number(noon[1])).padStart(2, '0')}:${noon[2]}`;
  return null;
}

function buildOpeningHoursSpecifications() {
  const specs = [];
  for (const slot of business.hours) {
    if (slot.time.toLowerCase().includes('cerrado')) continue;
    const [open, close] = slot.time
      .split(/\s*[-–—]\s*/)
      .slice(0, 2)
      .map(toISO24);
    const dayOfWeek = DAY_GROUP_TO_SCHEMA[slot.days];
    if (!dayOfWeek || !open || !close) continue;
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek,
      opens: open,
      closes: close,
    });
  }
  return specs;
}

// Esquema LocalBusiness para /visitanos. canonical/description/image se pasan
// desde el controlador (metadata ya validada); el resto sale de business.js.
function buildLocalBusinessSchema({ canonical, description, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description,
    url: canonical,
    ...(image ? { image } : {}),
    telephone: business.phones.primaryTel,
    hasMap: config.googleMapsUrl,
    sameAs: [business.facebookUrl],
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.location.locality,
      addressRegion: business.location.region,
      postalCode: business.location.postalCode,
      addressCountry: business.location.country,
    },
    openingHoursSpecification: buildOpeningHoursSpecifications(),
  };
}

module.exports = {
  absoluteUrl,
  buildPageMeta,
  buildLocalBusinessSchema,
  serializeJsonLd: (value) =>
    JSON.stringify(value)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029'),
};
