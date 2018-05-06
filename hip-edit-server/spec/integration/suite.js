import Jasmine from 'jasmine';
import logger from '../../dist/modules/logging';
import AppConfig from '../../dist/modules/app-config';
import app from '../../dist/app';

const listenPort = AppConfig.serverPort;
app.listen(listenPort, () => {
  logger.info(`Hip Edit Server listening on http://localhost:${listenPort}`);
  logger.info('Running integration tests...');
  const jasmine = new Jasmine();
  jasmine.loadConfigFile('spec/support/jasmine-integration.json');
  jasmine.execute();
});
