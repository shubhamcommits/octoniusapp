const express = require("express");
const router = express.Router();
const controller_auth_core = require("../controllers/auth/ControllerAuthCore")
const middleware_auth = require('../middlewares/auth')
const middleware_signup = require('../middlewares/signup')
//auth core routes
router.post("/signin", controller_auth_core.signin);
router.post("/signup", controller_auth_core.signup);
router.get("/signout", middleware_auth.verifyToken, middleware_auth.isLoggedIn, controller_auth_core.signOut);
router.post("/searchUserAvailability", controller_auth_core.SearchUserAvailability);
router.post("/searchWorkspaceNameAvailability", controller_auth_core.SearchWorkspaceNameAvailablity);

module.exports = router;