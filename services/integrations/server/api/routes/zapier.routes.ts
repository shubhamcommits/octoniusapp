import express from 'express';
import { ZapierController } from '../controllers'

const routes = express.Router();

const zapierFunctions = new ZapierController();

routes.post('/auth',zapierFunctions.auth);

export { routes as zapierRoutes };