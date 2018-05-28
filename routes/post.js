const express = require("express");
const router = express.Router();


const controller_post = require("../controllers/workspace/ControllerPost");
const middleware_auth = require('../middlewares/auth')


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);



// Post Routes 
router.post('/normal', controller_post.addNewNormalPost);
/* router.post('/post/calander', controller_post.addNewCalendarPost);
router.post('/post/event', controller_post.addNewEventPost);*/
router.get('/:group_id', controller_post.getGroupPosts);



module.exports = router;