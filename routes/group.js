const express = require("express");
const router = express.Router();


const controller_group = require("../controllers/workspace/ControllerGroup");
const middleware_auth = require('../middlewares/auth')


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);



// Group Routes 
router.get('/:workspace/:key_word', controller_group.searchGroupUser);
router.get('/:group_id', controller_group.getUserGroup);
router.post('/addNewUsers', controller_group.addNewUsersInGroup);



module.exports = router;