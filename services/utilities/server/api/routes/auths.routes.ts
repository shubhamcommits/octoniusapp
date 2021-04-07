import express from 'express';
import { Auths } from '../../utils/auths';

const routes = express.Router();

// Creating auths class object
const auths = new Auths()

// GET - Verifies the request for authorization
// routes.get('/check-authorization', auths.verifyToken);

// GET - Verifies if the current user is authenticated or not
// routes.get('/check-authentication', auths.isLoggedIn);

// POST - Generates a token for the user
// routes.post('/generate-token', auths.generateToken);


/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
// export { routes as authRoutes }