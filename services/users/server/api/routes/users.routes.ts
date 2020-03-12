import { Auths, userFileHandler } from '../../utils';
import express from 'express';
import { SkillControllers, UserControllers } from '../controllers';

const routes = express.Router();

// Define skill controllers
const skill = new SkillControllers();

// Define user controllers
const user = new UserControllers();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// -| SKILL |-

// GET - Get the skills search result on the basis of userId and query(request parameter)
routes.get('/skills/list', skill.getSkillsSearchResults)

// GET - Get users' skil on the basis of userId
routes.get('/skills', skill.get);

// POST - Add a new skill to users' skill set
routes.post('/skills/:skill', skill.addSkill);

// DELETE - Remove a skill from users' skill set
routes.delete('/skills/:skill', skill.removeSkill);


// -| USER |-

// GET - Get current loggedIn user on the basis of userId
routes.get('/', user.get);

// GET - Get other user details on the basis of userId
routes.get('/:userId', user.getOtherUser);

// PUT - Updates the user details on the basis of userId
routes.put('/', user.edit);

// PUT - Updates the role of the user on the basis of userId
routes.put('/update-role', user.updateUserRole);

// PUT - Updates the profileImage of the user on the basis of userId
routes.put('/image', userFileHandler, user.updateImage);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as userRoutes }