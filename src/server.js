'use strict';

const config = require('./config');
const business = require('./config/business');
const { createApp } = require('./app');

const app = createApp();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console -- banner de arranque del proceso
  console.log(`[startup] ${business.name} · modo ${config.env} · http://localhost:${config.port}`);
});
