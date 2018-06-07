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
router.post('/task', controller_post.addNewTaskPost);
router.post('/event', controller_post.addNewEventPost);
router.post('/addComment', controller_post.addCommentOnPost);
router.get('/:group_id', controller_post.getGroupPosts);



module.exports = router;