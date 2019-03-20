const { Group, Post, User } = require('../models');
const { sendErr, sendMail } = require('../../utils');
const moment = require('moment');

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
      .populate('_admins', 'first_name last_name profile_pic role email');

    if (!group) {
      return sendErr(res, err, 'Group not found, invalid group id!', 404);
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

const getCalendarPosts = async (req, res, next) => {
  try {
    const { year, month, groupId } = req.params;

    // current date in view
    const date = moment().month(month).year(year);

    // we want to find posts between the start and end of given month
    const startOfMonthEvent = date.startOf('month').toDate();
    const endOfMonthEvent = date.endOf('month').toDate();
    // tasks are saved under different format in DB
    const startOfMonthTask = date.startOf('month').format('YYYY-MM-DD');
    const endOfMonthTask = date.endOf('month').format('YYYY-MM-DD');


    // get the posts from a specific group AND either type task/event AND between the start and the end of the month given
    const posts = await Post.find({
      $and: [
        { _group: groupId },
        { $or: [{ type: 'event' }, { type: 'task' }] },
        { $or: [{ 'event.due_to': { $gte: startOfMonthEvent, $lt: endOfMonthEvent } }, { 'task.due_to': { $gte: startOfMonthTask, $lte: endOfMonthTask } }] }
      ]
    });

    return res.status(200).json({
      message: 'This month\'s event and task posts',
      posts
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getUserCalendarPosts = async (req, res, next) => {
  try {
    const { year, month, userId } = req.params;

    // current date in view
    const date = moment().month(month).year(year);

    // we want to find posts between the start and end of given month
    const startOfMonthEvent = date.startOf('month').toDate();
    const endOfMonthEvent = date.endOf('month').toDate();
    // tasks are saved under different format in DB
    const startOfMonthTask = date.startOf('month').format('YYYY-MM-DD');
    const endOfMonthTask = date.endOf('month').format('YYYY-MM-DD');


    // get the posts from a specific group AND either type task/event AND between the start and the end of the month given
    const posts = await Post.find({
      $and: [
        { 'task._assigned_to': userId },
        { $or: [{ type: 'event' }, { type: 'task' }] },
        { $or: [{ 'event.due_to': { $gte: startOfMonthEvent, $lt: endOfMonthEvent } }, { 'task.due_to': { $gte: startOfMonthTask, $lte: endOfMonthTask } }] }
      ]
    });

    return res.status(200).json({
      message: 'User\'s this month event and task posts',
      posts
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

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

const filterPosts = async (query, params) => {
  const filters = [];
  let users = [];
  let userIds = [];
  let posts = [];
  console.log('test 1', query);
  console.log('test 2', params);

  // because the posted_by property of post is not populated I have to retrieve the userIds
  //  of the users that match the search values, so that I can enter these IDs in the find function
  //  dow below
  if (query.user === 'true' && !!query.user_value) {
    users = await User.find(
      {
        $and: [
          { full_name: { $regex: query.user_value } },
          { _groups: params.groupId }
        ]
      }
    );
    userIds = users.map(user => user._id);
  }

  for (const filter in query) {
    if (query[filter] === 'true' && filter !== 'user') {
      filters.push(filter);
    }
  }

  if (query.user === 'true' && !!query.user_value && filters.length === 0) {
    posts = await Post.find({
      $and: [
        { _posted_by: { $in: userIds } },
        { _group: params.groupId }
      ]
    })
      .sort('-_id')
      .skip(parseInt(params.alreadyLoaded, 10) || 0)
      .limit(5)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to')
      .populate('event._assigned_to')
      .populate('_liked_by', '_id first_name last_name')
      .lean();
  } else if (query.user === 'true' && !!query.user_value && filters.length > 0) {
    posts = await Post.find({
      $and: [
        { _posted_by: { $in: userIds } },
        { _group: params.groupId },
        { type: { $in: filters } }
      ]
    })
      .sort('-_id')
      .skip(parseInt(params.alreadyLoaded, 10) || 0)
      .limit(5)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to')
      .populate('event._assigned_to')
      .populate('_liked_by', '_id first_name last_name')
      .lean();
  } else {
    console.log('test 4');
    posts = await Post.find({
      $and: [
        { _group: params.groupId },
        { type: { $in: filters } }
      ]
    })
      .sort('-_id')
      .skip(parseInt(params.alreadyLoaded, 10) || 0)
      .limit(5)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to')
      .populate('event._assigned_to')
      .populate('_liked_by', '_id first_name last_name')
      .lean();

    console.log('test 5', posts);
  }

  return posts;
};

const getFilteredPosts = async (req, res) => {
  try {
    const posts = await filterPosts(req.query, req.params);

    res.status(200).json({
      message: 'successfully filtered posts',
      posts
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getNextFilteredPosts = async (req, res) => {
  try {
    const posts = await filterPosts(req.query, req.params);

    console.log('test 6', posts);

    res.status(200).json({
      message: 'successfully filtered posts',
      posts
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
      .populate('_liked_by', 'first_name')
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
      .populate('_liked_by', 'first_name')
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
  getCalendarPosts,
  getUserCalendarPosts,
  getNextPosts,
  getPosts,
  getFilteredPosts,
  getNextFilteredPosts,
  // Tasks
  getNextTasksDone,
  getTasks,
  getTasksDone
};
