import express from 'express';
import { PortfolioController } from '../controllers';
import { Auths, portfolioUploadFileUpload } from '../../utils';

const routes = express.Router();
const portfolio = new PortfolioController();

// Auths Helper Function
const authsHelper = new Auths();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

// GET - Get list of all portfolios of a user
routes.get('/', portfolio.getUserPortfolios);

// GET - Get portfolio based on the portfolioId
routes.get('/:portfolioId', portfolio.get);

// POST - Create new portfolio in the workspace
routes.post('/', portfolio.create);

// PUT - Updates the portfolio property
routes.put('/:portfolioId', portfolio.update);

// PUT - Updates the portfolio property
routes.put('/:portfolioId/content', portfolio.updateContent);

// PUT - Add a group to the portfolio
routes.put('/:portfolioId/add-group', portfolio.addGroup);

// PUT - Removes a group to the portfolio
routes.put('/:portfolioId/remove-group', portfolio.removeGroup);

// PUT - Add a group to the portfolio
routes.put('/:portfolioId/add-manager', portfolio.addManager);

// PUT - Removes a group to the portfolio
routes.put('/:portfolioId/remove-manager', portfolio.removeManager);

// DELETE - Removes the portfolio from the database
routes.delete('/:portfolioId', portfolio.remove);

// PUT - Change the Group Image
routes.put('/:portfolioId/image/:workspaceId', portfolioUploadFileUpload, portfolio.updateImage);

// GET - Get members of all groups of the portfolio based on the portfolioId
routes.get('/:portfolioId/groups-members', portfolio.getAllGroupsMembers);

// GET - Get group tasks between two dates
routes.get('/:portfolioId/tasks-between-days', portfolio.getTasksBetweenDates);

// get all existing project columns filtering by groups
routes.get('/:portfolioId/projects-portfolio', portfolio.getAllPortfolioProjectColumns);

// get all existing project columns filtering by groups
routes.get('/:portfolioId/tasks-in-period', portfolio.getPortfolioTasks);

// get all existing project columns filtering by groups
routes.get('/:portfolioId/all-tasks-stats', portfolio.getAllPortfolioTasksStats);

// GET - Fetches the today's tasks
routes.get('/:portfolioId/tasks-today', portfolio.getTodayTasks);

// GET - Fetches all the overdue tasks
routes.get('/:portfolioId/tasks-overdue', portfolio.getOverdueTasks);

// GET - Fetches this week's tasks
routes.get('/:portfolioId/tasks-week', portfolio.getThisWeekTasks);

// GET - Fetches next week's tasks
routes.get('/:portfolioId/tasks-next-week', portfolio.getNextWeekTasks);

// GET - Fetches future tasks
routes.get('/:portfolioId/tasks-future', portfolio.getFutureTasks);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as portfolioRoutes }