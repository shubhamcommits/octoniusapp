const { Comment, Post } = require('../api/models');

const createComments = async () => {
  try {
    const posts = await Post.find({})
      .sort('-_id')
      .limit(20)
      .populate('_group', 'group_name')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name profile_pic')
      .lean();

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
