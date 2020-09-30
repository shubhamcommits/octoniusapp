import { Notification, User, File } from "../models";
import { Readable } from 'stream';

/*  ===============================
 *  -- NOTIFICATIONS Service --
 *  ===============================
 */

export class NotificationsService {

    /**
     * This function is responsible for notifying the user on mention on new comment
     * @param { _id, _content_mentions, _commented_by, _post } comment 
     */
    async newCommentMentions(comment: any) {
        try {
            await comment._content_mentions.forEach(async (user: any) => {
                const notification = await Notification.create({
                    _actor: comment._commented_by,
                    _owner: user,
                    _origin_comment: comment._id,
                    _origin_post: comment._post,
                    message: 'mentioned you on',
                    type: 'mention'
                });
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new event to them
     * @param { _id, event._assigned_to, _posted_by } post 
     */
    async newEventAssignments(post: any) {
        try {

            // Let usersStream
            let userStream: any;

            // If all members are selected
            if (post.event._assigned_to.includes('all')) {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(await User.find({
                    _groups: post._group
                }).select('first_name email'))
            } else {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(post.event._assigned_to);
            }

            await userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: post._posted_by,
                    _owner: user,
                    _origin_post: post._id,
                    message: 'assigned you on',
                    type: 'assignment'
                });
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for notifying the user on mention on new post
     * @param { _id, _posted_by, _content_mentions } post 
     */
    async newPostMentions(post: any) {
        try {

            let userStream: any;

            if (post._content_mentions.includes('all')) {

                // Create Readble Stream from the Post Contents
                userStream = Readable.from(await User.find({
                    _groups: post._group
                }).distinct('_id'))

            }   else {

                // User Stream from the post contents
                userStream = Readable.from(post._content_mentions)
            }

            userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: post._posted_by,
                    _owner: user,
                    _origin_post: post._id,
                    message: 'mentioned you on',
                    type: 'mention'
                })
            })
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible for notifying the user on mention on new Folio
     * @param { _id, _posted_by, _content_mentions } post 
     */
    async newFolioMentions(file: string, actor: string, owner: string) {
        try {

            let fileData: any = await File.findById(file).select('_group')
            /*
            .populate([
                { path: '_group', select: 'group_name group_avatar workspace_name' },
            ])*/
            ;

            // Let usersStream
            let userStream: any;

            // If all members are selected
            if (owner.includes('all')) {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(await User.find({
                    _groups: fileData._group
                }).select('first_name email'))
            } else {

                // Create Readble Stream from the Event Assignee
                userStream = Readable.from(await User.find({
                    _id: owner
                }).select('first_name email'));
            }

            await userStream.on('data', async (user: any) => {
                const notification = await Notification.create({
                    _actor: actor,
                    _owner: user,
                    _origin_post: file,
                    message: 'mentioned you on',
                    type: 'mention_folio'
                });
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on assigning of a new task to them
     * @param { _id, task._assigned_to, _posted_by } post 
     */
    async newTaskAssignment(post: any) {
        try {
            const notification = await Notification.create({
                _actor: post._posted_by,
                _owner: post.task._assigned_to,
                _origin_post: post._id,
                message: 'assigned you',
                type: 'assignment'
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying all the user on re-assigning of a new task to them
     * @param { _id, task._assigned_to, _posted_by } post
     */
    async newTaskReassignment(post: any) {

        try {
            const notification = await Notification.create({
                _actor: post._posted_by,
                _owner: post.task._assigned_to,
                _origin_post: post._id,
                message: 'reassigned you',
                type: 'assignment'
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * This function is responsible to notifying the creator of the post when the task changed the status
     * @param { _id, task._assigned_to, _posted_by } post
     * @param status
     */
    async taskStatusChanged(post: any, status: string, actor: string, owner: string) {
        try {
            const notification = await Notification.create({
                _actor: actor,
                _owner: owner,
                _origin_post: post._id,
                message: status,
                type: status
            });
        } catch (err) {
            throw err;
        }
    };
    
    /**
    * This function is responsible for notifying the user getting a new comment
    * @param { _id, _commented_by, _post, _posted_by } comment 
    */
   async newComment(comment: any, owner: string) {
      try {
      const notification = await Notification.create({
        _actor: comment._commented_by,
        _owner: owner,
        _origin_comment: comment._id,
        _origin_post: comment._post,
        message: 'commented on',
        type: 'comment'
      });
      } catch (err) {
        throw err;
      }
   };
    
   /**
   * This function is responsible for notifying the user´s comment is liked
   * @param { _id, _commented_by, _post, _posted_by } comment 
   */
  async likeComment(comment: any, owner: string, actor: string) {
     try {
     const notification = await Notification.create({
       _actor: actor,
       _owner: owner,
       _origin_comment: comment._id,
       _origin_post: comment._post,
       message: 'liked your comment on',
       type: 'like_comment'
     });
     } catch (err) {
        throw err;
     }
  };

  /**
   * This function is responsible to notifying all the user on a new follower
   */
  async followPost(post: any, follower: string) {
      try {
          const notification = await Notification.create({
              _actor: follower,
              _owner: post._posted_by,
              _origin_post: post._id,
              message: 'follows',
              type: 'follow'
          });
      } catch (err) {
        throw err;
      }
  };

  /**
   * This function is responsible to notifying all the user on a new like
   */
  async likePost(post: any, owner: string, actor: string) {
      try {
          const notification = await Notification.create({
              _actor: actor,
              _owner: owner,
              _origin_post: post._id,
              message: 'likes',
              type: 'likes'
          });
      } catch (err) {
        throw err;
      }
  };

  /**
   * This function is responsible for fetching the latest first 5 read notifications
   * @param userId 
   */
  async getRead(userId: string) {
      try {
          const notifications = await Notification.find({
              _owner: userId,
              read: true
          })
              .limit(5)
              .sort('-created_date')
              .populate('_actor', 'first_name last_name profile_pic')
              .populate({ path: '_origin_post', populate: { path: '_group' } })
              .populate('_origin_comment')
              .populate('_owner', 'first_name last_name profile_pic')
              .populate('_origin_folio')
              .lean();

          return notifications;
      } catch (err) {
        throw err;
      }
  };

  /**
   * This function is responsible for fetching the latest first 5 un-read notifications
   * @param userId 
   */
  async getUnread(userId: string) {
      try {
          const notifications = await Notification.find({
              _owner: userId,
              read: false
          })
              .sort('-created_date')
              .populate('_actor', 'first_name last_name profile_pic')
              .populate({ path: '_origin_post', populate: { path: '_group' } })
              .populate('_origin_comment')
              .populate('_owner', 'first_name last_name profile_pic')
              .populate('_origin_folio')
              .lean();

          return notifications;
      } catch (err) {
        throw err;
      }
  };

  /**
   * This function is responsible for fetching the marking the notifications to read
   * @param topListId 
   */
  async markRead(topListId: string) {
    try {
        const markRead = await Notification.updateOne({
            $and: [
                { read: false },
                { _id: { $lte: topListId } }
            ]
        }, {
            $set: {
                read: true
            }
        });

        return true;
    } catch (err) {
        throw err;
    }
  };
}
