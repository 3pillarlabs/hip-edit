// API Server
import express from 'express';
import morgan from 'morgan';
import {json} from 'body-parser';
import codeEventsRoute from './modules/events/route';

const app = express();
app.use(morgan('tiny'));
app.use(json());
codeEventsRoute(app);

export default app;
