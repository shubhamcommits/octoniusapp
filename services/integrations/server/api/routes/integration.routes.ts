import express from 'express';
import { IntegrationController } from '../controllers'
import { Auths } from '../../utils';

const routes = express.Router();

const integrationFunctions = new IntegrationController();

// Define auths helper controllers
const auths = new Auths();

routes.post('/notify',integrationFunctions.notify);

routes.post('/token',integrationFunctions.token);

routes.post('/refresh-token',integrationFunctions.refreshToken);

routes.get('/new-task',auths.verifyToken,integrationFunctions.newTask);

export { routes as integrationRoutes };