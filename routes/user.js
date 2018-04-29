const express = require("express");
const router = express.Router();

const controller_user = require("../controllers/user/ControllerUser")
const middleware_auth = require('../middlewares/auth')

//user routes
router.get("/", middleware_auth.verifyToken, middleware_auth.isLoggedIn, controller_user.getUser);


module.exports = router;