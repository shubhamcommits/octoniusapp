import express from 'express';
import { IntegrationController } from '../controllers'

const routes = express.Router();

const integrationFunctions = new IntegrationController();

routes.post('/notify',integrationFunctions.notify);

export { routes as integrationRoutes };