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
router.get('/:sectionId', columns.get);

// get all existing columns
router.get('/:groupId/all', columns.getAllColumns);

// get all existing archived columns
router.get('/:groupId/archived', columns.getAllArchivedColumns);

// get all existing project columns
router.get('/:workspaceId/projects', columns.getAllProjectColumns);

// get all existing project columns filtering by groups
router.get('/:workspaceId/projectsByGroups', columns.getGroupProjectColumnsByGroups);

// add a new column
router.post('/', columns.addColumn);

// edit column name 
router.put('/:sectionId/edit/name', columns.editColumnName);

// delete column 
router.delete('/:sectionId/delete', columns.deleteColumn);

// PUT - Save custom field to show
router.put('/:sectionId/customFieldsToShow', columns.updateCustomFieldsToShow);

// PUT - Change project type
router.put('/:sectionId/changeColumnProjectType', columns.changeColumnProjectType);

// PUT - Save custom field to show
router.put('/:sectionId/saveColumnProjectDates', columns.saveColumnProjectDates);

// PUT - Save amount planned for the budget
router.put('/:sectionId/saveAmountBudget', columns.saveAmountBudget);

// PUT - Add an expense to a budget
router.put('/:sectionId/addBudgetExpense', columns.addBudgetExpense);

// PUT - Update an expense in a budget
router.put('/:sectionId/updateBudgetExpense', columns.updateBudgetExpense);

// PUT - Remove an expense from a budget
router.put('/:sectionId/deleteBudgetExpense', columns.deleteBudgetExpense);

// PUT - Updates the order of the sections in the board views
router.put('/:sectionId/updateColumnsPosition', columns.updateColumnsPosition);

// PUT - Updates the order of the sections in the board views
router.put('/:sectionId/setDisplayCustomFieldInColumn', columns.setDisplayCustomFieldInColumn);

// PUT - Archives an entrie section and its tasks
router.put('/:sectionId/archive', columns.archive);

// GET - get the cost of all the timetracking linked to the task in the section
router.get('/:sectionId/sectionTimeTrackingCost', columns.getSectionTimeTrackingCost);

export { router as columnRoutes };