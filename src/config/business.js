'use strict';

// Única fuente de verdad de los datos del negocio.
// Las vistas y los enlaces de contacto se generan a partir de estos datos.

module.exports = {
  name: 'Jardín de Mariposas La Paz',
  shortName: 'Mariposas La Paz',
  tagline: 'Mariposario en Bajo La Paz, San Ramón, Costa Rica',
  location: {
    address: 'Bajo La Paz, San Ramón, Alajuela, Costa Rica',
    reference: '200 metros sureste de la Escuela/Liceo Arredondo Blanco',
    plusCode: '5F36+VVC, Bajo La Paz, San Ramón, Alajuela 20201, Costa Rica',
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
  hours: [
    { days: 'Lunes a viernes', time: '8:00 a. m. – 5:00 p. m.' },
    { days: 'Sábado', time: '8:00 a. m. – 12:00 m.' },
    { days: 'Domingo', time: 'Cerrado' },
  ],
  facebookUrl: 'https://www.facebook.com/mariposaslapaz/',
  priceNote: 'Consultar por WhatsApp',
  whatsappDefaultMessage: '¡Hola! Quisiera información sobre Jardín de Mariposas La Paz.',
  // Menú principal: la marca ya enlaza a "/" y "Guías" queda reservado sin
  // enlace hasta que exista contenido real.
  navigation: [
    { label: 'Nuestro Mariposario', href: '/nuestro-mariposario' },
    { label: 'Mariposas', href: '/mariposas' },
    { label: 'Experiencia', href: '/experiencia' },
    { label: 'Conservación', href: '/conservacion' },
    { label: 'Galería', href: '/galeria' },
    { label: 'Visítanos', href: '/visitanos' },
  ],
};
