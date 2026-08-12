'use strict';

const business = require('../config/business');
const config = require('../config');
const { buildWhatsAppLink } = require('../utils/whatsapp');

// Expone a todas las vistas los datos del negocio y helpers de contacto.
function viewLocals(req, res, next) {
  res.locals.site = business;
  res.locals.config = {
    siteUrl: config.siteUrl,
    googleMapsUrl: config.googleMapsUrl,
  };
  res.locals.currentPath = req.path;
  res.locals.whatsapp = {
    primary: buildWhatsAppLink(),
    primaryHref: `tel:${business.phones.primaryTel}`,
    secondaryHref: `tel:${business.phones.secondaryTel}`,
  };
  next();
}

module.exports = viewLocals;
