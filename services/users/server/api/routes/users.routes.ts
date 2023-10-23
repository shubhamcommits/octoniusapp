import { Auths, userFileUploader } from '../../utils';
import express from 'express';
import {  PostsControllers, SkillControllers, UserControllers } from '../controllers';

// Routes 
const routes = express.Router();

// Define skill controllers
const skill = new SkillControllers();

// Define user controllers
const user = new UserControllers();

// Define post controllers
const post = new PostsControllers()

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// POST - Logout from the server
// routes.post('/auths/sign-out', auths.signOut);

// -| SKILL |-

// GET - Get the skills search result on the basis of userId and query(request parameter)
routes.get('/skills/list', skill.getSkillsSearchResults)

// GET - Get users' skil on the basis of userId
routes.get('/skills', skill.get);

// POST - Add a new skill to users' skill set
routes.post('/skills/:skill', skill.addSkill);

// DELETE - Remove a skill from users' skill set
routes.delete('/skills/:skill', skill.removeSkill);


// -| POSTS |- 

// GET - Fetches the today's tasks
routes.get('/tasks/today', post.getTodayTasks);

// GET - Fetches all the overdue tasks
routes.get('/tasks/overdue', post.getOverdueTasks);

// GET - Fetches this week's tasks
routes.get('/tasks/week', post.getThisWeekTasks);

// GET - Fetches next week's tasks
routes.get('/tasks/next-week', post.getNextWeekTasks);

// GET - Fetches future tasks
routes.get('/tasks/future', post.getFutureTasks);

// GET - Fetches all the overdue tasks for a specific group and user
routes.get('/tasks/workloadOverdue', post.getWorkloadCardOverdueTasks);

// GET - Fetches all the overdue tasks for a portfolio and user
routes.get('/tasks/workloadOverduePortfolio', post.getWorkloadCardOverduePortfolioTasks);

// GET - Fetches today's events
routes.get('/events/today', post.getTodayEvents)

// GET - Fetches this week's events
routes.get('/events/week', post.getThisWeekEvents)

// GET - Fetches the global feeds posts, events, and tasks
routes.get('/global/feed', post.getGlobalFeed);


// -| USER |-

// GET - Get current loggedIn user on the basis of userId
routes.get('/', user.get);

// GET - Get account of the current loggedIn user on the basis of userId
routes.get('/account', user.getAccount);

// GET - Get account of the user on the basis of userId
routes.get('/:userId/otherAccount', user.getOtherAccount);

// GET - Get other user details on the basis of userId
routes.get('/:userId', user.getOtherUser);

// PUT - Updates the user details on the basis of userId
routes.put('/', user.edit);

// PUT - Updates the user details on the basis of userId
routes.put('/:userId/updateProperty', user.editProperty);

// PUT - Updates the role of the user on the basis of userId
routes.put('/update-role', user.updateUserRole);

// PUT - Updates the role of the user on the basis of userId
routes.put('/change-hr-role', user.changeHRRole);

// PUT - Updates the profileImage of the user on the basis of userId
routes.put('/image/:workspaceId', userFileUploader, user.updateImage);

// PUT - Updates the user´s password on the basis of userId
routes.put('/change-password', user.changePassword);

// GET - Get user list of workspaces
routes.get('/:userId/userWorkspaces', user.getAccountWorkspaces);

// - Integrations -

// Add a new token for a specific integration
routes.get('/integrations/gdrive/token', user.getGdriveToken);
routes.post('/integrations/gdrive/token', user.addGdriveToken);

// -| STATS |-
// Get user most frecuent groups
routes.get('/recent-groups/:userId', user.getRecentGroups);

routes.put('/increment-group-visit', user.incrementGroupVisit);

// Get user favorite groups
routes.get('/favorite-groups/:userId', user.getFavoriteGroups);

// Get user favorite portfolios
routes.get('/favorite-portfolios/:userId', user.getFavoritePortfolios);

// PUT - Transfer ownership of the workspace
routes.put('/transefer-ownership', user.transferOwnership);

// DELETE - Remove the user on the basis of userId
routes.delete('/:userId', user.removeUser);

routes.put('/add-favorite-group', user.addFavoriteGroup);

routes.put('/add-favorite-portfolio', user.addFavoritePortfolio);

routes.put('/add-favorite-collection', user.addFavoriteCollection);

routes.put('/default-icons-sidebar', user.saveIconSidebarByDefault);

// PUT - Updates the widgets to show in the global dashboard
routes.put('/:userId/saveSelectedWidgets', user.saveSelectedWidgets);

// -| CUSTOM FIELDS |-
// PUT - Change custom field value
routes.put('/:userId/customField', user.saveCustomField);

// PUT - Change custom field value
routes.put('/:userId/saveCustomFieldsFrom3rdPartySync', user.saveCustomFieldsFrom3rdPartySync);

// PUT - Change custom field value
routes.put('/locale', user.saveLocale);

// -| HR |-
// PUT - Change payroll custom field value
routes.put('/:userId/payrollCustomField', user.savePayrollCustomField);

// PUT - Change payroll variable
routes.put('/:userId/payrollVariable', user.savePayrollVariable);

// PUT - Change payroll variable
routes.put('/:userId/payrollBenefit', user.savePayrollBenefit);

// PUT - Change user payroll specific extra days off
routes.put('/:userId/payrollExtraDaysOff', user.savePayrollExtraDaysOff);

// PUT - Save the out of the office days 
routes.put('/:userId/out-of-office-days', user.saveOutOfOfficeDays);

// GET - Get the out of the office days 
routes.get('/:userId/out-of-office-days', user.getOutOfOfficeDays);

// POST - Create a Holiday period
routes.post('/:userId/holiday', user.createHoliday);

// POST - Create a Holiday period
routes.post('/:userId/edit-holiday', user.editHoliday);

// POST - Create a Holiday period
routes.post('/:holidayId/edit-holiday-status', user.editHolidaStatus);

// POST - Create a Holiday period
routes.delete('/:holidayId/delete-holiday', user.deleteHoliday);

// GET - Get the number of days computed in a period
routes.get('/:userId/calculate-num-holidays', user.getNumHolidays);

// GET - Get the out of the office days 
routes.get('/:userId/pending-approval-holidays', user.getPendingApprovalHolidays);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as userRoutes }