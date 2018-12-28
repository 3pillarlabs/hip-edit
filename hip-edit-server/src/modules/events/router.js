// @flow
// Events Controller
import express from 'express';
import logger from '../logging';
import EditorEventService from './service';
import {toObject} from '../app-error';

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
  * @return {express.Router} router
  */
  router(): express.Router {
    const router = express.Router();

    router.post('/', (req: express.Request, resp: express.Response) => {
      logger.debug(req.body);
      this.editorEventService.queue(req.body)
        .then(() => {
          resp.status(201).json({});
        })
        .catch((e: Error) => {
          resp.status(400).json(toObject(e));
        })
        .then(() => {
          resp.end();
        });
    });

    router.get('/', (req: express.Request, resp: express.Response) => {
      resp.end('[]');
    });

    return router;
  }
}
