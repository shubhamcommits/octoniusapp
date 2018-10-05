const { Group, Post } = require('../models');
const { sendErr, sendMail } = require('../../utils');

/*	=======================
 *	-- GROUP CONTROLLERS --
 *	=======================
 */ 

// -| Group files controllers |-

const downloadFile = async (req, res, next) => {
  try {
    const { fileName, groupId } = req.params;
    const filepath = `${process.env.FILE_UPLOAD_FOLDER}/${fileName}`;

    // Check if user belongs to this group, prevent hardcoded requests 
    const group = await Group.find({
      $and: [
        // Find normal posts that has comments
        { _id: groupId},
        { $or: [
          { _members: req.userId},
          { _admins: req.userId}
        ]}
      ]});

    if (!group) {
      return sendErr(res, err, 'User not allowed to access this file!', 403);
    }

    return res.sendFile(filepath);

  } catch (err) {
    return sendErr(res, err);
  }
};

const getFiles = async (req, res, next) => {
  try {
    // Find all posts that has files and belongs to this group
    const posts = await Post.find({
      $and: [
        // Find normal posts that has comments
        { _group: req.params.groupId},
        { files: { $exists: true, $ne: []}},
      ]})
      .sort('-created_date')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('comments._commented_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name')
      .populate('event._assigned_to', 'first_name last_name')
      .populate('_group', 'group_name group_avatar')
      .populate('_liked_by', 'first_name last_name');

    return res.status(200).json({
      message: `Found ${posts.length} posts containing files!`,
      posts,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

// -| Group posts controllers |-

const getNextPosts = async (req, res, next) => {
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

const getPosts = async (req, res, next) => {
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

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
  // Group files controllers
  downloadFile,
  getFiles,
  // Group posts controllers
  getNextPosts,
  getPosts
};
