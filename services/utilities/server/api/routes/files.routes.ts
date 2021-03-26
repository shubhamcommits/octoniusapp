import express from 'express';
import { FilesControllers } from '../controllers/files.controllers';
import { groupFileUploader, groupFileDelete } from '../../utils/filehandlers/group.filehandler';

// Files Class Object
let files = new FilesControllers()

const routes = express.Router();

// POST - Handles the adding files inside a group
routes.post('/groups', groupFileUploader, files.add);

// GET - Fetches the files list
routes.get('/groups', files.get);

// GET - Search the files inside of a group
routes.get('/search', files.search);

// GET - Get details of a file on the basis of fileId
routes.get('/:fileId', files.getOne);

// PUT - Edit details of a file on the basis of fileId
routes.put('/:fileId', files.edit);

// DELETE - Delete the file on the basis of fileId
routes.delete('/:fileId', groupFileDelete, files.delete);

// POST - Handles the copy of a folio to a group
routes.post('/:fileId/copy-to-group', files.copy);

// PUT - Handles the move of a folio to a group
routes.put('/:fileId/move-to-group', files.move);

// PUT - Handles the move of a file to a folder
routes.put('/:fileId/move-to-folder', files.moveToFolder);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as filesRoutes }