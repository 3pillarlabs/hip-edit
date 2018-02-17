// API Server
import process from 'process';
import express from 'express';
import morgan from 'morgan';
import logger from './modules/logging';
import eventApp from './modules/events/controller';

const app = express();
app.use(morgan('combined'));
app.use('/events', eventApp);
app.listen(process.env.npm_package_config_server_port, () => {
  logger.info(`Hip Edit Server listening on http://localhost:${process.env.npm_package_config_server_port}`);
});
