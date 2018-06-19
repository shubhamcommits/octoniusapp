const express = require("express");
const router = express.Router();
const file_handler = require('../helpers/file_handler.js')

const controller_user = require("../controllers/user/ControllerUser")
const middleware_auth = require('../middlewares/auth')


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);

//user routes
router.get("/", controller_user.getUser);
router.put("/", controller_user.updateUser);
router.post("/updateImage", file_handler, controller_user.updateUserImage);


module.exports = router;