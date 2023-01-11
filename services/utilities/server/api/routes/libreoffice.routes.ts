import express from 'express';
import { Auths } from '../../utils/auths';
import { LibreofficeControllers } from '../controllers';

// Files Class Object
let libreofficeController = new LibreofficeControllers()

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
//routes.use(authsHelper.isLoggedIn);

routes.get('/libreofficeUrl', libreofficeController.libreofficeUrl);

routes.get('/wopi/files/:fileId/:workspaceId', libreofficeController.checkFileInfo);

routes.get('/wopi/files/:fileId/:workspaceId/contents', libreofficeController.getFile);

routes.post('/wopi/files/:fileId/:workspaceId/contents', libreofficeController.putFile);
//routes.put('/wopi/files/:fileId/:workspaceId/contents', libreofficeController.putFile);


/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as libreofficeRoutes }