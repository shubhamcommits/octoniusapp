import express from 'express';
import { Auths } from '../../utils/auths';
import { FilesPermissionsControllers } from '../controllers';

// Files Class Object
let permissions = new FilesPermissionsControllers()

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// PUT - Edit details of a file on the basis of fileId
routes.put('/:fileId/selectPermissionRight', permissions.selectPermissionRight);

// PUT - Edit details of a file on the basis of fileId
routes.put('/:fileId/removePermission', permissions.removePermission);

// PUT - Edit details of a file on the basis of fileId
routes.put('/:fileId/addTagToPermission', permissions.addTagToPermission);

// PUT - Edit details of a file on the basis of fileId
routes.put('/:fileId/removePermissionTag', permissions.removePermissionTag);

// PUT - Edit details of a file on the basis of fileId
routes.put('/:fileId/addMemberToPermission', permissions.addMemberToPermission);

// PUT - Edit details of a file on the basis of fileId
routes.put('/:fileId/removeMemberFromPermission', permissions.removeMemberFromPermission);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as filesPermissionsRoutes }