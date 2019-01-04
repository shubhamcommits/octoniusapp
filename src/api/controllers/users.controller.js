const moment = require('moment');

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

const editSkills = async (req, res, next) => {
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
      .select('_id first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number skills mobile_number company_name _workspace _groups');

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

const updateImage = async (req, res, next) => {
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
      created_date: { $gte: todayForEvent }
    })
        .sort('-created_date')
        .populate({path: '_post', populate: { path: '_group' }})
        .populate('_commented_by', 'first_name profile_pic')

    // filter the comments that responded to one the current user's posts
      const filteredComments = comments.filter((comment) => {
        return comment._post._posted_by == req.userId;
      });



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


    return res.status(200).json({
      message: `Found ${posts.length} posts!`,
      posts,
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

module.exports = {
  // Main
  edit,
  editSkills,
  get,
  getOverview,
  updateImage,
  // Tasks
  getNextTasksDone,
  getTasks,
  getTasksDone
};
