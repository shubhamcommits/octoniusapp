const { Group, User } = require('../api/models');

const createPrivateGroups = async () => {

  // eslint-disable-next-line no-console
  console.log('---- Starting Migration -----');

  try {
    // Find all users that has no _private_group
    const users = await User.find({ _private_group: { $exists: false } },
      { first_name: 1, _private_group: 1 })
      .lean();

    // eslint-disable-next-line no-console
    console.log('Users BEFORE migration:\n', users);

    // Create a new private group for each existent user that has no _private_group
    await users.forEach(async (user) => {
      // generate private group data
      const privateGroupData = {
        group_name: 'private',
        _workspace: user._workspace,
        _admins: user._id,
        workspace_name: user.workspace_name
      };

      // create private group
      const Group = await Group.create(privateGroupData);

      // assign the private group for the user
      const userUpdate = await User.findByIdAndUpdate({
        _id: user._id
      }, {
        $set: {
          _private_group: privateGroup
        }
      }, {
        new: true
      });
    });

    // eslint-disable-next-line no-console
    console.log('Users AFTER migration:\n', users);

    // Update posts to the new comments strategy
    //   const postsUpdated = await posts.map(async (post) => {
    //     try {
    //       // For each post, update the comments array
    //       const commentsUpdated = await post.comments.map(async (comment) => {
    //         try {
    //           const commentData = {
    //             content: comment.content,
    //             _content_mentions: [],
    //             created_date: comment.created_date,
    //             _commented_by: `${comment._commented_by}`,
    //             _post: `${post._id}`,
    //           };
    //
    //           // For each comment, create a comment document
    //           const newComment = await Comment.create(commentData);
    //
    //           const postCommentRemoved = await Post.findByIdAndUpdate({
    //             _id: post._id 
    //           }, {
    //             $pull: { comments: { _id: comment._id } }
    //           });
    //
    //           const postCommentIdAdded = await Post.findByIdAndUpdate({
    //             _id: post._id 
    //           }, {
    //             $push: { comments: newComment._id }
    //           });
    //
    //           // Return the newComment ID to replace the previous comment object
    //           return `${newComment._id}`;
    //         } catch (e) {
    //           // eslint-disable-next-line no-console
    //           console.log(e);
    //         }
    //       });
    //
    //       // return comments array updated to each post
    //       // return commentsUpdated;
    //     } catch (e) {
    //       // eslint-disable-next-line no-console
    //       console.log(e);
    //     }
    //   });
    //
    // eslint-disable-next-line no-console
    console.log('---- Migration Finished! -----');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

module.exports = { createPrivateGroups };
