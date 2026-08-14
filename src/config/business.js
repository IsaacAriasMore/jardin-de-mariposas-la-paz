'use strict';

// Única fuente de verdad de los datos del negocio.
// Las vistas y los enlaces de contacto se generan a partir de estos datos.

module.exports = {
  name: 'Jardín de Mariposas La Paz',
  shortName: 'Mariposario La Paz',
  tagline: 'Mariposario en Bajo La Paz, San Ramón, Costa Rica',
  location: {
    address: 'Bajo La Paz, San Ramón, Alajuela, Costa Rica',
    reference: '200 metros sureste de la Escuela/Liceo Arredondo Blanco',
    plusCode: '5F36+VVC, Bajo La Paz, San Ramón, Alajuela 20201, Costa Rica',
    locality: 'San Ramón',
    region: 'Alajuela',
    postalCode: '20201',
    country: 'CR',
  },
  phones: {
    // Formato visual para mostrar en la web
    primary: '+506 8889-4483',
    secondary: '+506 8880-3433',
    // Solo dígitos, para wa.me y tel:
    primaryWa: '50688894483',
    primaryTel: '+50688894483',
    secondaryTel: '+50688803433',
  },
  contact: {
    email: 'ojardindemariposaslapaz@gmail.com',
    siteResponsibles: ['Warner Jesus Arias Mesen', 'Irma Iris Morera Elizondo'],
  },
  hours: [
    { days: 'Lunes a viernes', time: '8:00 a. m. – 5:00 p. m.' },
    { days: 'Sábado', time: '8:00 a. m. – 12:00 m.' },
    { days: 'Domingo', time: 'Consultar disponibilidad', timeKey: 'availability' },
  ],
  facebookUrl: 'https://www.facebook.com/mariposaslapaz/',
  priceNote: 'Consultar por WhatsApp',
  whatsappDefaultMessage: '¡Hola! Quisiera información sobre Jardín de Mariposas La Paz.',
  // Visitas guiadas: información confirmada. NO se inventan duraciones,
  // tamaños de grupo, precios, reservas, métodos de pago ni horarios especiales.
  guidedVisits: {
    available: true,
    audiences: [
      'Preescolar y kínder',
      'Escuelas',
      'Grupos educativos',
      'Personas adultas',
      'Personas adultas mayores',
      'Visitantes de distintas edades',
    ],
    languages: ['Español', 'Inglés'],
    // Credencial confirmada por el cliente. NO se inventan duración, tamaño de
    // grupo, precios, reservas, métodos de pago ni horarios especiales.
    guideCredential: 'Guía certificado por el ICT',
  },
};
