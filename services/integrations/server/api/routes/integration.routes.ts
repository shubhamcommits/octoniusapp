import express from 'express';
import { IntegrationController } from '../controllers'

const routes = express.Router();

const integrationFunctions = new IntegrationController();


routes.post('/notify',integrationFunctions.notify);

routes.post('/slack-webhook',integrationFunctions.slackWebhook);

routes.post('/slack-auth',integrationFunctions.authSlack);

routes.get('/is-slack-authenticated/:userID',integrationFunctions.isSlackAuth);

routes.delete('/disconnect-slack/:userID',integrationFunctions.disconnectSlack);

export { routes as integrationRoutes };