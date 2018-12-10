const { Comment, Post } = require('../api/models');

const createComments = async () => {

  // eslint-disable-next-line no-console
  console.log('---- Starting Migration -----');

  try {
    // Find all posts, sort by creation date
    const posts = await Post.find({})
      .sort('-_id')
      .lean();

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
              _commented_by: `${comment._commented_by}`,
              _post: `${post._id}`,
            };

            // For each comment, create a comment document
            const newComment = await Comment.create(commentData);

            const postCommentRemoved = await Post.findByIdAndUpdate({
              _id: post._id 
            }, {
              $pull: { comments: { _id: comment._id } }
            });

            const postCommentIdAdded = await Post.findByIdAndUpdate({
              _id: post._id 
            }, {
              $push: { comments: newComment._id }
            });

            // Return the newComment ID to replace the previous comment object
            return `${newComment._id}`;
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
          }
        });

        // return comments array updated to each post
        // return commentsUpdated;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    });

    // eslint-disable-next-line no-console
    console.log('---- Migration Finished! -----');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

module.exports = { createComments };
