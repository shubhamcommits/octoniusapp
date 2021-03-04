import { Auths, userFileHandler } from '../../utils';
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
routes.post('/auths/sign-out', auths.signOut);

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
routes.get('/tasks/today', post.getTodayTasks)

// GET - Fetches all the overdue tasks
routes.get('/tasks/overdue', post.getOverdueTasks);

// GET - Fetches this week's tasks
routes.get('/tasks/week', post.getThisWeekTasks)

// GET - Fetches next week's tasks
routes.get('/tasks/next-week', post.getNextWeekTasks)

// GET - Fetches future tasks
routes.get('/tasks/future', post.getFutureTasks)

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

// GET - Get other user details on the basis of userId
routes.get('/:userId', user.getOtherUser);

// PUT - Updates the user details on the basis of userId
routes.put('/', user.edit);

// PUT - Updates the role of the user on the basis of userId
routes.put('/update-role', user.updateUserRole);

// PUT - Updates the profileImage of the user on the basis of userId
routes.put('/image', userFileHandler, user.updateImage);

// PUT - Updates the user´s password on the basis of userId
routes.put('/change-password', user.changePassword);

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

// PUT - Transfer ownership of the workspace
routes.put('/transefer-ownership', user.transferOwnership);

// DELETE - Remove the user on the basis of userId
routes.delete('/:userId', user.removeUser);

routes.put('/add-favorite-group', user.addFavoriteGroup);

routes.put('/default-icons-sidebar', user.saveIconSidebarByDefault);

// PUT - Save the out of the office days 
routes.put('/:userId/out-of-office-days', user.saveOutOfOfficeDays);

// GET - Get the out of the office days 
routes.get('/:userId/out-of-office-days', user.getOutOfOfficeDays);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as userRoutes }