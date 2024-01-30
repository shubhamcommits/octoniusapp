import { isSameDay } from "../../utils";
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
    let dbTimeTrackingEntity = await TimeTrackingEntity.findOne({
        _id: editTimeTrackingEntityId,
        'times._id': timeId
      }).lean();
    
    if (!dbTimeTrackingEntity) {
      return {
        message: 'The time tracking entry does not exists.',
        error: true
      };
    }

    const task = dbTimeTrackingEntity._task;
    const category = dbTimeTrackingEntity._category;
    let time;
    let index = (!!dbTimeTrackingEntity && !!dbTimeTrackingEntity.times) ? dbTimeTrackingEntity.times.findIndex(t => t._id == timeId) : -1;
    if (index >= 0) {
      time = dbTimeTrackingEntity.times[index];
    }

    let tmpTTE = await TimeTrackingEntity.findOne({
      $and: [
        { _user: userId },
        { _task: task },
        { _category: category }
      ]}).lean();

    index = (!!tmpTTE && !!tmpTTE.times) ? tmpTTE.times.findIndex(t => isSameDay(t.date, time.date)) : -1;
    if (index >= 0) {
      return {
        message: 'The user already has a time recorded for this task with the same category.',
        error: true
      };
    } else if (!!time && !!dbTimeTrackingEntity.times && dbTimeTrackingEntity.times.length > 1) {
      await TimeTrackingEntity.findByIdAndUpdate({
          _id: editTimeTrackingEntityId
        }, {
          $pull: {
            times: {
              _id: timeId
            }
          }
        }).lean();
    } else {
      await TimeTrackingEntity.findByIdAndDelete({
          _id: editTimeTrackingEntityId
        });
    }
    
    if(!!tmpTTE) {
      tmpTTE = await TimeTrackingEntity.findOneAndUpdate({
          _id: tmpTTE._id  
        }, {
          $push: { "times": {
            date: time.date,
            hours: time.hours,
            minutes: time.minutes,
            comment: time.comment
          }}
        }, {
          new: true
        })
        .populate('_user', 'first_name last_name profile_pic email')
        .populate('_created_by', 'first_name last_name profile_pic email')
        .lean();
    } else {
      tmpTTE = await TimeTrackingEntity.create({
          _user: userId,
          _task: task,
          _category: category,
          times: [{
            date: time.date,
            hours: time.hours,
            minutes: time.minutes,
            comment: time.comment
          }],
          _created_by: dbTimeTrackingEntity._created_by
        });

      tmpTTE = await TimeTrackingEntity.findById({
          _id: tmpTTE._id
        })
        .populate('_user', 'first_name last_name profile_pic email')
        .populate('_created_by', 'first_name last_name profile_pic email')
        .lean();
    }

    return {
      message: 'Time Tracking entity edited!',
      timeTrackingEntity: tmpTTE
    };
  };

  async editCategoryTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, newCategory: string) {
    let dbTimeTrackingEntity = await TimeTrackingEntity.findOne({
        _id: editTimeTrackingEntityId,
      }).lean();
    
    if (!dbTimeTrackingEntity) {
      return {
        message: 'The time tracking entry does not exists.',
        error: true
      };
    }

    const task = dbTimeTrackingEntity._task;
    const userId = dbTimeTrackingEntity._user;
    let time;
    let index = (!!dbTimeTrackingEntity && !!dbTimeTrackingEntity.times) ? dbTimeTrackingEntity.times.findIndex(t => t._id == timeId) : -1;
    if (index >= 0) {
      time = dbTimeTrackingEntity.times[index];
    }

    let tmpTTE = await TimeTrackingEntity.findOne({
      $and: [
        { _user: userId },
        { _task: task },
        { _category: newCategory }
      ]}).lean();

    index = (!!tmpTTE && !!tmpTTE.times) ? tmpTTE.times.findIndex(t => isSameDay(t.date, time.date)) : -1;
    if (index >= 0) {
      return {
        message: 'The user already has a time recorded for this task with the same category.',
        error: true
      };
    } else if (!!time && !!dbTimeTrackingEntity.times && dbTimeTrackingEntity.times.length > 1) {
      await TimeTrackingEntity.findByIdAndUpdate({
          _id: editTimeTrackingEntityId
        }, {
          $pull: {
            times: {
              _id: timeId
            }
          }
        }).lean();
    } else {
      await TimeTrackingEntity.findByIdAndDelete({
          _id: editTimeTrackingEntityId
        });
    }

    if(!!tmpTTE) {
      tmpTTE = await TimeTrackingEntity.findOneAndUpdate({
          _id: tmpTTE._id  
        }, {
          $push: { "times": {
            date: time.date,
            hours: time.hours,
            minutes: time.minutes,
            comment: time.comment
          }}
        }, {
          new: true
        })
        .populate('_user', 'first_name last_name profile_pic email')
        .populate('_created_by', 'first_name last_name profile_pic email')
        .lean();
    } else {
      tmpTTE = await TimeTrackingEntity.create({
          _user: userId,
          _task: task,
          _category: newCategory,
          times: [{
            date: time.date,
            hours: time.hours,
            minutes: time.minutes,
            comment: time.comment
          }],
          _created_by: dbTimeTrackingEntity._created_by
        });

      tmpTTE = await TimeTrackingEntity.findById({
          _id: tmpTTE._id
        })
        .populate('_user', 'first_name last_name profile_pic email')
        .populate('_created_by', 'first_name last_name profile_pic email')
        .lean();
    }

    return {
      message: 'Time Tracking entity edited!',
      timeTrackingEntity: tmpTTE
    };
  };

  async editTimeTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, editTimeTrackingEntity: any) {
    let tte;
    if (!!timeId && !timeId.includes('octonius_random')) {
      if (editTimeTrackingEntity?.hours != '00' || editTimeTrackingEntity?.minutes != '00') {
        tte = await TimeTrackingEntity.findByIdAndUpdate({
            _id: editTimeTrackingEntityId
          }, {
              $set: {
                'times.$[time].hours': editTimeTrackingEntity?.hours,
                'times.$[time].minutes': editTimeTrackingEntity?.minutes,
              }
          },
          {
              arrayFilters: [{ "time._id": timeId }],
              new: true
          })
          .populate('_user', 'first_name last_name profile_pic email')
          .populate('_created_by', 'first_name last_name profile_pic email')
          .lean();
      }
    } else {
      let tmpTTE = await TimeTrackingEntity.findOne({
        $and: [
          { _user: editTimeTrackingEntity?._user },
          { _task: editTimeTrackingEntity?._task },
          { _category: editTimeTrackingEntity?._category }
        ]}).lean();

        if (!!tmpTTE) {
          if (editTimeTrackingEntity?.hours != '00' || editTimeTrackingEntity?.minutes != '00') {
            tte = await TimeTrackingEntity.findOneAndUpdate({
                _id: tmpTTE._id
              }, {
                $push: { "times": {
                  date: editTimeTrackingEntity?.date,
                  hours: editTimeTrackingEntity?.hours,
                  minutes: editTimeTrackingEntity?.minutes,
                  comment: editTimeTrackingEntity?.comment
                }}
              }, {
                new: true
              })
              .populate('_user', 'first_name last_name profile_pic email')
              .populate('_created_by', 'first_name last_name profile_pic email')
              .lean();
          } else if (!!timeId && !timeId.includes('octonius_random')) {
            tte = await TimeTrackingEntity.findByIdAndUpdate({
                _id: editTimeTrackingEntityId
              }, {
                $pull: {
                  times: {
                    _id: timeId
                  }
                }
              }, {
                new: true
              })
              .populate('_user', 'first_name last_name profile_pic email')
              .populate('_created_by', 'first_name last_name profile_pic email')
              .lean();
          }
        } else if (editTimeTrackingEntity?.hours != '00' || editTimeTrackingEntity?.minutes != '00') {
          tte = await TimeTrackingEntity.create({
              _user: editTimeTrackingEntity?._user,
              _task: editTimeTrackingEntity?._task,
              _category: editTimeTrackingEntity?._category,
              times: [{
                date: editTimeTrackingEntity?.date,
                hours: editTimeTrackingEntity?.hours,
                minutes: editTimeTrackingEntity?.minutes,
                comment: editTimeTrackingEntity?.comment
              }],
              _created_by: editTimeTrackingEntity?._user
            });

          tte = await TimeTrackingEntity.findById({
              _id: tte._id
            })
            .populate('_user', 'first_name last_name profile_pic email')
            .populate('_created_by', 'first_name last_name profile_pic email')
            .lean();
        }
    }

    return {
      message: 'Time Tracking entity edited!',
      timeTrackingEntity: tte
    };
  };

  async editDateTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, newDate: any) {
    let dbTimeTrackingEntity = await TimeTrackingEntity.findOne({
        _id: editTimeTrackingEntityId,
        // 'times._id': timeId
      }).lean();
    
    if (!dbTimeTrackingEntity) {
      return {
        message: 'The time tracking entry does not exists.',
        error: true
      };
    }
    
    const index = (!!dbTimeTrackingEntity && !!dbTimeTrackingEntity.times) ? dbTimeTrackingEntity.times.findIndex(t => isSameDay(t.date, newDate)) : -1;
    if (index >= 0) {
      return {
        message: 'The user already has a time recorded for this task with the same category.',
        error: true
      };
    } else {
      const tte = await TimeTrackingEntity.findByIdAndUpdate({
          _id: editTimeTrackingEntityId
        }, {
            $set: {
              'times.$[time].date': newDate,
            }
        },
        {
            arrayFilters: [{ "time._id": timeId }],
            new: true
        })
        .populate('_user', 'first_name last_name profile_pic email')
        .populate('_created_by', 'first_name last_name profile_pic email')
        .lean();

      return {
        message: 'Time Tracking entity edited!',
        timeTrackingEntity: tte
      };
    }
  };

  async editCommentTimeTrackingEntity(editTimeTrackingEntityId: string, timeId: string, comment: string) {
    const tte = await TimeTrackingEntity.findByIdAndUpdate({
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

    return {
      message: 'Time Tracking entity created!',
      timeTrackingEntity: tte
    };
  };
}
