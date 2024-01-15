import { Comment, User, Post, Group, Notification, Flow, Column, TimeTrackingEntity } from "../models";
import { Readable } from 'stream';

const minio = require('minio');

/*  ===============================
 *  -- Group Service --
 *  ===============================
 */
export class GroupService {


  async removeGroup(groupId: string, userId: string) {
    try {
      const group: any = await Group.findOne({ _id: groupId })
          .select('group_name _workspace');

      // Find the group and remove it from the database
      const groupDeleted: any = await Group.findByIdAndDelete(groupId);

      // Remove the group from users, and users´ favorite groups
      await User.updateMany({ _groups: groupId }, {
          $pull: { _groups: groupId, 'stats.favorite_groups': groupId, 'stats.groups': { $elemMatch: { '_group': groupId }}}
      });

      // Delete Posts and Files too
      let postsStream = Readable.from(await Post.find({ _group: groupId }));
      await postsStream.on('data', async (post: any) => {
          // http.delete(`${process.env.POST_SERVER_API}/${post._id}`)
          //     .catch(err => {
          //         return sendError(res, err, 'Internal Server Error!', 500);
          //     });
          await this.removePost(userId, post._id);
      });

      Notification.deleteMany({ _group: groupId });

      // Delete the columns of the group
      Column.deleteMany({ groupId: groupId });

      // Delete the flows
      Flow.deleteMany({ _group: groupId});

      return group;
    } catch (err) {
      throw (err);
    }
  }
  /**
   * This function is used to remove a post
   * @param { userId, postId }
   */
  async removePost(userId: string, postId: string) {
    try {
      // Get post data
      const post: any = await Post.findOne({
        _id: postId
      }).lean();

      const group: any = await Group.findOne({ _id: post._group }).select('_admins').lean();
      const adminIndex = group?._admins.findIndex((admin: any) => (admin._id || admin) == userId);
      // Get user data
      const user: any = await User.findOne({ _id: userId });

      // If user is not an admin or owner, or user is not the post author
      if (!(user.role === 'admin' || user.role === 'owner')
          && !post._posted_by.equals(userId) && adminIndex < 0) {
        // Deny access!
        throw (new Error("User not allowed to remove this post!"));
      }

      // remove subtasks
      await Post.deleteMany({
        $and: [
          { type: 'task' },
          { 'task._parent_task': postId }
        ]
      });

      // remove comments
      if (post.comments.length > 0) {
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

      if (post.type == 'task') {
        // Remove dependencies
        await Post.updateMany({
          'task._dependency_task': postId
        }, {
          'task._dependency_task': undefined
        });

        await Post.updateMany({
          'task._dependent_child': postId
        }, {
          $pull: { 'task._dependent_child': userId }
        }, {
            multi: true
        });
      }

      //delete files, this catches both document insertion as well as multiple file attachment deletes
      if (post.files?.length > 0) {

        //gather source file
        function deleteFiles(files, callback) {
          var i = files.length;
          files.forEach(async (file) => {
            var minioClient = new minio.Client({
              endPoint: process.env.MINIO_DOMAIN,
              port: +(process.env.MINIO_API_PORT),
              useSSL: process.env.MINIO_PROTOCOL == 'https',
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY
            });

            await minioClient.removeObject((user._workspace+'').toLocaleLowerCase(), file?.modified_name, (error) => {
              i--;
              if (error) {
                callback(error);
                return;
              } else if (i <= 0) {
                callback(null);
              }
            });
          });
        }

        deleteFiles(post.files, (err) => {
          if (err) { throw (err); }
          //all files removed);
        });
      }

      //chec/delete document files that were exported
      const filepath = `${postId + post._group + 'export' + '.docx'}`;
      var minioClient = new minio.Client({
        endPoint: process.env.MINIO_DOMAIN,
        port: +(process.env.MINIO_API_PORT),
        useSSL: process.env.MINIO_PROTOCOL == 'https',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY
      });

      minioClient.statObject((user._workspace+'').toLocaleLowerCase(), filepath, async (err, stat) => {
        if (err) {
          throw (err);
        }

        await minioClient.removeObject((user._workspace+'').toLocaleLowerCase(), filepath, (error) => {
          if (error) { throw (error); }
        });
      });

      // Delete the notifications
      await Notification.deleteMany({ _origin_post: postId });

      // Delete post
      const postRemoved = await Post.findByIdAndRemove(postId);

      return postRemoved

    } catch (err) {
      throw (err);
    }
  };

  async editUserTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, userId: string) {
    let dbTimeTrackingEntity = await TimeTrackingEntity.find({
            _id: editTimeTrackingEntityId,
            'times._id': timeId
        }).lean();

    // encontrar el entit anterior para eliminarle el timpo
    // añadir el tiempo al entity si no existe
  };

  async editCategoryTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, category: string) {
    let dbTimeTrackingEntity = await TimeTrackingEntity.find({
            _id: editTimeTrackingEntityId,
            'times._id': timeId
        }).lean();
  };

  async editTimeTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, hours: string, minutes: string) {
    return await TimeTrackingEntity.findByIdAndUpdate({
        _id: editTimeTrackingEntityId
      }, {
          $set: {
            'times.$[time].hours': hours,
            'times.$[time].minutes': minutes,
          }
      },
      {
          arrayFilters: [{ "time._id": timeId }],
          new: true
      })
      .populate('_user', 'first_name last_name profile_pic email')
      .populate('_created_by', 'first_name last_name profile_pic email')
      .lean();
  };

  async editDateTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, date: any) {
    let dbTimeTrackingEntity = await TimeTrackingEntity.find({
            _id: editTimeTrackingEntityId,
            'times._id': timeId
        }).lean();
  };

  async editCommentTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, comment: string) {
    return await TimeTrackingEntity.findByIdAndUpdate({
        _id: editTimeTrackingEntityId
      }, {
          $set: {
            'times.$[time].comment': comment,
          }
      },
      {
          arrayFilters: [{ "time._id": timeId }],
          new: true
      })
      .populate('_user', 'first_name last_name profile_pic email')
      .populate('_created_by', 'first_name last_name profile_pic email')
      .lean();
  };
  /*
  await TimeTrackingEntity.findByIdAndUpdate({
      _id: editTimeTrackingEntityId
    }, {
      $set: {
        _category: editTimeTrackingEntity._category,
        _user: editTimeTrackingEntity._user,
        _task: editTimeTrackingEntity._task,
        'times.$[time].hours': editTimeTrackingEntity.hours,
        'times.$[time].minutes': editTimeTrackingEntity.minutes,
        'times.$[time].comment': editTimeTrackingEntity.comment,
      }
    },
    {
      arrayFilters: [{ "time._id": timeId }],
      new: true
    })
    .populate('_user', 'first_name last_name profile_pic email')
    .populate('_created_by', 'first_name last_name profile_pic email')
    .lean();
  */
}
