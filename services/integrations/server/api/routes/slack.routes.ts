import express from 'express';
import { SlackController } from '../controllers'

const routes = express.Router();

const slackFunctions = new SlackController();

routes.post('/slack-webhook',slackFunctions.slackWebhook);

routes.post('/slack-auth',slackFunctions.authSlack);

routes.get('/is-slack-authenticated/:userID',slackFunctions.isSlackAuth);

routes.delete('/disconnect-slack/:userID',slackFunctions.disconnectSlack);

export { routes as slackRoutes };