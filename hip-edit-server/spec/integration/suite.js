import {newJasmineInstance} from './common';
import {logger} from '../../dist/modules/logging';
import {AppConfig} from '../../dist/modules/app-config';
import {app} from '../../dist/app';

const jasmine = newJasmineInstance();
const listenPort = AppConfig.serverPort;
app.listen(listenPort, () => {
  logger.info(`Hip Edit Server listening on http://localhost:${listenPort}`);
  logger.info('Running integration tests...');
  jasmine.execute();
});
