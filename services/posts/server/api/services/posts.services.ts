import { Post, User, Comment } from '../models';
import http from 'axios';
import moment from 'moment';
import { Request } from 'express';
import * as fs from 'fs';

/*  ===============================
 *  -- POSTS Service --
 *  ===============================
 */

export class PostService {

  // Select User Fields on population
  userFields: any = 'first_name last_name profile_pic';

  // Select Group Fileds on population
  groupFields: any = 'group_name group_avatar';


  /**
   * This service is responsible for fetching recent 5 posts based on the @lastPostId and @groupId
   * @param groupId 
   * @param lastPostId 
   */
  async getPosts(groupId: string, lastPostId?: string){
    
    try{

      // Posts Variable
      var posts = []

      // Fetch posts on the basis of the params @lastPostId
      if (lastPostId)
        posts = await this.filterGroupPosts(
          Post.find({
            $and: [
              { _group: groupId },
              { _id: { $lt: lastPostId } }
            ]
          }))
      
      // If lastPostId is not there
      else
        posts = await this.filterGroupPosts(
          Post.find({
            $and: [
              { _group: groupId }
            ]
          }))

      // Return first 5 recent posts 
      return posts;

    } catch(err){

      // Return With error
      return err;
    }
  }

  /**
   * This is the helper function which returns the filtered posts
   * @param posts 
   */
  filterGroupPosts(posts: any) {
    
    // Return group posts
    return posts
      .sort('-_id')
      .limit(5)
      .populate('_posted_by', this.userFields)
      .populate('task._assigned_to', this.userFields)
      .populate('event._assigned_to', this.userFields)
      .populate('_liked_by', this.userFields)
      .populate('_followers', this.userFields)
      .lean();
  }

  /**
   * This function is responsible for adding a new post
   * @param { title, content, type, _posted_by, _group, _content_mentions } postData 
   */
  async addPost(postData: any) {
    try {

      // Parse the String to JSON Object
      postData = JSON.parse(postData);

      // Create new post
      let post: any = await Post.create(postData);

      if (post._content_mentions.length !== 0) {
        // Create Notification for mentions on post content
        await http.post('http://localhost:9000/api/new-mention', {
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
          if (post.task.unassigned != 'Yes') {
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

        // Populate task properties
        post = await Post.populate(post, [
          { path: 'task._assigned_to', select: this.userFields }, 
          { path: '_group', select: this.groupFields }, 
          { path: '_posted_by', select: this.userFields }
        ]);

      } else if (post.type === 'performance_task') {

        // Populate performance task properties
        post = await Post.populate(post,[
            { path: 'performance_task._assigned_to', select: this.userFields }, 
            { path: '_group', select: this.groupFields }, 
            { path: '_posted_by', select: this.userFields }
          ]);

      } else if (post.type === 'event') {

        // Populate event properties
        post = await Post.populate(post, [
          { path: 'event._assigned_to', select: this.userFields }, 
          { path: '_group', select: this.groupFields }, 
          { path: '_posted_by', select: this.userFields }
        ]);

      } else if (post.type === 'normal') {

        // Populate normal post properties
        post = await Post.populate(post, [
          { path: '_group', select: this.groupFields }, 
          { path: '_posted_by', select: this.userFields }
        ]);
      }

      // Return Post Object
      return post;

    } catch (err) {

      // Return with error
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
          if (req.body.unassigned == 'Yes') {
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
                unassigned: req.body.unassigned,
                _column: req.body._column
              }
            }
          }
          if (req.body.unassigned == 'No') {
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
                unassigned: req.body.unassigned,
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


      const post: any = await Post.findOne({ _id: req.params.postId });

      const user: any = await User.findOne({ _id: req['userId'] });

      // Allow all group's users to edit a multi editor post
      if (post.type === 'document' && user._groups.includes(post._group)) {
        user.role = 'admin';
      }

      // if the user is not an owner or an admin and is not the one who posted, we throw auth error
      if (!(user.role === 'owner' || user.role === 'admin') && !post._posted_by == req['userId']) {
        throw (null);
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
      throw (err);
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
      throw (err);
    }
  };


  /**
   * This function is used to remove a post
   * @param { userId, postId }
   */
  remove = async (userId, postId, ) => {
    try {
      // Get post data
      const post: any = await Post.findOne({
        _id: postId
      }).lean();

      // Get user data
      const user: any = await User.findOne({ _id: userId });

      if (
        // If user is not an admin or owner
        !(user.role === 'admin' || user.role === 'owner')
        // ...user is not the post author...
        && !post._posted_by.equals(userId)
      ) {
        // Deny access!
        throw (null);
        // return sendErr(res, null, 'User not allowed to remove this post!', 403);
      }

      await post.comments.forEach(async (commentId) => {
        try {
          await Comment.findByIdAndRemove(commentId);

          return true;
        } catch (err) {
          throw (err);
        }
      });
      //delete files, this catches both document insertion as well as multiple file attachment deletes
      if (post.files.length > 0) {
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
      //
      const postRemoved = await Post.findByIdAndRemove(postId);

      return postRemoved;
    } catch (err) {
      throw (err);
    }
  };

}