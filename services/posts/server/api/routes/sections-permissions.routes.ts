import express from 'express';
import { Auths } from '../utils';
import { SectionsPermissionsControllers } from '../controllers';

// Files Class Object
let permissions = new SectionsPermissionsControllers()

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// PUT - Edit details of a section on the basis of fileId
routes.put('/:sectionId/selectPermissionRight', permissions.selectPermissionRight);

// PUT - Edit details of a section on the basis of fileId
routes.put('/:sectionId/removePermission', permissions.removePermission);

// PUT - Edit details of a section on the basis of fileId
routes.put('/:sectionId/addTagToPermission', permissions.addTagToPermission);

// PUT - Edit details of a section on the basis of fileId
routes.put('/:sectionId/removePermissionTag', permissions.removePermissionTag);

// PUT - Edit details of a section on the basis of fileId
routes.put('/:sectionId/addMemberToPermission', permissions.addMemberToPermission);

// PUT - Edit details of a section on the basis of fileId
routes.put('/:sectionId/removeMemberFromPermission', permissions.removeMemberFromPermission);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as sectionsPermissionsRoutes }