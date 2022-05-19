import express from 'express';
import { SearchController } from '../controllers';
import { Auths } from '../utils';

const router = express.Router();

/**
 * Search Controller Class Object
 */
const search = new SearchController();

// Define auths helper controllers
const auth = new Auths();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// -| Main search |-
router.get('/getSearchResults/:filter', search.getSearchResults);

export { router as searchRoutes };