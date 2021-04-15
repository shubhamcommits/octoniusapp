import express from 'express';
import { FlamingoController } from '../controllers'
import { Auths } from '../../utils';

const routes = express.Router();

const flamingoFunctions = new FlamingoController();

const auths = new Auths();

routes.post('/create-flamingo', auths.verifyToken, flamingoFunctions.createFlamingo);

routes.post('/create-add-question', auths.verifyToken, flamingoFunctions.createAndAddQuestion);

routes.get('/', auths.verifyToken, flamingoFunctions.get);

routes.put('/question', auths.verifyToken, flamingoFunctions.updateQuestion);

routes.delete('/question', auths.verifyToken, flamingoFunctions.deleteAndRemoveQuestion);

export { routes as flamingoRoutes };