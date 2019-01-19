import {AppConfig} from './app-config';
import {Logger, transports} from 'winston';

const logger = new Logger({
  transports: [
    new transports.Console({
      level: AppConfig.logLevel,
      colorize: true,
    }),
  ],
});

logger.cli();

export {logger};
