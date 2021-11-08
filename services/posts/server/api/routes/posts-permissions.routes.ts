import express from 'express';
import { PostsPermissionsControllers } from '../controllers';
import { Auths } from '../utils';

// Posts Class Object
let permissions = new PostsPermissionsControllers()

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// PUT - Edit details of a post on the basis of postId
routes.put('/:postId/selectPermissionRight', permissions.selectPermissionRight);

// PUT - Edit details of a post on the basis of postId
routes.put('/:postId/removePermission', permissions.removePermission);

// PUT - Edit details of a post on the basis of postId
routes.put('/:postId/addTagToPermission', permissions.addTagToPermission);

// PUT - Edit details of a post on the basis of postId
routes.put('/:postId/removePermissionTag', permissions.removePermissionTag);

// PUT - Edit details of a post on the basis of postId
routes.put('/:postId/addMemberToPermission', permissions.addMemberToPermission);

// PUT - Edit details of a post on the basis of postId
routes.put('/:postId/removeMemberFromPermission', permissions.removeMemberFromPermission);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as postsPermissionsRoutes }