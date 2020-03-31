import { Post, User } from '../models';
import http from 'axios';
const moment = require('moment');
import { Request } from 'express';

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
              await http.post('http://localhost:9000/api/notifications/new-mention',{
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
                await http.post('http://localhost:9000/api/notifications/new-task', {
                    post: post
                });
                // await sendMail.taskAssigned(post);
                await http.post('http://localhost:2000/task-assigned', {
                    post: post
                });
                // await sendMail.scheduleTaskReminder(post);
                await http.post('http://localhost:2000/task-reminder', {
                    post: post
                });
                }
                break;
              case 'event':
                // await notifications.newEventAssignments(post);
                await http.post('http://localhost:9000/api/notifications/new-event', {
                    post: post
                });
                // await sendMail.eventAssigned(post);
                await http.post('http://localhost:2000/event-assigned', {
                    post: post
                });
                // await sendMail.scheduleEventReminder(post);
                await http.post('http://localhost:2000/event-reminder', {
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
      
          const user:any = await User.findOne({ _id: req.userId });
      
          // Allow all group's users to edit a multi editor post
          if (post.type === 'document' && user._groups.includes(post._group)) {
            user.role = 'admin';
          }
      
          // if the user is not an owner or an admin and is not the one who posted, we throw auth error
          if (!(user.role === 'owner' || user.role === 'admin') && !post._posted_by == req.userId) {
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
            await http.post('http://localhost:9000/api/notifications/new-mention', {
                post: post
            });
          }
      
          // Send Email notification after post creation
          switch (post.type) {
            case 'task':
            //   await notifications.newTaskAssignment(post);
              await http.post('http://localhost:9000/api/notifications/new-task', {
                  post: post
              });
            //   await sendMail.taskAssigned(post);
              await http.post('http://localhost:2000/task-assigned', {
                  post: post
              });
              break;
            case 'event':
            //   await notifications.newEventAssignments(post);
              await http.post('http://localhost:9000/api/notifications/new-event', {
                  post: post
              });
            //   await sendMail.eventAssigned(post);
              await http.post('http://localhost:2000/event-assigned', {
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
      

      
 }