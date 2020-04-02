import { Post, User, Comment } from '../models';
import http from 'axios';
const moment = require('moment');
import { Request } from 'express';
const fs = require('fs');

/*  ===============================
 *  -- POSTS Service --
 *  ===============================
 */

 export class PostService{

    /**
     * 
     * @param postData This function is responsible for adding a new post
     */
    async addPost(postData: any){
        try {
            let post: any = await Post.create(postData);
              
            if (post._content_mentions.length !== 0) {
              // Create Notification for mentions on post content
              await http.post('http://localhost:9000/api/new-mention',{
                  post: post
              });
            //   notifications.newPostMentions(post);
        
              // start the process to send an email to every user mentioned
              await post._content_mentions.forEach((user, i) => {

                    http.post('http://localhost:2000/api/user-post-mention', {
                    post: post,
                    user: user
                });
                // sendMail.userMentionedPost(post, user, i);
              });
            }
        
            // Send Email notification after post creation
            switch (post.type) {
              case 'task':
                if(post.task.unassigned != 'Yes')
                {
                // await notifications.newTaskAssignment(post);
                await http.post('http://localhost:9000/api/new-task', {
                    post: post
                });
                // await sendMail.taskAssigned(post);
                await http.post('http://localhost:2000/api/task-assigned', {
                    post: post
                });
                // await sendMail.scheduleTaskReminder(post);
                await http.post('http://localhost:2000/api/task-reminder', {
                    post: post
                });
                }
                break;
              case 'event':
                // await notifications.newEventAssignments(post);
                await http.post('http://localhost:9000/api/new-event', {
                    post: post
                });
                // await sendMail.eventAssigned(post);
                await http.post('http://localhost:2000/api/event-assigned', {
                    post: post
                });
                // await sendMail.scheduleEventReminder(post);
                await http.post('http://localhost:2000/api/event-reminder', {
                    post: post
                });
                break;
              default:
                break;
            }
        
            //  populate the assigned_to property of this document
            if (post.type === 'task') {
              post = await Post.populate(post, [{ path: 'task._assigned_to' }, { path: '_group' }, { path: '_posted_by' }]);
            } else if (post.type === 'performance_task') {
              post = await Post.populate(post, [{ path: 'performance_task._assigned_to' }, { path: '_group' }, { path: '_posted_by' }]);
            } else if (post.type === 'event') {
              post = await Post.populate(post, [{ path: 'event._assigned_to' }, { path: '_group' }, { path: '_posted_by' }]);
            } else if (post.type === 'normal') {
              post = await Post.populate(post, [{ path: '_group' }, { path: '_posted_by' }]);
            }
            return post;
          } catch (err) {
            return err;
          }
    }


    /**
     * This function is responsible for editing a post
     */
    edit = async (req: Request) => {
        try {
          let postData: any;
          switch (req.body.type) {
            case 'task':
              if(req.body.unassigned == 'Yes'){
                postData = {
                  title: req.body.title,
                  content: req.body.content,
                  _content_mentions: req.body._content_mentions,
                  tags: req.body.tags,
                  _read_by: [],
                  task: {
                    due_to: (req.body.date_due_to) ? moment(req.body.date_due_to).format('YYYY-MM-DD') : null,
                    _assigned_to: req.body.assigned_to,
                    status: req.body.status, 
                    unassigned : req.body.unassigned,
                    _column: req.body._column
                  }
                }
              }
              if(req.body.unassigned == 'No'){   
                postData = {
                  title: req.body.title,
                  content: req.body.content,
                  _content_mentions: req.body._content_mentions,
                  tags: req.body.tags,
                  _read_by: [],
                  task: {
                    due_to: (req.body.date_due_to) ? moment(req.body.date_due_to).format('YYYY-MM-DD') : null,
                    _assigned_to: req.body.assigned_to,
                    status: req.body.status , 
                    unassigned : req.body.unassigned,
                    _column: req.body._column
                  }
                };
              }
              break;
      
              case 'performance_task':
              postData = {
                title: req.body.title,
                content: req.body.content,
                _content_mentions: req.body._content_mentions,
                skill: req.body.skill,
                _read_by: [],
                performance_task: {
                  _assigned_to: req.body.assigned_to[0]._id,
                  status: req.body.status
                }
              };
              break;
      
            case 'event':
              // transform due_to time to UTC
              req.body.date_due_to = moment.utc(req.body.date_due_to).format();
      
              // make arr with ids user who got assigned to event
              const assignedUsers = req.body.assigned_to.map((item, index) => item._id);
      
              postData = {
                title: req.body.title,
                content: req.body.content,
                _content_mentions: req.body._content_mentions,
                tags: req.body.tags,
                _read_by: [],
                event: {
                  due_to: req.body.date_due_to,
                  _assigned_to: assignedUsers
                }
              };
              break;
      
            case 'normal':
      
              postData = {
                title: req.body.title,
                content: req.body.content,
                _content_mentions: req.body._content_mentions,
                tags: req.body.tags,
                _read_by: [],
              };
              break;
      
            case 'document':
      
              postData = {
                title: req.body.title,
                content: req.body.content,
              };
              break;
          }

      
          const post:any = await Post.findOne({ _id: req.params.postId });
      
          const user:any = await User.findOne({ _id: req['userId'] });
      
          // Allow all group's users to edit a multi editor post
          if (post.type === 'document' && user._groups.includes(post._group)) {
            user.role = 'admin';
          }
      
          // if the user is not an owner or an admin and is not the one who posted, we throw auth error
          if (!(user.role === 'owner' || user.role === 'admin') && !post._posted_by == req['userId']) {
            throw(null);
          }
      
          // postData._read_by = []
          // console.log(postData);
          const updatedPost = await Post.findOneAndUpdate({
            _id: req.params.postId
          }, {
              $set: postData
            }, {
              new: true
            })
            .populate('_posted_by')
            .populate('task._assigned_to')
            .populate('performance_task._assigned_to')
            .populate('performance_task._skills')
            .populate('event._assigned_to')
            .populate('_liked_by');
      
      
          // Create Notification for mentions on post content
          if (post._content_mentions.length !== 0) {
            // notifications.newPostMentions(post);
            await http.post('http://localhost:9000/api/new-mention', {
                post: post
            });
          }
      
          // Send Email notification after post creation
          switch (post.type) {
            case 'task':
            //   await notifications.newTaskAssignment(post);
              await http.post('http://localhost:9000/api/new-task', {
                  post: post
              });
            //   await sendMail.taskAssigned(post);
              await http.post('http://localhost:2000/api/task-assigned', {
                  post: post
              });
              break;
            case 'event':
            //   await notifications.newEventAssignments(post);
              await http.post('http://localhost:9000/api/new-event', {
                  post: post
              });
            //   await sendMail.eventAssigned(post);
              await http.post('http://localhost:2000/api/event-assigned', {
                  post: post
              });
              break;
            default:
              break;
          }
      
          return updatedPost;
        } catch (err) {
          throw(err);
        }
      };


      /**
       * This function is responsible for retrieving a post
       * @param postId
       */
      get = async (postId) => {
        try {
          // Get post data
          const post = await Post.findOne({ 
            _id: postId 
          })
            .populate('_group', '_id')
            .populate('_posted_by', 'first_name last_name profile_pic')
            .populate('_liked_by', 'first_name last_name')
            .populate('comments._commented_by', 'first_name last_name profile_pic')
            .populate('task._assigned_to', 'first_name last_name')
            // .populate('task._column', 'title')
            .populate('performance_task._assigned_to', 'first_name last_name')
            .populate('event._assigned_to', 'first_name last_name')
            .lean();
      
          return post;
        } catch (err) {
          throw(err);
        }
      };
      

      /**
       * This function is used to remove a post
       * @param { userId, postId }
       */
      remove = async (userId, postId,) => {
        try {
          // Get post data
          const post:any = await Post.findOne({
            _id: postId
          }).lean();
      
          // Get user data
          const user:any = await User.findOne({ _id: userId });
      
          if (
            // If user is not an admin or owner
            !(user.role === 'admin' || user.role === 'owner')
            // ...user is not the post author...
            && !post._posted_by.equals(userId)
          ) {
            // Deny access!
            throw(null);
            // return sendErr(res, null, 'User not allowed to remove this post!', 403);
          }
      
          await post.comments.forEach(async (commentId) => {
            try {
              await Comment.findByIdAndRemove(commentId);
      
              return true;
            } catch (err) {
              throw(err);
            }
          });
      //delete files, this catches both document insertion as well as multiple file attachment deletes
         if(post.files.length > 0){
          //gather source file
          function deleteFiles(files, callback){
            var i = files.length;
            files.forEach(function(filepath){
              const finalpath =`${process.env.FILE_UPLOAD_FOLDER}${filepath.modified_name}`
              fs.unlink(finalpath, function(err) {
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
          deleteFiles(post.files, function(err) {
            if (err) {throw(err);}
             //all files removed);
          });
        }
      //chec/delete document files that were exported
          const filepath = `${process.env.FILE_UPLOAD_FOLDER}${postId + post._group + 'export' + '.docx'}`;
          //check if file exists
          fs.access(filepath, fs.F_OK, error => {
            //if error there was no file
            if(!error){
              //the file was there now unlink it
              fs.unlink(filepath, (err) => {
              //handle error when file was not deleted properly
              if (err) {throw(err);}
              //deleted document
              })
            }
          })
      //
          const postRemoved = await Post.findByIdAndRemove(postId);
      
          return postRemoved;
        } catch (err) {
          throw(err);
        }
      };

      /**
       * This function is used to like a post
       * @param { userId, postId }
       */
      like = async (userId, postId) => {
        
        try{
          const post = await Post.findOneAndUpdate({
            _id: postId
          }, {
              $addToSet: {
                _liked_by: userId
              }
            }, {
              new: true
            })
            .populate('_liked_by', 'first_name last_name')
            .lean();
      
          const user = await User.findOne({
            _id: userId
          }).select('first_name last_name');
      
          return {
            post,
            user
          };
        } catch (err) {
          throw(err);
        }
      };


      /**
       * This function is used to unlike a post
       * @param { userId, postId }
       */
      unlike = async (userId, postId) => {
        try {
          const post = await Post.findOneAndUpdate({
            _id: postId
          }, {
              $pull: {
                _liked_by: userId
              }
            }, {
              new: true
            })
            .populate('_liked_by', 'first_name last_name')
            .lean();
      
          const user = await User.findOne({
            _id: userId
          }).select('first_name last_name');
      
      
          return {
            post,
            user
          };
        } catch (err) {
          throw(err);
        }
      };


      /**
       * Anish 02/04 edits start
       */


       /**
        * This function is used to retrieve this month's tasks
        * @param userId 
        */
      async getThisMonthTasks(userId){
        try {
      
          // Generate the actual time
          const todayForTask = moment().local().add(1, 'days').startOf('day').format();
      
          const today = moment().local().add(1, 'days').format('YYYY-MM-DD');
      
          // Generate the +24h time
          const todayPlus30DaysForTask = moment().local().add(30, 'days').endOf('day').format();
      
          const tasks = await Post.find({
            'task._assigned_to': userId,
            'task.due_to': {$gte: todayForTask, $lte: todayPlus30DaysForTask},
            $or: [
              { 'task.status': 'to do' },
              { 'task.status': 'in progress' },
              { 'task.status': 'done' }
            ]
          })
              .sort('-task.due_to')
              .populate('_group', 'group_name')
              .populate('_posted_by', 'first_name last_name profile_pic')
              .populate('task._assigned_to', 'first_name last_name profile_pic')
              .lean();
      
          return {
            today: today,
            todayForTask: todayForTask,
            message: `Found ${tasks.length} pending tasks.`,
            tasks: tasks
          };
        } catch (err) {
          throw(err);
        }
      }


      /**
       * This function is used to get first 10 tasks for this week
       * @param userId 
       */
      async getThisWeekTasks(userId){
        try {
      
          // Generate the actual time
          const todayForTask = moment().local().add(1, 'days').startOf('day').format();
      
          const today = moment().local().add(1, 'days').format('YYYY-MM-DD');
      
          // Generate the +24h time
          const todayPlus7DaysForTask = moment().local().add(7, 'days').endOf('day').format();
      
          const tasks = await Post.find({
            'task._assigned_to': userId,
            'task.due_to': {$gte: todayForTask, $lte: todayPlus7DaysForTask},
            $or: [
              { 'task.status': 'to do' },
              { 'task.status': 'in progress' },
              { 'task.status': 'done' }
            ]
          })
              .sort('-task.due_to')
              .limit(10)
              .populate('_group', 'group_name')
              .populate('_posted_by', 'first_name last_name profile_pic')
              .populate('task._assigned_to', 'first_name last_name profile_pic')
              .lean();
      
          return {
            today: today,
            todayForTask: todayForTask,
            message: `Found ${tasks.length} pending tasks.`,
            tasks: tasks
          };
        } catch (err) {
          throw(err);
        }
      }


      /**
       * This function is used to get next 5 tasks for this week
       * @param userId 
       * @param lastTaskId 
       */
      async getNextTasks(userId, lastTaskId){
        try {
      
          // Generate the actual time
          const todayForTask = moment().local().add(1, 'days').startOf('day').format();
      
          const today = moment().local().add(1, 'days').format('YYYY-MM-DD');
      
          // Generate the +24h time
          const todayPlus7DaysForTask = moment().local().add(7, 'days').endOf('day').format();
      
          const tasks = await Post.find({
            'task._assigned_to': userId,
            'task.due_to': {$gte: todayForTask, $lte: todayPlus7DaysForTask},
            '_id': {$gte: lastTaskId},
            $or: [
              { 'task.status': 'to do' },
              { 'task.status': 'in progress' },
              { 'task.status': 'done' }
            ]
          })
              .sort('-task.due_to')
              .limit(5)
              .populate('_group', 'group_name')
              .populate('_posted_by', 'first_name last_name profile_pic')
              .populate('task._assigned_to', 'first_name last_name profile_pic')
              .lean();
      
          return {
            today: today,
            todayForTask: todayForTask,
            message: `Found ${tasks.length} pending tasks.`,
            tasks: tasks
          };
        } catch (err) {
          throw(err);
        }
      }


      /**
       * This function is used to get this month's events
       * @param userId 
       */
      async getThisMonthsEvents(userId){
        try {
      
          // Generate the actual time
          const todayForEvent = moment().local().add(1, 'days').startOf('day').format();
      
          const today = moment().local().add(1, 'days').format('YYYY-MM-DD');
      
          // Generate the +24h time
          const todayPlus7DaysForEvent = moment().local().add(30, 'days').endOf('day').format();
      
          // Get the group(s) that the user belongs to
          const groups = await User.findById(userId).select('_groups');
      
          // find the user's today agenda events
          const events = await Post.find({
            $or: [{
              $and: [
                // Find events due to today
                {'event._assigned_to': userId},
                {'event.due_to': {$gte: todayForEvent, $lte: todayPlus7DaysForEvent}}
              ]
            }]
          }).sort('event.due_to').populate('event._assigned_to', 'first_name last_name').populate('_group', 'group_name');
      
          return {
            today: today,
            todayForEvent: todayForEvent,
            message: `Found ${events.length} events!`,
            events: events,
            groups: groups
          };
        } catch (err) {
          throw(err);
        }
      }


      /**
       * This function is used to get first 10 events for this week
       * @param userId 
       */
      async getThisWeekEvents(userId){
        try {
      
          // Generate the actual time
          const todayForEvent = moment().local().add(1, 'days').startOf('day').format();
      
          const today = moment().local().add(1, 'days').format('YYYY-MM-DD');
      
          // Generate the +24h time
          const todayPlus7DaysForEvent = moment().local().add(7, 'days').endOf('day').format();
      
          // Get the group(s) that the user belongs to
          const groups = await User.findById(userId).select('_groups');
      
          // find the user's today agenda events
          const events = await Post.find({
            $or: [{
              $and: [
                // Find events due to today
                {'event._assigned_to': userId},
                {'event.due_to': {$gte: todayForEvent, $lte: todayPlus7DaysForEvent}}
              ]
            }]
          }).sort('event.due_to').limit(10).populate('event._assigned_to', 'first_name last_name').populate('_group', 'group_name');
      
          return {
            today: today,
            todayForEvent: todayForEvent,
            message: `Found ${events.length} events!`,
            events: events,
            groups: groups
          };
        } catch (err) {
          throw(err);
        }
      }


      /**
       * This function is used to get next 5 events for this week
       * @param userId 
       * @param lastEventId 
       */
      async getNextEvents(userId, lastEventId){
        try {
      
          // Generate the actual time
          const todayForEvent = moment().local().add(1, 'days').startOf('day').format();
      
          const today = moment().local().add(1, 'days').format('YYYY-MM-DD');
      
          // Generate the +24h time
          const todayPlus7DaysForEvent = moment().local().add(7, 'days').endOf('day').format();
      
          // Get the group(s) that the user belongs to
          const groups = await User.findById(userId).select('_groups');
      
          // find the user's today agenda events
          const events = await Post.find({
            '_id': {$gte: lastEventId},
            $or: [{
              $and: [
                // Find events due to today
                {'event._assigned_to': userId},
                {'event.due_to': {$gte: todayForEvent, $lte: todayPlus7DaysForEvent}}
              ]
            }]
          }).sort('event.due_to').limit(5).populate('event._assigned_to', 'first_name last_name').populate('_group', 'group_name');
      
          return {
            today: today,
            todayForEvent: todayForEvent,
            message: `Found ${events.length} events!`,
            events: events,
            groups: groups
          };
        } catch (err) {
          throw(err);
        }
      }
      
 }