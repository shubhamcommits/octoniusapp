import express from 'express';
import { FlamingoController } from '../controllers'
import { Auths ,flamingoFileHandler} from '../../utils';

const routes = express.Router();

const flamingoFunctions = new FlamingoController();

const auths = new Auths();

routes.post('/create-flamingo', auths.verifyToken, auths.isLoggedIn, flamingoFunctions.createFlamingo);

routes.post('/create-add-question', auths.verifyToken, auths.isLoggedIn, flamingoFunctions.createAndAddQuestion);

routes.get('/', auths.verifyToken, auths.isLoggedIn, flamingoFunctions.get);

routes.put('/publish', auths.verifyToken, auths.isLoggedIn, flamingoFunctions.publish);

routes.put('/question/image', auths.verifyToken, auths.isLoggedIn, flamingoFileHandler , flamingoFunctions.updloadQuestionImage);

routes.put('/question', auths.verifyToken, auths.isLoggedIn, flamingoFunctions.updateQuestion);

routes.delete('/question', auths.verifyToken, auths.isLoggedIn, flamingoFunctions.deleteAndRemoveQuestion);

routes.put('/submit', flamingoFunctions.submit);

export { routes as flamingoRoutes };