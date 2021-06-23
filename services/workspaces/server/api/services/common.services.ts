import { Post, Notification, Column, Flow, Group, Comment } from '../models';
const fs = require('fs');

/*  ===============================
 *  -- COMMON Service --
 *  ===============================
 */
export class CommonService {

  /**
   * This function is used to remove a group
   * @param { groupId }
   */
  async removeGroup(groupId: string ) {
    try {

      // Find the group and remove it from the database
      await Group.findByIdAndDelete(groupId)
        .select('group_name _workspace')

      // Delete Posts and Files too
      const posts = await Post.find({ _group: groupId });
      posts.forEach(async post => {
          await this.removePost(post._id);
      });

      await Notification.deleteMany({ _origin_group: groupId });

      // Delete the columns of the group
      await Column.deleteMany({ _group: groupId });

      // Delete the flows
      await Flow.deleteMany({ _group: groupId});

    } catch (err) {
      throw (err);
    }
  };

  /**
   * This function is used to remove a post
   * @param { postId }
   */
  async removePost(postId: string ) {
    try {

      // Get post data
      const post: any = await Post.findOne({
        _id: postId
      }).lean();

      // remove subtasks
      await Post.deleteMany({
        $and: [
          { type: 'task' },
          { 'task._parent_task': postId }
        ]
      });

      // remove comments
      if(post.comments.length > 0) {
        await post.comments?.forEach(async (commentId) => {
          try {
            await Comment.findByIdAndRemove(commentId);
  
            await Notification.deleteMany({ _origin_comment: commentId });
            return true;
          } catch (err) {
            throw (err);
          }
        })
      }

      //delete files, this catches both document insertion as well as multiple file attachment deletes
      if (post.files?.length > 0) {
        //gather source file
        function deleteFiles(files, callback) {
          var i = files.length;
          files.forEach(function (filepath) {
            const finalpath = `${process.env.FILE_UPLOAD_FOLDER}${filepath.modified_name}`
            fs.unlink(finalpath, function (err) {
              i--;
              if (err) {
                callback(err);
                return;
              } else if (i <= 0) {
                callback(null);
              }
            });
          });
        }
        deleteFiles(post.files, function (err) {
          if (err) { throw (err); }
          //all files removed);
        });
      }
      //chec/delete document files that were exported
      const filepath = `${process.env.FILE_UPLOAD_FOLDER}${postId + post._group + 'export' + '.docx'}`;
      //check if file exists
      fs.access(filepath, fs.F_OK, error => {
        //if error there was no file
        if (!error) {
          //the file was there now unlink it
          fs.unlink(filepath, (err) => {
            //handle error when file was not deleted properly
            if (err) { throw (err); }
            //deleted document
          })
        }
      })

      // Delete the notifications
      await Notification.deleteMany({ _origin_post: postId });

      // Delete post
      const postRemoved = await Post.findByIdAndRemove(postId);

      return postRemoved

    } catch (err) {
      throw (err);
    }
  };
}
