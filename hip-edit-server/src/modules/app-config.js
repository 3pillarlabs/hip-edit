import process from 'process';

const AppConfig = {
  logLevel: (process.env.npm_package_config_logger_console_level || 'debug'),

  serverPort: (process.env.npm_package_config_server_port || 9000),

  messaging: {
    host: process.env.npm_package_config_messaging_host,
    port: process.env.npm_package_config_messaging_port,
  },
};

export default AppConfig;
