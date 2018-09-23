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
        ]}, {
          _id: 0,
          files: 1
        }).lean();

    // Gererate the files array
    const files = [];
    
    // Push every file from every post
    posts.forEach(post => { files.push(...post.files); });

    return res.status(200).json({
      message: `Found ${files.length} posts!`,
      files,
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
