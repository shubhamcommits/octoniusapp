import express from 'express';
import { LibraryController } from '../controllers';
import { Auths, collectionFileUploader, collectionUploadFileUpload, pageFileUploader } from '../../utils';

const routes = express.Router();
const library = new LibraryController();

// Auths Helper Function
const authsHelper = new Auths();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// GET - Get collection based on the collectionId
routes.get('/collection/:collectionId', library.getCollection);

// GET - Get all  collections by groups
routes.get('/collection/:groupId/by-group', library.getCollectionsByGroup);

// GET - Get all  collection by page
routes.get('/collection/:pageId/by-page', library.getCollectionByPage);

// POST - Create new collection in the group
routes.post('/create-collection', library.createCollection);

// PUT - Updates the collection property
routes.put('/collection/:collectionId', library.updateCollection);

// DELETE - Removes the collection from the database
routes.delete('/collection/:workspaceId/:collectionId', library.removeCollection);

// PUT - Updates the collection property
routes.put('/collection/:collectionId/content', library.updateCollectionContent);

// // PUT - Change the Collection Image
routes.put('/collection/:collectionId/updateCollectionImage/:workspaceId', collectionUploadFileUpload, library.updateCollectionImage);

// POST - Create new page in the collection
routes.post('/collection/:collectionId/files/:workspaceId', collectionFileUploader, library.addCollectionFile);

// PUT - Delete a file from a page
routes.put('/collection/:fileId/remove-file/:workspaceId', library.removeCollectionFile);

// GET - Get all user´s confluence spaces
routes.get('/collection/:workspaceId/confluence-spaces', library.getUserConfluenceSpaces);

// GET - Export selected confluence spaces
routes.post('/collection/:workspaceId/export-spaces/:groupId', library.exportConfluenceSpaces);

// POST - Create new page in the collection
routes.post('/page/:collectionId', library.createPage);

// GET - Get all  collections by groups
routes.get('/page/:pageId', library.getPage);

// DELETE - Removes the collection from the database
routes.delete('/page/:pageId/:workspaceId', library.deletePage);

// GET - Get all  collections by groups
routes.get('/page/:collectionId/by-collection', library.getPagesByCollection);

// GET - Get all  collections by groups
routes.get('/page/:pageId/by-page', library.getPagesByParent);

// PUT - Removes a group to the collection
routes.put('/page/:pageId/', library.editPage);

// POST - Like a story
routes.put('/page/:pageId/like', library.like);

// POST - Unlike a story
routes.put('/page/:pageId/unlike', library.unlike);

// POST - Uploads a file to the page
routes.post('/page/:pageId/files/:workspaceId/:collectionId', pageFileUploader, library.addPageFile);

// PUT - Delete a file from a page
routes.put('/page/:fileId/remove-file/:workspaceId', library.removePageFile);

// GET - Get group by collection
routes.get('/collection/:collectionId/group-by-collection', library.getGroupByCollection);

// GET - Get group by page
routes.get('/page/:pageId/group-by-page', library.getGroupByPage);

// GET - Search the pages to be refered from quill
routes.get('/page/:pageId/search', library.searchPages);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as libraryRoutes }