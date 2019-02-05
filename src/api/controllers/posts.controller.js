const moment = require('moment');

const notifications = require('./notifications.controller');
const {
  Comment, Group, Post, User
} = require('../models');
const { sendMail, sendErr } = require('../../utils');

/*  ======================
 *  -- POST CONTROLLERS --
 *  ======================
 */

// -| MAIN |-

const add = async (req, res, next) => {
  try {
    const postData = req.body;

    console.log('postData', postData);

    const post = await Post.create(postData);

    if (post._content_mentions.length !== 0) {
      // Create Notification for mentions on post content
      notifications.newPostMentions(post);

      // start the process to send an email to every user mentioned
      post._content_mentions.forEach((user, i) => {
        sendMail.userMentionedPost(post, user, i);
      });
    }

    // Send Email notification after post creation
    switch (post.type) {
      case 'task':
        await notifications.newTaskAssignment(post);
        await sendMail.taskAssigned(post);
        await sendMail.scheduleTaskReminder(post);
        break;
      case 'event':
        await notifications.newEventAssignments(post);
        await sendMail.eventAssigned(post);
        await sendMail.scheduleEventReminder(post);
        break;
      default:
        break;
    }

    return res.status(200).json({
      message: 'New post created!',
      post
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const edit = async (req, res, next) => {
  try {
    let postData;


    switch (req.body.type) {
      case 'task':

        postData = {
          content: req.body.content,
          _content_mentions: req.body._content_mentions,
          task: {
            due_to: req.body.date_due_to,
            _assigned_to: req.body.assigned_to[0]._id,
            status: req.body.status
          }
        };
        break;

      case 'event':
        // transform due_to time to UTC
        req.body.date_due_to = moment.utc(req.body.date_due_to).format();

        // make arr with ids user who got assigned to event
        const assignedUsers = req.body.assigned_to.map((item, index) => item._id);

        postData = {
          content: req.body.content,
          _content_mentions: req.body._content_mentions,
          event: {
            due_to: req.body.date_due_to,
            _assigned_to: assignedUsers
          }
        };
        break;

      case 'normal':

        postData = {
          content: req.body.content,
          _content_mentions: req.body._content_mentions
        };
        break;
    }

    const post = await Post.findOne({ _id: req.params.postId });

    const user = await User.findOne({ _id: req.userId });

    // if the user is not an owner or an admin and is not the one who posted, we throw auth error
    if (!(user.role === 'owner' || user.role === 'admin') && !post._posted_by == req.userId) {
      return sendErr(res, null, 'User not allowed to edit this post!', 403);
    }

    const updatedPost = await Post.findOneAndUpdate({
      _id: req.params.postId
    }, {
      $set: postData
    }, {
      new: true
    })
      .populate('_posted_by')
      .populate('task._assigned_to')
      .populate('event._assigned_to');


    // Create Notification for mentions on post content
    if (post._content_mentions.length !== 0) {
      notifications.newPostMentions(post);
    }

    // Send Email notification after post creation
    switch (post.type) {
      case 'task':
        await notifications.newTaskAssignment(post);
        await sendMail.taskAssigned(post);
        break;
      case 'event':
        await notifications.newEventAssignments(post);
        await sendMail.eventAssigned(post);
        break;
      default:
        break;
    }

    return res.status(200).json({
      message: 'Post updated!',
      post: updatedPost
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const get = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Get post data
    const post = await Post.findOne({
      _id: postId
    })
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('_liked_by', 'first_name last_name')
      .populate('comments._commented_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .lean();

    return res.status(200).json({
      message: 'Post found!',
      post
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { userId, params: { postId } } = req;

    // Get post data
    const post = await Post.findOne({
      _id: postId
    }).lean();

    // Get user data
    const user = await User.findOne({ _id: req.userId });

    if (
    // If user is not an admin or owner
      !(user.role === 'admin' || user.role === 'owner')
        // ...user is not the post author...
        && !post._posted_by.equals(userId)
    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to remove this post!', 403);
    }

    await post.comments.forEach(async (commentId) => {
      try {
        await Comment.findByIdAndRemove(commentId);

        return true;
      } catch (err) {
        return sendErr(res, err);
      }
    });

    const postRemoved = await Post.findByIdAndRemove(postId);

    return res.status(200).json({
      message: 'Post deleted!',
      postRemoved
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

// -| COMMENTS |-

const addComment = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId },
      body: { content, contentMentions }
    } = req;

    // Generate comment data
    const commentData = {
      content,
      _content_mentions: contentMentions,
      _commented_by: userId,
      _post: postId
    };

    // Create comment
    let comment = await Comment.create(commentData);

    // populate comment
    comment = await Comment.populate(comment, '_commented_by');


    // Update post: add new comment id, increase post count
    const post = await Post.findOneAndUpdate({
      _id: postId
    }, {
      $push: {
        comments: comment._id
      },
      $inc: {
        comments_count: 1
      }
    }, {
      new: true
    });


    if (comment._content_mentions.length !== 0) {
      // Create Notification for mentions on comments
      notifications.newCommentMentions(comment);

      // for every user mentioned in the comment, we send an email
      comment._content_mentions.forEach((user) => {
        sendMail.userMentionedComment(comment, post, user);
      });
    }

    return res.status(200).json({
      message: 'Comment added!',
      comment
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const editComment = async (req, res, next) => {
  try {
    const {
      userId,
      params: { commentId },
      body: { content, contentMentions }
    } = req;

    const user = await User.findOne({ _id: userId });

    const comment = await Comment.findOne({ _id: commentId });

    // Only let admins, owners or the people who posted this comment edit it
    if (!(user.role === 'admin' || user.role === 'owner') && !comment._commented_by == userId) {
      return sendErr(res, null, 'User not allowed to edit this comment!', 403);
    }

    // Update comment
    const updatedComment = await Comment.findOneAndUpdate({
      _id: commentId
    }, {
      $set: {
        content,
        _content_mentions: contentMentions,
        created_date: moment.utc().format()
      }
    }, {
      new: true
    })
      .populate('_commented_by', 'first_name last_name profile_pic')
      .lean();

    // Create Notification for mentions on comments
    if (comment._content_mentions.length !== 0) {
      notifications.newCommentMentions(comment);
    }

    return res.status(200).json({
      message: 'Comment updated!',
      comment: updatedComment
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId
    })
      .populate('_commented_by', 'first_name last_name profile_pic')
      .lean();

    return res.status(200).json({
      message: 'Comment found!',
      comment
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      _post: postId
    })
      //  sorting them on ID will make the more recent ones be fetched first
      .sort('-_id')
      .limit(5)
      .populate('_commented_by', 'first_name last_name profile_pic')
      .populate('_liked_by', 'first_name last_name profile_pic')
      .lean();

    return res.status(200).json({
      message: `First ${comments.length} comments!`,
      comments
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getNextComments = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    const comments = await Comment.find({
      $and: [
        { _post: postId },
        { _id: { $lt: commentId } }
      ]
    })
      .sort('-_id')
      .limit(5)
      .populate('_commented_by', 'first_name last_name profile_pic')
      .lean();

    return res.status(200).json({
      message: `Next ${comments.length} comments!`,
      comments
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const removeComment = async (req, res, next) => {
  try {
    const { userId, params: { commentId } } = req;

    // Get comment data
    const comment = await Comment.findOne({
      _id: commentId
    }).lean();

    // Get post data
    const post = await Post.findOne({
      _id: comment._post
    }).lean();

    // Get user data
   const user = await User.findOne({ _id: userId });

    if (
    // If user is not one of group's admins... and...
      !(user.role === 'owner' || user.role === 'admin')
        // ...user is not the post author... and...
        && (!post._posted_by.equals(userId)
            // ...user is not the cooment author
            && !comment._commented_by.equals(userId))
    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to delete this comment!', 403);
    }

    const commentRemoved = await Comment.findByIdAndRemove(commentId);

    // Update post: remove new comment id, decrease post count
    const updatedPost = await Post.findOneAndUpdate({
      _id: post._id
    }, {
      $pull: {
        comments: comment._id
      },
      $inc: {
        comments_count: 1
      }
    }, {
      new: true
    });


    return res.status(200).json({
      message: 'Comment deleted!',
      commentRemoved
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

// -| LIKES |-

const like = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId }
    } = req;

    const post = await Post.findOneAndUpdate({
      _id: postId
    }, {
      $addToSet: {
        _liked_by: userId
      }
    }, {
      new: true
    })
      .populate('_liked_by', 'first_name last_name')
      .lean();

    const user = await User.findOne({
      _id: userId
    }).select('first_name last_name');

    return res.status(200).json({
      message: 'Post liked!',
      post,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const unlike = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId }
    } = req;

    const post = await Post.findOneAndUpdate({
      _id: postId
    }, {
      $pull: {
        _liked_by: userId
      }
    }, {
      new: true
    })
      .populate('_liked_by', 'first_name last_name')
      .lean();

    const user = await User.findOne({
      _id: userId
    }).select('first_name last_name');


    return res.status(200).json({
      message: 'Post unliked!',
      post,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const likeComment = async (req, res) => {
  try {
    const {
      userId,
      params: { commentId }
    } = req;

    const comment = await Comment.findOneAndUpdate({
      _id: commentId
    }, {
      $addToSet: {
        _liked_by: userId
      }
    }, {
      new: true
    })
      .populate('_liked_by', 'first_name last_name')
      .lean();

    const user = await User.findOne({
      _id: userId
    }).select('first_name last_name');

    return res.status(200).json({
      message: 'Post liked!',
      comment,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const unlikeComment = async (req, res) => {
  try {
    const {
      userId,
      params: { commentId }
    } = req;

    const comment = await Comment.findOneAndUpdate({
      _id: commentId
    }, {
      $pull: {
        _liked_by: userId
      }
    }, {
      new: true
    })
      .populate('_liked_by', 'first_name last_name')
      .lean();

    const user = await User.findOne({
      _id: userId
    }).select('first_name last_name');


    return res.status(200).json({
      message: 'Post unliked!',
      comment,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

// -| TASKS |-

const changeTaskStatus = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId },
      body: { status }
    } = req;

    // Get post data
    const post = await Post.findOne({
      _id: postId
    }).lean();

    // Get group data
    const group = await Group.findOne({
      _id: post._group
    }).lean();

    // const get user data
      const user = await User.findOne({ _id: userId });

    if (
    // If user is not an admin or owner... and...
      !(user.role === 'admin' || user.role === 'owner')
        // ...user is not the post author... and...
        && (!post._posted_by.equals(userId)
            // ...user is not the task assignee
            && !post.task._assigned_to.equals(userId))
    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to update this post!', 403);
    }

    const postUpdated = await Post.findOneAndUpdate({
      _id: postId
    }, {
      'task.status': status
    }, {
      new: true
    });

    // send email to user and poster when task status is done
    if (status === 'done') {
      sendMail.userCompletedTask(req.userId, postUpdated);
    }

    return res.status(200).json({
      message: 'Task status updated!',
      post: postUpdated
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const changeTaskAssignee = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId },
      body: { assigneeId }
    } = req;

    // Get post data
    const post = await Post.findOne({
      _id: postId
    }).lean();

    // Get group data
    const group = await Group.findOne({
      _id: post._group
    }).lean();

    const postUpdated = await Post.findOneAndUpdate({
      _id: postId
    }, {
      'task._assigned_to': assigneeId
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'Task assignee updated!',
      post: postUpdated
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/*  =============
 *  -- EXPORTS --
 *  =============
 */

module.exports = {
  // Main
  add,
  edit,
  get,
  remove,
  // Comments
  addComment,
  editComment,
  getComment,
  getComments,
  getNextComments,
  removeComment,
  // Likes
  like,
  unlike,
  likeComment,
  unlikeComment,
  // Tasks
  changeTaskAssignee,
  changeTaskStatus
};
