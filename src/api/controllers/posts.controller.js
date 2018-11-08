const moment = require('moment');

const notifications = require('./notifications.controller');
const { Group, Post } = require('../models');
const { sendMail, sendErr } = require('../../utils');

/*  ======================
 *  -- POST CONTROLLERS --
 *  ======================
 */

// -| MAIN |-

const add = async (req, res, next) => {
  try {
    const postData = req.body;

    // Id it's event post, convert due_to date to UTC before storing
    if (postData.type === 'event') {
      postData['event.due_to'] = moment.utc(postData['event.due_to']).format();
    }

    const post = await Post.create(postData);

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
      message: 'New post created!',
      post
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const edit = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate({
      _id: req.params.postId,
      _posted_by: req.userId
    }, {
      $set: {
        content: req.body.content,
        _content_mentions: req.body._content_mentions
      }
    }, {
      new: true
    });

    if (!post) {
      return sendErr(res, null, 'User not allowed to edit this post!', 403);
    }

    return res.status(200).json({
      message: 'Post updated!',
      post
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

    // Get group data
    const group = await Group.findOne({
      _id: post._group
    }).lean();

    if (
      // If user is not one of group's admins... and...
      !group._admins.includes(String(userId)) &&
      // ...user is not the post author...
      !post._posted_by.equals(userId)
    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to remove this post!', 403);
    }

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
    const comment = await Comment.create(commentData);

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

    // Create Notification for mentions on post comments
    if (comment._content_mentions.length !== 0) {
      // !! To be created !!
      // notifications.newCommentMentions(comment);
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

    // Update comment
    const comment = await Post.findOneAndUpdate({
      _id: commentId,
      _commented_by: userId
    }, {
      $set: {
        content,
        _content_mentions: contentMentions,
        created_date: moment.utc().format()
      }
    }, {
      new: true
    });

    // Create Notification for mentions on post comments
    if (comment._content_mentions.length !== 0) {
      // !! To be created !!
      // notifications.newCommentMentions(comment);
    }

    return res.status(200).json({
      message: 'Comment updated!',
      comment
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
      .populate('comments._commented_by', 'first_name last_name profile_pic')
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
      .sort('_id')
      .limit(10)
      .populate('comments._commented_by', 'first_name last_name profile_pic')
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
      .sort('_id')
      .limit(10)
      .populate('comments._commented_by', 'first_name last_name profile_pic')
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

    // Get group data
    const group = await Group.findOne({
      _id: post._group
    }).lean();

    if (
      // If user is not one of group's admins... and...
      !group._admins.includes(String(userId)) &&
      // ...user is not the post author... and...
      (!post._posted_by.equals(userId) &&
        // ...user is not the cooment author
        !comment._commented_by.equals(userId))
    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to delete this comment!', 403);
    }

    const commentRemoved = await Comment.findByIdAndRemove(commentId);

    // Update post: remove new comment id, decrease post count
    const post = await Post.findOneAndUpdate({
      _id: postId
    }, {
      $pull: {
        comments: comment._id
      },
      $inc: {
        comments_count: -1
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
    });

    return res.status(200).json({
      message: 'Post liked!',
      post
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
    });

    return res.status(200).json({
      message: 'Post unliked!',
      post
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

    if (
      // If user is not one of group's admins... and...
      !group._admins.includes(String(userId)) &&
      // ...user is not the post author... and...
      (!post._posted_by.equals(userId) &&
        // ...user is not the task assignee
        !post.task._assigned_to.equals(userId))
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

    if (
      // If user is not one of group's admins... and...
      !group._admins.includes(String(userId)) &&
      // ...user is not the post author... and...
      (!post._posted_by.equals(userId) &&
        // ...user is not the task assignee
        !post.task._assigned_to.equals(userId))
    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to update this post!', 403);
    }

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
  // Tasks
  changeTaskAssignee,
  changeTaskStatus
};
