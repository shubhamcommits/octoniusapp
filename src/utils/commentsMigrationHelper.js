const { Comment, Post } = require('../api/models');

const createComments = async () => {
  try {
    // Find all posts, sort by creation date
    const posts = await Post.find({})
      .sort('-_id')
      .limit(20)
      .populate('_group', 'group_name')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name profile_pic')
      .lean();

    // For each post, get all comments ordered
    
      // For each comment, create a comment document
    
      // Save the comment ID on a comments array, ordered
    
     // Replace the post comments by the comments ids array
    console.log(posts);
  } catch (e) {
    console.log(e);
  }
};

const insertCIdsOnPosts = async () => {
  try {

  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createComments,
  insertCIdsOnPosts
};
