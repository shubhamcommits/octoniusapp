import express from 'express';
import { ZapierController } from '../controllers'
import { Auths } from '../../utils';

const routes = express.Router();

const zapierFunctions = new ZapierController();

// Define auths helper controllers
const auths = new Auths();

routes.post('/auth',zapierFunctions.auth);

routes.post('/subs-webhook', auths.verifyToken ,zapierFunctions.subscribeTrigger);

routes.delete('/unsubs-webhook',auths.verifyToken, zapierFunctions.unSubscribeTrigger);

export { routes as zapierRoutes };