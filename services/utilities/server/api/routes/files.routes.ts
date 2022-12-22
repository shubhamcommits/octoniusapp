import express from 'express';
import { FilesControllers } from '../controllers/files.controllers';
import { groupFileUploader, groupFileDelete } from '../../utils/filehandlers';
import { Auths } from '../../utils/auths';

// Files Class Object
let files = new FilesControllers()

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// POST - Handles the adding files inside a group
routes.post('/groups', groupFileUploader, files.add);

// GET - Fetches the files list
routes.get('/groups', files.get);

// GET - Fetches the files list
routes.get('/filter', files.getFilter);

// GET - Fetches the campaign files list
routes.get('/groups/campaign', files.getCampaignFile);

// GET - Search the files inside of a group
routes.get('/search', files.search);

// GET - Get details of a file on the basis of fileId
routes.get('/:fileId', files.getOne);

// GET - Get all the versions of a file on the basis of fileId
routes.get('/:fileId/fileVersions', files.getFileVersions);

// GET - Get the last version of a file on the basis of fileId
routes.get('/:fileId/lastVersion', files.getFileLastVersion);

// GET - Get full path string to ther file on the basis of fileId
routes.get('/:fileId/fullPathString', files.getPathToFile);

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

// -| CUSTOM FIELDS |-
// PUT - Change custom field value
routes.put('/:fileId/customField', files.saveCustomField);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as filesRoutes }