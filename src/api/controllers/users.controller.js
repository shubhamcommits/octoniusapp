const moment = require('moment');

const { Post } = require('../models');

const { sendErr } = require('../../utils');

// -| MAIN |-

const getOverview = async (req, res, next) => {
  try {
    const { userId } = req;

    // Generate the actual time
    const todayForEvent = moment.utc()
      .hours(0).minutes(0).seconds(0)
      .milliseconds(0)
      .format();
    const today = moment().format('YYYY-MM-DD');

    // Generate the +48h time
    const todayPlus48ForEvent = moment.utc().add(48, 'hours').format();
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

    const posts = await Post.find({
      $or: [{
        // From this user...
        $and: [
          // Find normal posts that has comments
          { _posted_by: userId },
          { comments: { $exists: true, $ne: [] } },
          { 'comments.created_date': { $gte: todayForEvent } }
        ]
      }, {
        $and: [
          // Find tasks due to today
          { 'task._assigned_to': userId },
          { 'task.due_to': { $in: [today, tomorrow] } }
        ]
      }, {
        $and: [
          // Find events due to today
          { 'event._assigned_to': userId },
          { 'event.due_to': { $gte: todayForEvent, $lt: todayPlus48ForEvent } }
        ]
      }]
    })
      .sort('event.due_to task.due_to -comments.created_date')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('comments._commented_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_group', 'group_name group_avatar')
      .populate('_liked_by', 'first_name last_name');

    return res.status(200).json({
      message: `Found ${posts.length} posts!`,
      posts
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
  getOverview,
  // Tasks
  getNextTasksDone,
  getTasks,
  getTasksDone
};
