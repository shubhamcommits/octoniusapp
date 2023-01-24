import express from 'express';
import { LibraryController } from '../controllers';
import { Auths, collectionFileUploader, collectionUploadFileUpload, pageFileUploader } from '../../utils';

const routes = express.Router();
const libarry = new LibraryController();

// Auths Helper Function
const authsHelper = new Auths();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// GET - Get collection based on the collectionId
routes.get('/collection/:collectionId', libarry.getCollection);

// GET - Get all  collections by groups
routes.get('/collections/:groupId/by-group', libarry.getCollectionsByGroup);

// POST - Create new collection in the group
routes.post('/create-collection', libarry.createCollection);

// PUT - Updates the collection property
routes.put('/collection/:collectionId', libarry.updateCollection);

// DELETE - Removes the collection from the database
routes.delete('/collection/:workspaceId/:collectionId', libarry.removeCollection);

// PUT - Updates the collection property
routes.put('/collection/:collectionId/content', libarry.updateCollectionContent);

// // PUT - Change the Collection Image
routes.put('/collection/:collectionId/updateCollectionImage/:workspaceId', collectionUploadFileUpload, libarry.updateCollectionImage);

// POST - Create new page in the collection
routes.post('/collection/:collectionId/files/:workspaceId', collectionFileUploader, libarry.addCollectionFile);

// PUT - Delete a file from a page
routes.put('/collection/:fileId/remove-file/:workspaceId', libarry.removeCollectionFile);

// POST - Create new page in the collection
routes.post('/page/:collectionId', libarry.createPage);

// GET - Get all  collections by groups
routes.get('/page/:pageId', libarry.getPage);

// DELETE - Removes the collection from the database
routes.delete('/page/:pageId/:workspaceId', libarry.deletePage);

// GET - Get all  collections by groups
routes.get('/page/:collectionId/by-collection', libarry.getPagesByCollection);

// GET - Get all  collections by groups
routes.get('/page/:pageId/by-page', libarry.getPagesByParent);

// PUT - Removes a group to the collection
routes.put('/page/:pageId/', libarry.editPage);

// POST - Like a story
routes.put('/page/:pageId/like', libarry.like);

// POST - Unlike a story
routes.put('/page/:pageId/unlike', libarry.unlike);

// POST - Create new page in the collection
routes.post('/page/:pageId/files/:workspaceId/:collectionId', pageFileUploader, libarry.addPageFile);

// PUT - Delete a file from a page
routes.put('/page/:fileId/remove-file/:workspaceId', libarry.removePageFile);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as libraryRoutes }