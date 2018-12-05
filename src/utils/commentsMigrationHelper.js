const { Comment, Post } = require('../api/models');

const createComments = async () => {
  try {
    // Find all posts, sort by creation date
    const posts = await Post.find({})
      .sort('-_id')
      .populate('_group', 'group_name')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name profile_pic')
      .lean();

    // Update posts to the new comments strategy
    const postsUpdated = await posts.map(async (post) => {
      try {
        // For each post, update the comments array
        const commentsUpdated = await post.comments.map(async (comment) => {
          const commentData = {
            content: ,
            _content_mentions: [],
            created_date: ,
            _commented_by: ,
            _post: 
          }

        });

        if (newComment) {
          return postUpdated;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    });
    // For each comment, create a comment document

    // Save the comment ID on a comments array, ordered

    // Replace the post comments by the comments ids array
    // eslint-disable-next-line no-console
    console.log(posts, postsUpdated);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

const insertCIdsOnPosts = async () => {
  try {

  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

module.exports = {
  createComments,
  insertCIdsOnPosts
};
