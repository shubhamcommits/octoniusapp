import express from 'express';
import { GroupFunctions } from '../controllers';

const routes = express.Router();
const group = new GroupFunctions();

// GET - Get group based on the groupId
routes.get('/', group.get);

// POST - Create new group in the workspace
routes.post('/', group.create);

// PUT - Updates the group data(only description and group_name)
routes.put('/', group.update);

// DELETE - Removes the group from the database
routes.delete('/', group.remove);

// GET - Get list of first 10 groups present in the database
routes.get('/list', group.getAllGroupsList);

// GET - Get list of next 5 groups present in the database based on the lastGroupId from fetched from the list of first 10 groups
routes.get('/list/next', group.getNextAllGroupsList);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as groupRoutes }