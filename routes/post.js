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
router.post('/add', post_file_handler, controller_post.addNewPost);
// edit route still in progress
router.post('/edit', controller_post.editPost);
router.post('/addComment', controller_post.addCommentOnPost);
router.get('/:group_id', controller_post.getGroupPosts);
router.put('/', controller_post.deletePost);



module.exports = router;
