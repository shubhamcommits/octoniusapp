import express from 'express';
import { IntegrationController } from '../controllers'

const routes = express.Router();

const integrationFunctions = new IntegrationController();

routes.post('/notify',integrationFunctions.notify);

routes.post('/token',integrationFunctions.token);

routes.post('/refresh-token',integrationFunctions.refreshToken);

export { routes as integrationRoutes };