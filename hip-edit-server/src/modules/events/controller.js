// @flow
// Events Controller
import express from 'express';
import logger from '../logging';
import EditorEventService from './service';

/**
* Router for processing CodeEvent
*/
export default class CodeEventsRouter {
  editorEventService: EditorEventService;

  /**
   * @param {EditorEventService} editorEventService
   */
  constructor(editorEventService: EditorEventService) {
    this.editorEventService = editorEventService;
  }
  /**
  * @return {Object} router
  */
  router() {
    const router = express.Router();

    router.post('/', (req, resp) => {
      logger.debug(req.body);
      this.editorEventService.queue(req.body)
        .then(() => {
          resp.status('201');
        })
        .catch((e) => {
          resp.status('400');
        })
        .then(() => {
          resp.end();
        });
    });

    router.get('/', (req, resp) => {
      resp.end('[]');
    });

    return router;
  }
}
