const { Post } = require('../../api/models');
const { sendErr } = require('../');

// REFACTOR !!!!!!!
// - Improve function code pattern
// - Create methods do check authorization & permissions
//  -- postOwner
//  -- taskAssignee
//  -- eventAssignee
//  (group and workspace authorizations, etc...)

/*	=========================
 *	-- POST AUTHORIZATIONS --
 *	=========================
 */

const toEditPost = async (req, res, next) =>  {
  try {
    const post = await Post.findById(req.body.post_id);

    if (post._posted_by.equals(req.body.user_id)) {
      next();
    } else if (!!post && !post._posted_by.equals(req.body.user_id)) {
      return sendErr(res, err, 'User not allowed to edit this post!', 401);
    }

  } catch (err) {
    return sendErr(res, err);
  }
};

const toCompletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.body.post_id);

    if ( 
      // Check if user is the post owner or
      post._posted_by.equals(req.body.user_id) ||
      ( // check if post type is 'event' and...
        (post.type === 'event' &&
          //  ...the event is assigned to this user... or...
          post.event._assigned_to.includes(String(req.body.user_id))) ||
        // check if post type is 'task' and...
        (post.type === 'task' &&
          // ...the task is assigned to this user.
          post.task._assigned_to.equals(req.body.user_id)) 
      )
    ) {
      next();
    } else if (!!post) {
      return sendErr(res, err, 'User not allowed to edit this post!', 401);
    }

  } catch (err) {
    return sendErr(res, err);
  }
};

module.exports = {
  // Post authorizations
  toEditPost,
  toCompletePost
};

