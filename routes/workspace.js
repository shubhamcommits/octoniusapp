const express = require("express");
const router = express.Router();

const controller_workspace_core = require("../controllers/workspace/ControllerWorkspaceCore")
const controller_workspace_admin = require("../controllers/workspace/ControllerWorkspaceAdmin")
const middleware_auth = require('../middlewares/auth')
//workspace core routes
router.post("/createNewWorkspace", controller_workspace_core.createNewWorkSpace);
router.get("/:workspace_id", middleware_auth.verifyToken, middleware_auth.isLoggedIn, controller_workspace_core.getWorkspace);


//workspace Admin routes
router.post("/updateAllowedEmailsDomains", middleware_auth.verifyToken, middleware_auth.isLoggedIn, controller_workspace_admin.updateAllowedEmailDomains);
router.post("/inviteUserViaEmail", middleware_auth.verifyToken, middleware_auth.isLoggedIn, controller_workspace_admin.inviteUserViaEmail);

module.exports = router;