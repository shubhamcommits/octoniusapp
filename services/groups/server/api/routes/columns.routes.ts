import express from 'express';
import { Auths } from '../../utils';
import { ColumnsController } from '../controllers';

// Create Router to handle the routes
const router = express.Router();

// Define columns helper controllers
const columns = new ColumnsController();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// // Verify the token
router.use(auths.verifyToken);

// // Checks whether the current user is loggedIn or not
router.use(auths.isLoggedIn);

// GET - retreive an specific section
router.put('/:sectionId', columns.get);

// get all existing columns
router.get('/all', columns.getAllColumns);

// get all existing archived columns
router.get('/archived', columns.getAllArchivedColumns);

// get all existing project columns
router.get('/projects', columns.getAllProjectColumns);

// get all existing project columns filtering by groups
router.get('/projectsByGroups', columns.getGroupProjectColumnsByGroups);

// add a new column
router.post('/', columns.addColumn);

// edit column name 
router.put('/edit/name', columns.editColumnName);

// delete column 
router.put('/delete', columns.deleteColumn);

// PUT - Save custom field to show
router.put('/customFieldsToShow', columns.updateCustomFieldsToShow);

// PUT - Change project type
router.put('/changeColumnProjectType', columns.changeColumnProjectType);

// PUT - Save custom field to show
router.put('/saveColumnProjectDates', columns.saveColumnProjectDates);

// PUT - Save amount planned for the budget
router.put('/saveAmountBudget', columns.saveAmountBudget);

// PUT - Add an expense to a budget
router.put('/addBudgetExpense', columns.addBudgetExpense);

// PUT - Update an expense in a budget
router.put('/updateBudgetExpense', columns.updateBudgetExpense);

// PUT - Remove an expense from a budget
router.put('/deleteBudgetExpense', columns.deleteBudgetExpense);

// PUT - Updates the order of the sections in the board views
router.put('/updateColumnsPosition', columns.updateColumnsPosition);

// PUT - Updates the order of the sections in the board views
router.put('/setDisplayCustomFieldInColumn', columns.setDisplayCustomFieldInColumn);

// PUT - Archives an entrie section and its tasks
router.put('/archive', columns.archive);

export { router as columnRoutes };