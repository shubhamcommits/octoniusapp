import express from 'express';
import { FilesControllers } from '../controllers/files.controllers';
import { groupFileUploader } from '../../utils/filehandlers/group.filehandler';

// Files Class Object
let files = new FilesControllers()

const routes = express.Router();

// POST - Handles the adding files inside a group
routes.post('/groups/', groupFileUploader, files.add);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as filesRoutes }