const express = require("express");
const router = express.Router();

const controller_workspace_core = require("../controllers/workspace/ControllerWorkspaceCore")
const controller_workspace_admin = require("../controllers/workspace/ControllerWorkspaceAdmin")

//workspace core routes
router.post("/createNewWorkspace", controller_workspace_core.createNewWorkSpace);


//workspace Admin routes
router.post("/updateAllowedEmailsDomains/:workspaceId", controller_workspace_admin.updateAllowedEmailDomains);

module.exports = router;