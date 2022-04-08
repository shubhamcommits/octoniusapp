import express from 'express';
import { Auths } from '../../utils';
import { LdapController } from '../controllers';

const routes = express.Router();

// Define auths helper controllers
const auths = new Auths();

const ldapController = new LdapController();

routes.get('/:workspaceId/ldapUserInfoProperties', auths.verifyToken, auths.isLoggedIn, ldapController.ldapUserInfoProperties);

routes.put('/:workspaceId/ldapWorkspaceUsersInfo', auths.verifyToken, auths.isLoggedIn, ldapController.ldapWorkspaceUsersInfo);

export { routes as ldapRoutes };