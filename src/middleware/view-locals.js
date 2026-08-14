'use strict';

const business = require('../config/business');
const config = require('../config');
const { buildWhatsAppLink } = require('../utils/whatsapp');
const { getTranslator } = require('../i18n');
const {
  PAGE_DEFS,
  footerPages,
  getLocaleFromPath,
  getPageByPath,
  getPath,
  navigationPages,
} = require('../i18n/paths');

// Expone a todas las vistas los datos del negocio y helpers de contacto.
function viewLocals(req, res, next) {
  const locale = getLocaleFromPath(req.path);
  const t = getTranslator(locale);
  const matchedPage = getPageByPath(req.path);
  const pageKey = matchedPage ? matchedPage[0] : 'home';
  const localizedHours = business.hours.map((slot, index) => ({
    ...slot,
    days: t(`hours.${['weekday', 'saturday', 'sunday'][index]}`),
  }));

  res.locals.site = business;
  res.locals.config = {
    siteUrl: config.siteUrl,
    googleMapsUrl: config.googleMapsUrl,
    googleMapsDirectionsUrl: config.googleMapsDirectionsUrl,
  };
  res.locals.currentPath = req.path;
  res.locals.locale = locale;
  res.locals.pageKey = pageKey;
  res.locals.t = t;
  res.locals.paths = Object.fromEntries(
    Object.keys(PAGE_DEFS).map((key) => [key, getPath(key, locale)]),
  );
  res.locals.alternatePaths = matchedPage ? matchedPage[1].paths : null;
  res.locals.navigation = navigationPages.map((page) => ({
    page,
    href: getPath(page, locale),
    label: t(`nav.${page}`),
  }));
  res.locals.footerNavigation = footerPages.map((page) => ({
    page,
    href: getPath(page, locale),
    label: t(`nav.${page}`),
  }));
  res.locals.localizedHours = localizedHours;
  res.locals.preloadHero = false;
  res.locals.whatsapp = {
    primary: buildWhatsAppLink(t('business.whatsappMessage')),
    primaryHref: `tel:${business.phones.primaryTel}`,
    secondaryHref: `tel:${business.phones.secondaryTel}`,
  };
  next();
}

module.exports = viewLocals;
