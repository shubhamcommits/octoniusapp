import express from 'express';
import { ColumnsController } from '../controllers';
// import { Auths } from '../../../../posts/server/api/utils';

// Create Router to handle the routes
const router = express.Router();

// Define columns helper controllers
const columns = new ColumnsController();

// Define auths helper controllers
// const auths = new Auths();

// -| AUTHENTICATION |-

// // Verify the token
// router.use(auths.verifyToken);

// // Checks whether the current user is loggedIn or not
// router.use(auths.isLoggedIn);

// get all existing columns
router.get('/all', columns.getAllColumns);

// initialize the basic columns
// router.post('/init', columns.initColumns);

// add a new column
router.post('/', columns.addColumn);

// edit column name 
router.put('/edit/name', columns.editColumnName);

// delete column 
router.put('/delete', columns.deleteColumn);

// PUT - Save custom field to show
router.put('/customFieldsToShow', columns.updateCustomFieldsToShow);

export { router as columnRoutes };