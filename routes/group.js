const express = require("express");
const router = express.Router();


const controller_group = require("../controllers/workspace/ControllerGroup");
const middleware_auth = require('../middlewares/auth')
const group_file_handler = require('../helpers/group_update_file_handler')


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);



// Group Routes 
// router.get('/searchGroupUsers/:group_id', controller_group.searchGroupUsers);
router.get('/searchGroupUsers/:group_id/:query', controller_group.searchGroupUsers);
router.get('/:group_id', controller_group.getUserGroup);
router.post('/addNewUsers', controller_group.addNewUsersInGroup);
router.put('/:group_id', group_file_handler, controller_group.updateGroup);



module.exports = router;