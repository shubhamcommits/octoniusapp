import express from 'express';
import { FlamingoController } from '../controllers'
import { Auths } from '../../utils';

const routes = express.Router();

const flamingoFunctions = new FlamingoController();

const auths = new Auths();

routes.post('/create-form', auths.verifyToken, flamingoFunctions.createForm);

routes.get('/', auths.verifyToken, flamingoFunctions.get);


export { routes as flamingoRoutes };