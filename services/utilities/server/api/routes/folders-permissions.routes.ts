import express from 'express';
import { Auths } from '../../utils/auths';
import { FoldersPermissionsControllers } from '../controllers';

// Files Class Object
let permissions = new FoldersPermissionsControllers()

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// PUT - Edit details of a folder on the basis of fileId
routes.put('/:folderId/selectPermissionRight', permissions.selectPermissionRight);

// PUT - Edit details of a folder on the basis of fileId
routes.put('/:folderId/removePermission', permissions.removePermission);

// PUT - Edit details of a folder on the basis of fileId
routes.put('/:folderId/addTagToPermission', permissions.addTagToPermission);

// PUT - Edit details of a folder on the basis of fileId
routes.put('/:folderId/removePermissionTag', permissions.removePermissionTag);

// PUT - Edit details of a folder on the basis of fileId
routes.put('/:folderId/addMemberToPermission', permissions.addMemberToPermission);

// PUT - Edit details of a folder on the basis of fileId
routes.put('/:folderId/removeMemberFromPermission', permissions.removeMemberFromPermission);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as foldersPermissionsRoutes }