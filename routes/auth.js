const express = require("express");
const router = express.Router();
const controller_auth_core = require("../controllers/auth/ControllerAuthCore")
const middleware_auth = require('../middlewares/auth')

//auth core routes
router.post("/signin", controller_auth_core.signIn);
router.post("/signup", controller_auth_core.signUp);
router.get("/signout", middleware_auth.verifyToken, middleware_auth.isLoggedIn, controller_auth_core.signOut);
router.post("/checkUserAvailability", controller_auth_core.checkUserAvailability);
router.post("/createNewWorkspace", controller_auth_core.createNewWorkspace);
router.post("/checkWorkspaceName", controller_auth_core.checkWorkspaceName);

module.exports = router;
