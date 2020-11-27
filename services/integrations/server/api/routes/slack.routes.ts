import express from 'express';
import { SlackController } from '../controllers'

const routes = express.Router();
const slackFunctions = new SlackController();


routes.post('/slack-notify',slackFunctions.slackNotify);

routes.post('/slack-webhook',slackFunctions.slackWebhook);

routes.post('/slack-auth',slackFunctions.authSlack);

export { routes as slackRoutes };