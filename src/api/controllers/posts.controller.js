const moment = require('moment');

const { Group, Post, User, Workspace } = require('../models');
const { sendMail, sendErr } = require('../../utils');

/*	==================
 *	-- POST METHODS --
 *	==================
 */

const add = async (req, res, next) => {
  try { 
    const postData = req.body;

    // Id it's event post, convert due_to date to UTC before storing 
    if (postData.type === 'event') {
      postData[`event.due_to`] = moment.utc(postData[`event.due_to`]).format();
    }

    const post = await Post.create(postData);

    // Send Email notification after post creation
    switch(post.type) {
      case 'task':
        sendMail.taskAssigned(post);
      case 'event':
        sendMail.eventAssigned(post);
    };

    return res.status(200).json({
      message: 'New post created!',
      post,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const completePost = async (req, res, next) => {
  try {
    let postId = req.body.post_id;

    const post = await Post.findByIdAndUpdate({
      _id: postId
    }, {
      completed: true,
      completion_date: moment().format()
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'Post completed!',
      post,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.body.postId;

    const post = await Post.findByIdAndRemove({ _id: postId });

    return res.status(200).json({
      message: 'Post deleted!',
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const editPost = async (req, res, next) => {
  try {
    const postId = req.body.post_id;
    const updatedContent = req.body.content;

    const post = await Post.findByIdAndUpdate({
      _id: postId
    }, { 
      $set : {
        content: updatedContent
      }
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'Post updated!',
      post,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const addCommentOnPost = async (req, res, next) => {
  try {
    const postId = req.body.post_id;
    const commentedBy = req.body._commented_by;
    const content = req.body.content;

    const user = await User.findById({ _id: commentedBy });

    const post = await Post.findByIdAndUpdate({
      _id: postId
    }, {
      $push: {
        comments: {
          content: content,
          _commented_by: user
        }
      },
      $inc: {
        comments_count: 1
      },
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'Comment added!',
      post,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const getGroupPosts = async (req, res, next) => {
  try {
    const groupId = req.params.group_id;

    const posts = await Post.find({
      _group: groupId
    })
      .sort('-_id')
      .limit(10)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('comments._commented_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_liked_by', '_id first_name last_name').lean();

    const postsUpdate = await posts.map((post) => {
      post.liked_by = post._liked_by.map(user => user._id);
      return post;
    });

    return res.status(200).json({
      message: `The ${posts.length} most recent posts!`,
      posts: postsUpdate
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const getGroupNextPosts = async (req, res, next) => {
  try {
    const groupId = req.params.group_id;
    const lastPostId = req.params.last_post_id;

    const posts = await Post.find({
      $and: [
        { _group: groupId },
        { _id: { $lt: lastPostId }}
      ]
    })
      .sort('-_id')
      .limit(10)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('comments._commented_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_liked_by', '_id first_name last_name').lean();

    const postsUpdate = await posts.map((post) => {
      post.liked_by = post._liked_by.map(user => user._id);
      return post;
    });

    return res.status(200).json({
      message: `The next ${posts.length} most recent posts!`,
      posts: postsUpdate
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const getUserOverview = async (req, res, next) => {
  try {
    const userId = req.params.user_id;

    // Generate the actual time
    const todayForEvent = moment.utc().hours(0).minutes(0).seconds(0).milliseconds(0).format();
    const today = moment().format('YYYY-MM-DD');

    // Generate the +48h time
    const todayPlus48ForEvent = moment.utc().add(48, 'hours').format();
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

    const posts = await Post.find({
      $or: [
        // From this user...
        { $and: [
          // Find normal posts that has comments
          { _posted_by: userId },
          { comments: { $exists: true, $ne: []}},
          { 'comments.created_date': { $gte: todayForEvent }}
        ]},
        // Find tasks due to today
        { $and: [
          { 'task._assigned_to': userId },
          { 'task.due_to': { $in: [ today, tomorrow ]}}
        ]},
        // Find events due to today
        { $and: [
          { 'event._assigned_to': userId },
          { 'event.due_to': { $gte: todayForEvent, $lt: todayPlus48ForEvent }}
        ]}
      ]})
      .sort('event.due_to task.due_to -comments.created_date')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('comments._commented_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_group', 'group_name group_avatar')
      .populate('_liked_by', 'first_name last_name');

    return res.status(200).json({
      message: `Found ${posts.length} posts!`,
      posts,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const likePost = async (req, res, next) => {
  try {
    const postId = req.body.post_id;
    const userId = req.body.user_id;

    const post = await Post.findByIdAndUpdate({
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
      post,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const unlikePost = async (req, res, next) => {
  try {
    const postId = req.body.post_id;
    const userId = req.body.user_id;

    const post = await Post.findByIdAndUpdate({
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
      post,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
  add,
  addNewPost: add, // !! remove this name after 'add' implementation
  completePost,
  deletePost,
  editPost,
  addCommentOnPost,
  getGroupPosts,
  getGroupNextPosts,
  getUserOverview,
  likePost,
  unlikePost
};
