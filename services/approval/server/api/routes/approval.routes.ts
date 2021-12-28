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

// PUT - activateApprovalForItem
router.put('/:itemId/activateApprovalForItem', approval.activateApprovalForItem);

// PUT - addUserToFlow
router.put('/:itemId/addUserToFlow', approval.addUserToFlow);

// PUT - removeUserFromFlow
router.put('/:itemId/removeUserFromFlow', approval.removeUserFromFlow);

// PUT - launchApprovalFlow
router.put('/:itemId/launchApprovalFlow', approval.launchApprovalFlow);

// PUT - approveItem
router.put('/:itemId/approveItem', approval.approveItem);

// PUT - confirmAction
router.put('/:itemId/confirmAction', approval.confirmAction);

// PUT - rejectItem
router.put('/:itemId/rejectItem', approval.rejectItem);

export { router as approvalRoutes };