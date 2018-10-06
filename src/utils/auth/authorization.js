const { Post, Group } = require('../../api/models');
const { sendErr } = require('../');

/*	=========================
 *	-- POST AUTHORIZATIONS --
 *	=========================
 */

// -| Group Authorizations |-

const groupAccess = async (req, res, next) => {
  try {
    const group = await Group.find({
      $and: [
        { _id: req.params.groupId},
        { $or: [
          { _members: req.userId},
          { _admins: req.userId}
        ]}
      ]});

    if (!group) {
      return sendErr(res, err,
        'User not allowed to access content from this group!', 403);
    }

    next ();

  } catch (err) {
    return sendErr(res, err);
  }
};

// -| Post Authorizations |-

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
  // Group authorizations
  groupAccess,
  // Post authorizations
  toCompletePost
};

