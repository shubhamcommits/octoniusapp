const express = require("express");
const router = express.Router();

const controller_workspace_core = require("../controllers/workspace/ControllerWorkspaceCore");
const controller_workspace_admin = require("../controllers/workspace/ControllerWorkspaceAdmin");
const controller_workspace_groups = require("../controllers/workspace/ControllerGroups");
const controller_workspace_group = require("../controllers/workspace/ControllerGroup");
const controller_post = require("../controllers/workspace/ControllerPost");
const middleware_auth = require('../middlewares/auth')


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);

//workspace core routes
router.get("/:workspace_id", controller_workspace_core.getWorkspace);
router.get('/searchWorkspaceUsers/:workspace_id/:query', controller_workspace_core.searchWorkspaceUsers);



//workspace Admin routes
router.post("/updateAllowedEmailsDomains", controller_workspace_admin.updateAllowedEmailDomains);
router.post("/inviteUserViaEmail", controller_workspace_admin.inviteUserViaEmail);
router.put("/updateUserRole", controller_workspace_admin.updateUserRole);
router.delete("/deleteWorkspaceUser", controller_workspace_admin.deleteWorkspaceUser);

// workspace groups routes
router.post("/groups", controller_workspace_groups.createNewGroup);
router.get("/groups/:user_id/:workspace_id", controller_workspace_groups.getUserGroups);

module.exports = router;