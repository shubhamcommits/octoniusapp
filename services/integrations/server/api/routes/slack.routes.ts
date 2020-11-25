import express from 'express';
import { SlackController } from '../controllers'

const routes = express.Router();
const slackFunctions = new SlackController();


routes.get('/slack-notify',slackFunctions.slackNotify);

routes.post('/slack-webhook',slackFunctions.slackWebhook);

export { routes as slackRoutes };