// API Server
import AppConfig from './modules/app-config';
import logger from './modules/logging';
import app from './app';

app.listen(AppConfig.serverPort, () => {
  logger.info(`Hip Edit Server listening on http://localhost:${AppConfig.serverPort}`);
});
