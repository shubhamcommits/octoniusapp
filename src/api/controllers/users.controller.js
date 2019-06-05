const moment = require('moment');
const mongoose = require('mongoose');

const { Post, User, Comment } = require('../models');

const { sendErr } = require('../../utils');

// -| MAIN |-

const edit = async (req, res, next) => {
  try {
    const { userId, body } = req;

    delete req.body.userId;

    const user = await User.findByIdAndUpdate({
      _id: userId
    }, {
      $set: body
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'Profile updated!',
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const editSkills = async (req, res) => {
  try {
    const { userId, body: { skills } } = req;

    const user = await User.findByIdAndUpdate({
      _id: userId
    }, {
      skills
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'User skills updated!',
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const get = async (req, res, next) => {
  try {
    const { userId } = req;

    const user = await User.findOne({
      _id: userId
    })
      .cache({ key: userId })
      .select('_id first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group');

    // User not found
    if (!user) {
      return sendErr(res, null, 'Error! User not found, invalid id or unauthorized request', 404);
    }

    return res.status(200).json({
      message: 'User found!',
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};


const getOtherUser = async (req, res) => {
  try {
    const { userId } = req.params;


    const user = await User.findOne({
      _id: userId
    })
      .cache({ key: userId })
      .select('_id first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups _private_group');

    // User not found
    if (!user) {
      return sendErr(res, null, 'Error! User not found, invalid id or unauthorized request', 404);
    }

    return res.status(200).json({
      message: 'User found!',
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};
const updateImage = async (req, res) => {
  try {
    const { userId, fileName } = req;

    const user = await User.findByIdAndUpdate({
      _id: userId
    }, {
      profile_pic: fileName
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'User profile picture updated!',
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getOverview = async (req, res, next) => {
  try {
    const { userId } = req;

    // Generate the actual time
    const todayForEvent = moment().startOf('day').format();

    const today = moment().format('YYYY-MM-DD');

    // Generate the +24h time
    const todayPlus24ForEvent = moment().endOf('day').format();
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

    // find the comments that received a response today (to be replaced later)
    const comments = await Comment.find({
      _commented_by: { $ne: req.userId },
      created_date: { $gte: todayForEvent },
      _read_by: { $not: { $elemMatch: { $eq: new mongoose.Types.ObjectId(userId) } } } // comments not read by the user
    })
      .sort('-created_date')
      .populate({ path: '_post', populate: { path: '_group' } })
      .populate('_commented_by', 'first_name profile_pic');

    // filter the comments that responded to one the current user's posts
    const filteredComments = comments.filter(comment => comment._post._posted_by == req.userId);


    const posts = await Post.find({
      $or: [{
        $and: [
          // Find tasks due to today
          { 'task._assigned_to': userId },
          { 'task.due_to': { $in: [today, tomorrow] } }
        ]
      }, {
        $and: [
          // Find events due to today
          { 'event._assigned_to': userId },
          { 'event.due_to': { $gte: todayForEvent, $lt: todayPlus24ForEvent } }
        ]
      }]
    })
      .sort('event.due_to task.due_to -comments.created_date')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_group', 'group_name group_avatar')
      .populate('_liked_by', 'first_name last_name');

    // Get the group(s) that the user belongs to
    const { _groups } = await User.findById(userId)
      .select('_groups');

    // Get today's unread posts from every group associated with the user
    let recentPosts = await Post.find({
      '_group': { $in: _groups },
      'created_date': { $gte: todayForEvent, $lt: todayPlus24ForEvent },
      '_read_by': { $not: { $elemMatch: { $eq: new mongoose.Types.ObjectId(userId) } } }
    })
      .populate('_group', 'group_name')
      .populate('_posted_by', '_id first_name profile_pic')
      .select('_id title type _group _posted_by created_date');

    // Filter out the posts belonging to the current user
    recentPosts = recentPosts.filter(post => post._posted_by._id.toString() !== userId);

    return res.status(200).json({
      message: `Found ${posts.length} posts!`,
      posts,
      recentPosts,
      comments: filteredComments
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

// -| TASKS |-

const getNextTasksDone = async (req, res, next) => {
  try {
    const { userId, params: { postId } } = req;

    const posts = await Post.find({
      $and: [
        { 'task._assigned_to': userId },
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
    const { userId } = req;

    const posts = await Post.find({
      'task._assigned_to': userId,
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
    const { userId } = req;

    const posts = await Post.find({
      $and: [
        { 'task._assigned_to': userId },
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

// -| TOKENS |-

const addGdriveToken = async (req, res, next) => {
  try {
    const {
      userId,
      body: { token }
    } = req;

    const user = await User.findByIdAndUpdate({
      _id: userId
    }, {
      'integrations.gdrive.token': token
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'Saved gdrive token.',
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getGdriveToken = async (req, res, next) => {
  try {
    const { userId } = req;
    let token;

    const user = await User.findById(userId);

    if (user.integrations.gdrive.token) {
      token = user.integrations.gdrive.token;
    } else {
      return res.status(204).json({
        message: 'User does not have a gdrive token!'
      });
    }

    return res.status(200).json({
      message: 'Found gdrive token.',
      token
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

module.exports = {
  // Main
  edit,
  editSkills,
  get,
    getOtherUser,
  getOverview,
  updateImage,
  // Tasks
  getNextTasksDone,
  getTasks,
  getTasksDone,
  // Integrations
  addGdriveToken,
  getGdriveToken
};
