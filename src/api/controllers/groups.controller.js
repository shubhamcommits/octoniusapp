const { Post } = require('../models');
const { sendErr, sendMail } = require('../../utils');

/*	===================
 *	-- GROUP METHODS --
 *	===================
 */ 

const getFiles = async (req, res, next) => {
  try {
    // Get user Id added by user authentication midleware
    const userId = req.userId;
    
    // Find user's posts that files and belongs to this group
    const posts = await Post.find({
        $and: [
          // Find normal posts that has comments
          { _posted_by: userId },
          { files: { $exists: true, $ne: []}},
        ]})
      .sort('event.due_to task.due_to -comments.created_date')
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

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
  getFiles
};
