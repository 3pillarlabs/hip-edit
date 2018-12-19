const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const cors = require('cors');

/**
 * Decorates the Express app with plugins.
 * @param {Object} app
 * @return {Object} decorated app
 */
module.exports = (app) => {
  app.use(cors());
  app.use(awsServerlessExpressMiddleware.eventContext());
  app.use((req, res, next) => {
    res.set('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  return app;
};
