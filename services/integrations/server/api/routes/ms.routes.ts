import { NextFunction, Request, Response, Router } from 'express';
import { MSController } from '../controllers'
import { Auths } from '../../utils';
import { asyncHandler } from '../../utils/office';
import { copyFile, createEmptyFile, getDiscoveryInfo, getFileNames } from '../controllers/office/appMiddleware';
import { checkFileInfo, getFile, handleHeaders, putFile } from '../controllers/office/wopiMiddleware';

const routes = Router();

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

// calls for Office Integration
routes.post('/create/:file_id', asyncHandler(createEmptyFile));
routes.post('/add-file', asyncHandler(copyFile));
routes.get('/fileNames', asyncHandler(getFileNames));
routes.get('/discovery', asyncHandler(getDiscoveryInfo));

routes.route('/wopi/files/:file_id/contents').get(asyncHandler(getFile)).post(asyncHandler(putFile));
routes.route('/wopi/files/:file_id').get(asyncHandler(checkFileInfo)).post(asyncHandler(handleHeaders));
routes.route('/wopi/containers/*').all((req: Request, res: Response, next: NextFunction) => res.sendStatus(501));
routes.route('/wopi/ecosystem/*').all((req: Request, res: Response, next: NextFunction) => res.sendStatus(501));

export { routes as msRoutes };