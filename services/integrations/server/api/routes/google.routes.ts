import express from 'express';
import { Auths } from '../../utils';
import { GoogleController } from '../controllers';

const routes = express.Router();

// Define auths helper controllers
const auths = new Auths();

const googleController = new GoogleController();

// routes.get('/:workspaceId/googleUserInfoProperties', auths.verifyToken, auths.isLoggedIn, googleController.googleUserInfoProperties.bind(googleController));

routes.put('/:workspaceId/googleWorkspaceUsersInfo', auths.verifyToken, auths.isLoggedIn, googleController.googleWorkspaceUsersInfo.bind(googleController));

export { routes as googleRoutes };