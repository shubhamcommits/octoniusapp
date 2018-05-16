const express = require("express");
const router = express.Router();

const controller_workspace_core = require("../controllers/workspace/ControllerWorkspaceCore")
const controller_workspace_admin = require("../controllers/workspace/ControllerWorkspaceAdmin")
const middleware_auth = require('../middlewares/auth')


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);

//workspace core routes
router.get("/:workspace_id", controller_workspace_core.getWorkspace);


//workspace Admin routes
router.post("/updateAllowedEmailsDomains", controller_workspace_admin.updateAllowedEmailDomains);
router.post("/inviteUserViaEmail", controller_workspace_admin.inviteUserViaEmail);

module.exports = router;