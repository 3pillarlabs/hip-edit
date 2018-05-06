import topicServiceFactory from '../messaging/factory';
import EditorEventService from './service';
import CodeEventsRouter from './controller';
import AppConfig from '../app-config';

/**
 * Mounts the Express app with prefix
 * @param {Object} app
 */
export default function _codeEventsRoute(app) {
  const editorEventService = new EditorEventService(topicServiceFactory(AppConfig.messaging));
  const codeEventsRouter = new CodeEventsRouter(editorEventService);
  app.use('/events', codeEventsRouter.router());
}
