const express = require('express');
const router = express.Router();


const controller_post = require('../controllers/workspace/ControllerPost');
const middleware_auth = require('../middlewares/auth')
const post_file_handler = require('../helpers/postFileHander')
const checkUserPermission = require('../middlewares/checkUserPermission');


// JWT Token verification middleware
router.use(middleware_auth.verifyToken);
// Middleware to check either user is logged in or not
router.use(middleware_auth.isLoggedIn);


// Post Routes 
router.post('/add', post_file_handler, controller_post.addNewPost);
router.post('/edit', checkUserPermission.toEditPost, controller_post.editPost);
router.post('/complete', checkUserPermission.toCompletePost, controller_post.completePost);
router.post('/addComment', controller_post.addCommentOnPost);
router.post('/like', controller_post.likePost);
router.post('/unlike', controller_post.unlikePost);
router.get('/:group_id', controller_post.getGroupPosts);
router.get('/next/:group_id/:last_post_id', controller_post.getGroupNextPosts);
router.get('/userOverview/:user_id', controller_post.getUserOverview);
router.put('/', controller_post.deletePost);


module.exports = router;
