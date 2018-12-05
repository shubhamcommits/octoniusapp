const { Comment, Post } = require('../api/models');

const createComments = async () => {

  // eslint-disable-next-line no-console
  console.log('---- Starting Migration -----');

  try {
    // Find all posts, sort by creation date
    const posts = await Post.find({})
      .sort('-_id')
      .populate('_group', 'group_name')
      .populate('_posted_by', 'first_name last_name profile_pic')
      .populate('task._assigned_to', 'first_name last_name profile_pic')
      .lean();

    // eslint-disable-next-line no-console
    console.log(posts);

    // Update posts to the new comments strategy
    const postsUpdated = await posts.map(async (post) => {
      try {
        // For each post, update the comments array
        const commentsUpdated = await post.comments.map(async (comment) => {
          try {
            const commentData = {
              content: comment.content,
              _content_mentions: [],
              created_date: comment.created_date,
              _commented_by: comment._commented_by,
              _post: post._id
            };

            // For each comment, create a comment document
            const newComment = await Comment.create(commentData);

            // Return the newComment ID to replace the previous comment object
            return newComment._id
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
          }
        });

        // Update post.comments array with commentsUpdated
        const postUpdated = await Post.findOneAndUpdate({
          _id: post._id
        }, {
          $set: {
            comments: commentsUpdated
          }
        }, {
          new: true
        })
          .lean();

        // return comments array updated to each post
        return postUpdated;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    });

    // eslint-disable-next-line no-console
    console.log(postsUpdated);

    // eslint-disable-next-line no-console
    console.log('---- Migration Finished! -----');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

module.exports = { createComments };
