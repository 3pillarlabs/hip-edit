import {Logger, transports} from 'winston';

const logger = new Logger({
  transports: [
    new transports.Console({
      level: process.npm_package_config_logger_console_level,
      colorize: true,
    }),
  ],
});

logger.cli();
export default logger;
