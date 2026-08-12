'use strict';

const business = require('../config/business');

// Genera un enlace de WhatsApp correctamente codificado usando el teléfono
// principal del negocio. Nunca repetir URLs manualmente en las vistas.
function buildWhatsAppLink(message = business.whatsappDefaultMessage) {
  return `https://wa.me/${business.phones.primaryWa}?text=${encodeURIComponent(message)}`;
}

module.exports = {
  buildWhatsAppLink,
};
