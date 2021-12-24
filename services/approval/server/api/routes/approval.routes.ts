import express from 'express';
import { ApprovalController } from '../controllers';
import { Auths } from '../utils';

const router = express.Router();

/**
 * Approval Controller Class Object
 */
const approval = new ApprovalController();

// Define auths helper controllers
const auth = new Auths();

// -| Authentication |-

// Verify token and add current userId to request data
router.use(auth.verifyToken);
// Check if user is logged in
router.use(auth.isLoggedIn);

// -| Main search |-
router.get('/getSearchResults/:filter/:query', approval.getSearchResults);

export { router as approvalRoutes };