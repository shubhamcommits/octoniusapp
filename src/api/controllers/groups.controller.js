const { Group, Post } = require('../models');
const { sendErr, sendMail } = require('../../utils');

/*  =======================
 *  -- GROUP CONTROLLERS --
 *  =======================
 */

// -| Group files controllers |-

const downloadFile = (req, res, next) => {
  const { fileName } = req.params;
  const filepath = `${process.env.FILE_UPLOAD_FOLDER}/${fileName}`;

  res.sendFile(filepath);
};

const getFiles = async (req, res, next) => {
  try {
    // Find all posts that has files and belongs to this group
    const posts = await Post.find({
      $and: [
        // Find normal posts that has comments
        { _group: req.params.groupId },
        { files: { $exists: true, $ne: [] } }
      ]
    })
      .sort('-created_date')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_group', 'group_name group_avatar')
      .populate('_liked_by', 'first_name last_name');

    return res.status(200).json({
      message: `Found ${posts.length} posts containing files!`,
      posts
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

// -| Group posts controllers |-

const getNextPosts = async (req, res, next) => {
  try {
    const { groupId, postId } = req.params;

    const posts = await Post.find({
      $and: [
        { _group: groupId },
        { _id: { $lt: postId } }
      ]
    })
      .sort('-_id')
      .limit(5)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_liked_by', '_id first_name last_name')
      .lean();

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

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      _group: req.params.groupId
    })
      .sort('-_id')
      .limit(5)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_liked_by', '_id first_name last_name')
      .lean();

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

const getNextTasksDone = async (req, res, next) => {
  try {
    const {
      userId,
      params: {
        postId, groupId
      }
    } = req;

    const posts = await Post.find({
      $and: [
        { type: 'task' },
        { _group: groupId },
        { 'task.status': 'done' },
        { _id: { $lt: postId } }
      ]
    })
      .sort('-_id')
      .limit(20)
      .populate('_group', 'group_name')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name profile_pic')
      .lean();

    return res.status(200).json({
      message: `The next ${posts.length} most recent completed tasks!`,
      posts
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const {
      userId,
      params: {
        groupId
      }
    } = req;

    const posts = await Post.find({
      type: 'task',
      _group: groupId,
      $or: [
        { 'task.status': 'to do' },
        { 'task.status': 'in progress' }
      ]
    })
      .sort('-task.due_to')
      .populate('_group', 'group_name')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name profile_pic')
      .lean();

    return res.status(200).json({
      message: `Found ${posts.length} pending tasks.`,
      posts
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getTasksDone = async (req, res, next) => {
  try {
    const {
      userId,
      params: {
        postId, groupId
      }
    } = req;

    const posts = await Post.find({
      $and: [
        { type: 'task' },
        { _group: groupId },
        { 'task.status': 'done' }
      ]
    })
      .sort('-_id')
      .limit(20)
      .populate('_group', 'group_name')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name profile_pic')
      .lean();

    return res.status(200).json({
      message: `The ${posts.length} most recent completed tasks!`,
      posts
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
  // files
  downloadFile,
  getFiles,
  // posts
  getNextPosts,
  getPosts,
  // tasks
  getNextTasksDone,
  getTasks,
  getTasksDone
};
