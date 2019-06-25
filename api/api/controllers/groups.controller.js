const mongoose = require('mongoose');
const { Group, Post, User } = require('../models');
const { sendErr, sendMail } = require('../../utils');
const moment = require('moment');
const fs = require('fs');
const pandoc = require('node-pandoc');
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

/**
 * Fetches all groups associated with the current user in a given
 * workspace.
 */
const getAllForUser = async (req, res) => {
  const { userId } = req;
  const { workspace } = req.params;

  try {
    const groups = await Group.find({
      _members: { $elemMatch: { $eq: new mongoose.Types.ObjectId(userId) } },
      workspace_name: workspace
    }).select('group_name');

    return res.status(200).json({
      groups
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/**
 * Fetches all the public groups that a user is not
 * a part of.
 */
const getPublicGroups = async (req, res) => {
  const { userId } = req;
  try {
    const groups = await Group.find({
      type: 'agora',
      _members: { $not: { $elemMatch: { $eq: new mongoose.Types.ObjectId(userId) } } },
      _admins: { $not: { $elemMatch: { $eq: new mongoose.Types.ObjectId(userId) } } }
    });

    return res.status(200).json({
      groups
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/**
 * Add a new member to a public group
 */
const addNewMember = async (req, res) => {
  const { userId } = req;
  const { groupId } = req.params;

  await Group.findByIdAndUpdate(groupId, {
    $addToSet: {
      _members: userId
    }
  });

  await User.findByIdAndUpdate(userId, {
    $addToSet: {
      _groups: groupId
    }
  });

  return res.status(200).json({
    message: 'Member added!'
  });
};

/**
 * Deletes the group with the corresponding
 * groupId from the database.
 */
const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const deletedGroup = await Group.findByIdAndDelete(groupId);

    return res.status(200).json({
      message: 'Group deleted successfully!',
      deletedGroup
    });
  } catch (error) {
    return sendErr(res, error);
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
const getDocFileForEditorImport = async (req, res, next) => {
  try {
    // Find all posts that has files and belongs to this group
    const posts = await Post.find({
      $and: [
        // Find normal posts that has comments
        { _id: req.params.groupId },
        { files: { $exists: true, $ne: [] } }
      ]
    })
    
    //check post length
    if(posts.length > 0 && posts[0].files.length > 0){
    //gather source file
    src = `${process.env.FILE_UPLOAD_FOLDER}/${posts[0].files[0].modified_name}`,
    // Arguments
    args = '-f docx -t html5';
 
    // callback function after calling pandoc
    callback = function (err, result) {
      if (err){
        return sendErr(res, err);
      }else{
        return res.status(200).json({
          message: `Found posts containing files!`,
          htmlConversion: result
        });
      }
    };
    //call pandoc
    pandoc(src, args, callback);
    }else{
      return res.status(200).json({
        message: `Could not find imported file`,
        htmlConversion: ""
      });
    }
  } catch (err) {
    return sendErr(res, err);
  }
};
const serveDocFileForEditorExport = async (req, res, next) => {
  try {
    // need to append groupID into file name
    const groupID = req.body.groupID
    //need to append postID into file name
    const postID = req.body.postID
    const filepath = `${process.env.FILE_UPLOAD_FOLDER}${postID + groupID + 'export' + '.docx'}`;
    // console.log(filepath)
    //editor inner html gets passed as source
    src = req.body.editorInfo

    fs.access(filepath, fs.F_OK, error => {
      //if it errored then it means that the file was not found so no old itteration, so we create the docx here
      if(error){
      //console.log(error)
        //Arguments -o is output into directory:
        args = `-f html -t docx -o ./uploads/${postID}${groupID}export.docx`;
        //callback function
        callback = function (err, result) {
          if (err){
            //console.log("called",err)
            return sendErr(res, err);
          }else{
          // send back file name after it was saved result is a boolean to check if the file was made
            return res.status(200).json({message:result, fileName: postID + groupID + 'export.docx'})
          };
          // Without the -o arg, the converted value will be returned.
        };
        
        // Call pandoc
        pandoc(src, args, callback);
      }else{
        // there is an existing file when someone exported out, delete the previous itteration and make a new docx
        fs.unlink(filepath, (err) => {
          if (err) {
            //handle error when file was not deleted properly 
            //console.log(err)
            return sendErr(res, err)
          }else{
            //previous file is removed, need to create a new docx
            //Arguments -o is output into directory:
            args = `-f html -t docx -o ./uploads/${postID}${groupID}export.docx`;
            //callback function
            callback = function (err, result) {
              if (err){
                //console.log("called",err)
                return sendErr(res, err);
              }else{
              // send back file name after it was saved result is a boolean to check if the file was made
                return res.status(200).json({message:result, fileName: postID + groupID + 'export.docx'})
              };
            };
            //Call pandoc
            pandoc(src, args, callback)
          }
        })
      }
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
    // need to convert format to match date from frontend
    const convertedStartMonthEvent = moment(startOfMonthEvent).utc().format('YYYY-MM-DDTHH:mm:ss');
    const convertedEndOfMonthEvent = moment(endOfMonthEvent).utc().format('YYYY-MM-DDTHH:mm:ss');

    // tasks are saved under different format in DB
    const startOfMonthTask = date.startOf('month').format('YYYY-MM-DD');
    const endOfMonthTask = date.endOf('month').format('YYYY-MM-DD');


    // get the posts from a specific group AND either type task/event AND between the start and the end of the month given
    const posts = await Post.find({
      $and: [
        { _group: groupId },
        { $or: [{ type: 'event' }, { type: 'task' }] },
        { $or: [{ 'event.due_to': { $gte: convertedStartMonthEvent, $lte: convertedEndOfMonthEvent } }, { 'task.due_to': { $gte: startOfMonthTask, $lte: endOfMonthTask } }] }
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
    const { year, month, userId, groupId } = req.params;

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
      .populate('_followers', '_id first_name last_name')
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
      .populate('_followers', '_id first_name last_name')
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
      .populate('_followers', '_id first_name last_name')
      .lean();
//needed tags to be false for clicked user and other tags query
  } else if (query.user === 'true' && !!query.user_value && filters.length > 0 && query.tags === 'false') {
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
      .populate('_followers', '_id first_name last_name')
      .lean();
//start of tags query
  //single fetched query for tags
  }else if (query.user === 'false' && query.tags === 'true' && !!query.tags_value && filters.length === 1) {
    posts = await Post.find({
      $and: [
        { _group: params.groupId },
        { tags: { $regex: query.tags_value } }
      ]
    })
      .sort('-_id')
      .skip(parseInt(params.alreadyLoaded, 10) || 0)
      .limit(5)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to')
      .populate('event._assigned_to')
      .populate('_liked_by', '_id first_name last_name')
      .populate('_followers', '_id first_name last_name')
      .lean();
    //checking user to tags search
  } else if (query.user === 'true' && query.tags === 'true' && !!query.user_value && !!query.tags_value && filters.length === 1) {
    posts = await Post.find({
      $and: [
        { _posted_by: { $in: userIds } },
        { _group: params.groupId },
        { tags: { $regex: query.tags_value } }
      ]
    })
      .sort('-_id')
      .skip(parseInt(params.alreadyLoaded, 10) || 0)
      .limit(5)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to')
      .populate('event._assigned_to')
      .populate('_liked_by', '_id first_name last_name')
      .populate('_followers', '_id first_name last_name')
      .lean();
    //checking user to tags within all filters
  }else if (query.user === 'true' && query.tags === 'true' && !!query.user_value && !!query.tags_value && filters.length > 1) {
    posts = await Post.find({
      $and: [
        { _posted_by: { $in: userIds } },
        { _group: params.groupId },
        { tags: { $regex: query.tags_value } },
        { type: { $in: filters }},
      ]
    })
      .sort('-_id')
      .skip(parseInt(params.alreadyLoaded, 10) || 0)
      .limit(5)
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to')
      .populate('event._assigned_to')
      .populate('_liked_by', '_id first_name last_name')
      .populate('_followers', '_id first_name last_name')
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
      .populate('_followers', '_id first_name last_name')
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
      _group: groupId
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

/***
 * Jessie Jia Edit starts
 */

const getTotalNumTasks = async (req, res, next) => {
  try {
    const {
      userId,
      params: {
        groupId
      }
    } = req;

    const today = moment().local().format('YYYY-MM-DD');
    const todayPlus7Days = moment().local().add(7, 'days').format('YYYY-MM-DD');


    const posts = await Post.find({
      $and: [
        { type: 'task' },
        { _group: groupId },
        { 'task.due_to': { $gte: today, $lt: todayPlus7Days } }
      ]
    });

    return res.status(200).json({
      message: `Found ${posts.length} total tasks.`,
      numTasks: posts.length
    });
  } catch (err) {
    return sendErr(res, err);
  }
};


const getNumTodoTasks = async (req, res, next) => {
  try {
    const {
      userId,
      params: {
        groupId
      }
    } = req;

    const today = moment().local().format('YYYY-MM-DD');
    const todayPlus7Days = moment().local().add(7, 'days').format('YYYY-MM-DD');

    const posts = await Post.find({
      $and: [
        { type: 'task' },
        { _group: groupId },
        { 'task.status': 'to do'},
        { 'task.due_to': { $gte: today, $lt: todayPlus7Days } }
      ]
    });

    return res.status(200).json({
      message: `Found ${posts.length} todo tasks.`,
      numTasks: posts.length
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getNumInProgressTasks = async (req, res, next) => {
  try {
    const {
      userId,
      params: {
        groupId
      }
    } = req;

    const today = moment().local().format('YYYY-MM-DD');
    const todayPlus7Days = moment().local().add(7, 'days').format('YYYY-MM-DD');

    const posts = await Post.find({
      $and: [
        { type: 'task' },
        { _group: groupId },
        { 'task.status': 'in progress'},
        { 'task.due_to': { $gte: today, $lt: todayPlus7Days } }
      ]
    });

    return res.status(200).json({
      message: `Found ${posts.length} in progress tasks.`,
      numTasks: posts.length
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getNumDoneTasks = async (req, res, next) => {
  try {
    const {
      userId,
      params: {
        groupId
      }
    } = req;

    const today = moment().local().format('YYYY-MM-DD');
    const todayPlus7Days = moment().local().add(7, 'days').format('YYYY-MM-DD');

    const posts = await Post.find({
      $and: [
        { type: 'task' },
        { _group: groupId },
        {$or: [
            { 'task.status': 'done'},
            { 'task.status': 'completed'},
          ]},
        { 'task.due_to': { $gte: today, $lt: todayPlus7Days } }
      ]
    });

    return res.status(200).json({
      message: `Found ${posts.length} done tasks.`,
      numTasks: posts.length
    });
  } catch (err) {
    return sendErr(res, err);
  }
};
/***
 * Jessie Jia Edit ends
 */

/*  =============
 *  -- EXPORTS --
 *  =============
 */

module.exports = {
  // Main
  get,
  getPrivate,
  getAllForUser,
  getPublicGroups,
  addNewMember,
  deleteGroup,
  // Files
  downloadFile,
  getFiles,
  getDocFileForEditorImport,
  serveDocFileForEditorExport,
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
  getTasksDone,
  getTotalNumTasks,
  getNumTodoTasks,
  getNumInProgressTasks,
  getNumDoneTasks,
};
