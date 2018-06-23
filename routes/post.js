const express = require("express");
const router = express.Router();


const controller_post = require("../controllers/workspace/ControllerPost");
const middleware_auth = require('../middlewares/auth')
const post_file_handler = require('../helpers/postFileHander')


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);



// Post Routes 
router.post('/normal', post_file_handler, controller_post.addNewNormalPost);
router.post('/task', post_file_handler, controller_post.addNewTaskPost);
router.post('/event', post_file_handler, controller_post.addNewEventPost);
router.post('/addComment', controller_post.addCommentOnPost);
router.get('/:group_id', controller_post.getGroupPosts);



module.exports = router;