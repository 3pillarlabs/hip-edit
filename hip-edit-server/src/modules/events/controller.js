// @flow
// Events Controller

import express from 'express';
const router = express.Router();

router.post('/', (req, resp) => {
  resp.status('201');
  resp.end('{ id: \'er345\' }');
});

router.get('/', (req, resp) => {
  resp.end('[]');
});

export default router;
