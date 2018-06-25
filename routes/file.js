const express = require("express");
const router = express.Router();


const controller_file = require("../controllers/ControllerFile");
const middleware_auth = require('../middlewares/auth');


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);



// File Routes 
router.post('/download', controller_file.downloadFile);


module.exports = router;