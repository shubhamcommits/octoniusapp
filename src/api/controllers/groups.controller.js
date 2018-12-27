const { Group, Post, User } = require('../models');
const { sendErr, sendMail } = require('../../utils');

/*  =======================
 *  -- GROUP CONTROLLERS --
 *  =======================
 */

// -| MAIN |-

const get = async (req, res, next) => {
  try {
    const groupId = req.params.group_id;

    const group = await Group.findOne({
      _id: groupId
    })
      .populate('_members', 'first_name last_name profile_pic role email')
      .populate('_admins', 'first_name last_name profile_pic role email')

    if (!group) {
      return sendErr(res, err, 'Group not found, invalid group id!', 404)
    }

    return res.status(200).json({
      message: 'Group found!',
      group
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getPrivate = async (req, res) => {
  try {
    const { userId } = req;

    const user = await User.findOne({ _id: userId });
    const privateGroup = await Group.findOne({
      _id: user._private_group
    })
      .populate('_members', 'first_name last_name profile_pic role email')
      .populate('_admins', 'first_name last_name profile_pic role email');


    return res.status(200).json({
      message: 'Private group found!',
      privateGroup
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

// -| FILES |-

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

// -| POSTS |-

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
      .populate('task._assigned_to')
      .populate('event._assigned_to')
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

// -| TASKS |-

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
  // Main
  get,
  getPrivate,
  // Files
  downloadFile,
  getFiles,
  // Posts
  getNextPosts,
  getPosts,
  // Tasks
  getNextTasksDone,
  getTasks,
  getTasksDone
};
