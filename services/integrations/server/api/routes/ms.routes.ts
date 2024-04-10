import express from 'express';
import { MSController } from '../controllers'
import { Auths } from '../../utils';

const routes = express.Router();

const msFunctions = new MSController();

// Define auths helper controllers
const auths = new Auths();

routes.get('/auth', auths.verifyToken, auths.isLoggedIn, msFunctions.authMS365);

routes.get('/token', auths.verifyToken, auths.isLoggedIn, msFunctions.getMS365Token);

routes.post('/token', auths.verifyToken, auths.isLoggedIn, msFunctions.addMS365Token);

routes.post('/subscribe-to-mail', auths.verifyToken, auths.isLoggedIn, msFunctions.subscribeToMails);

routes.post('/remove-mail-subscription', auths.verifyToken, auths.isLoggedIn, msFunctions.removeMailSubscription);

routes.post('/listen', msFunctions.listenWebhook);

routes.post('/lifecycle', msFunctions.lifecycleWebhook);

routes.get('/search', auths.verifyToken, auths.isLoggedIn, msFunctions.searchFiles);

routes.post('/revokeToken', auths.verifyToken, auths.isLoggedIn, msFunctions.disconnectMS365Cloud);

// routes.post('/callback', msFunctions.callback);

export { routes as msRoutes };