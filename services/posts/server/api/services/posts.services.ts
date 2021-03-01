import http from 'axios';
import moment from 'moment';
import { Readable } from 'stream';
import { Comment, Group, Post, User, Notification } from '../models';
import { sendErr } from '../utils/sendError';
import { CommentsService } from './comments.services';
import { GroupsService } from './groups.services';
const fs = require('fs');

/*  ===============================
 *  -- POSTS Service --
 *  ===============================
 */

export class PostService {

  // Select User Fields on population
  userFields: any = 'first_name last_name profile_pic role email';

  // Select Group Fileds on population
  groupFields: any = 'group_name group_avatar workspace_name';

  groupsService = new GroupsService();

  commentsService = new CommentsService();

  /**
   * This service is responsible for fetching recent 5 posts based on the @lastPostId and @groupId
   * @param groupId 
   * @param lastPostId 
   */
  async getPosts(groupId: any, type?: any, lastPostId?: any) {

    try {

      // Posts Variable
      var posts = []

      // Fetch posts on the basis of the params @lastPostId
      if (lastPostId) {

        switch (type) {

          // Fetch all next posts
          case 'all':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { _id: { $lt: lastPostId } }
                ]
              }), type)

            break;

          // Special type for only group posts where we don't need tasks post
          case 'group':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: { $ne: 'task' } },
                  { _id: { $lt: lastPostId } }
                ]
              }), 'all')

            break;

          // Fetch only next normal posts
          case 'normal':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                  { _id: { $lt: lastPostId } }
                ]
              }), type)

            break;

          // Fetch only next tasks post
          case 'task':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                  { _id: { $lt: lastPostId } }
                ]
              }), type)

            break;

          // Fetch only next event posts
          case 'event':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                  { _id: { $lt: lastPostId } }
                ]
              }), type)

            break;

        }
      }

      // If lastPostId is not there
      else if (!lastPostId) {
        switch (type) {

          // Fetch first set of all posts
          case 'all':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId }
                ]
              }), type)

            break;

          // Special type for only group posts where we don't need tasks post
          case 'group':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: { $ne: 'task' } }
                ]
              }), 'all')

            break;

          // Fetch first set of normal posts
          case 'normal':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type }
                ]
              }), type)

            break;

          // Fetch first set of task posts
          case 'task':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type }
                ]
              }), type)

            break;

          // Fetch first set of event posts
          case 'event':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                ]
              }), type)

            break;
        }
      }

      // Return set of posts 
      return posts;

    } catch (err) {

      // Return With error
      throw (err);
    }
  }

  /**
   * This is the helper function which returns the filtered posts
   * @param posts 
   */
  filterGroupPosts(posts: any, type?: string) {

    // Filtered posts array
    var filteredPosts = posts

    // If all types of posts are selected
    if (type == 'all' || type == 'group')
      filteredPosts = posts
        .sort('-_id')
        .limit(5)
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .lean();

    // If normal posts are selected
    else if (type === 'normal')
      filteredPosts = posts
        .sort('-_id')
        .limit(5)
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .lean();

    // If all tasks are selected
    else if (type === 'task')
      filteredPosts = posts
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        //.populate({ path: 'task._column', select: '_id title custom_fields_to_show' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .lean();

    // Return group posts
    return filteredPosts
  }

  /**
   * This function is used to populate a post with all the possible properties
   * @param post 
   */
  async populatePostProperties(post: any) {
    if (post.type === 'task') {

      // Populate task properties
      post = await Post.populate(post, [
        { path: '_assigned_to', select: this.userFields },
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields },
        { path: 'task._parent_task', select: '_id title _assigned_to' },
        //{ path: 'task._column', select: '_id title custom_fields_to_show' }
      ]);

    } else if (post.type === 'performance_task') {

      // Populate performance task properties
      post = await Post.populate(post, [
        { path: 'performance_task._assigned_to', select: this.userFields },
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields }
      ]);

    } else if (post.type === 'event') {

      // Populate event properties
      if (post._assigned_to.includes('all')) {
        post = await Post.populate(post, [
          { path: '_group', select: this.groupFields },
          { path: '_posted_by', select: this.userFields }
        ])
      } else {
        post = await Post.populate(post, [
          { path: '_assigned_to', select: this.userFields },
          { path: '_group', select: this.groupFields },
          { path: '_posted_by', select: this.userFields }
        ])
      }


    } else if (post.type === 'normal') {

      // Populate normal post properties
      post = await Post.populate(post, [
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields }
      ]);
    }

    // Return post with populated properties
    return post;
  }

  /**
   * This function is responsible for sending the related real time notifications/emails to the user(s)
   * @param post 
   */
  async sendNotifications(post: any) {

    if (post._content_mentions.length !== 0) {

      // Create Real time Notification for all the mentions on post content
      return await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-mention`, {
        postId: post._id,
        content_mentions: post._content_mentions,
        groupId: post._group._id || post._group,
        posted_by: post._posted_by
      })

      // // Create User Stream
      let userStream: any;

      if (post._content_mentions.includes('all')) {

        // Create Readble Stream from the Post Contents
        userStream = Readable.from(await User.find({
          _groups: post._group
        }).distinct('_id'))

      } else {

        // User Stream from the post contents
        userStream = Readable.from(post._content_mentions)
      }
      /*
      userStream.on('data', async (user: any) => {
        user = await User.findOne({
          _id: user
        }).select('first_name email')

        http.post(`${process.env.MAILING_SERVER_API}/user-post-mention`, {
          post: post,
          user: user
        })
      })
      */
    }

    // Send notification after post creation
    switch (post.type) {

      case 'task':
        if (post._assigned_to) {

          // Real time notification for new task assignment
          return await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-task`, {
            postId: post._id,
            assigned_to: post._assigned_to,
            groupId: post._group._id || post._group,
            posted_by: post._posted_by
          })
          /*
          // Email notification for the new task
          await http.post(`${process.env.MAILING_SERVER_API}/task-assigned`, {
            post: post
          })

          // Schedule task reminder, which will be called in future
          await http.post(`${process.env.MAILING_SERVER_API}/task-reminder`, {
            post: post
          })
          */
        }
        break;

      case 'event':

        // Real time notification for new event assignment
        return await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-event`, {
          postId: post._id,
          assigned_to: post._assigned_to,
          grouId: (post._group._id || post._group),
          posted_by: post._posted_by
        })

        /*
        // Email notification for the new email assignment
        http.post(`${process.env.MAILING_SERVER_API}/event-assigned`, {
          post: post
        })

        // Schedule event reminder, which will be called in future
        http.post(`${process.env.MAILING_SERVER_API}/event-reminder`, {
          post: post
        })
        */
        break;

      default:
        break;
    }

  }

  /**
   * This function is responsible for adding a new post
   * @param { title, content, type, _posted_by, _group, _content_mentions } postData 
   */
  async addPost(postData: any, userId: string) {
    try {
      // Parse the String to JSON Object
      postData = JSON.parse(postData);

      // Create new post
      let post: any = await Post.create(postData);

      // save record of ussignment
      if (post.type == 'event' && post._assigned_to && post._assigned_to.length > 0) {

        // Create Readble Stream from the Event Assignee
        const userStream = Readable.from(post._assigned_to);

        await userStream.on('data', async (user: any) => {
          post = await Post.findOneAndUpdate({
            _id: post._id
          }, {
            $push: {
              "records.assignments": {
                date: moment().format(),
                _assigned_to: user,
                _assigned_from: userId
              }
            }
          }, {
            new: true
          })
        });
      }

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Send all the required emails and notifications
      await this.sendNotifications(post)

      // Return Post Object
      return post;

    } catch (err) {

      // Return with error
      throw (err);
    }
  }


  /**
   * This function is responsible for editing a post
   * @param post 
   * @param postId 
   */
  async editPost(post: any, postId: string) {
    try {

      // Parse the String to JSON Object
      
      post = JSON.parse(post)

      // Post Data Object
      var postData: any = {
        title: post.title,
        content: post.content,
        _content_mentions: post._content_mentions,
        tags: post.tags,
        _read_by: [],
        files: post.files,
        _assigned_to: post.assigned_to
      }

      switch (post.type) {
        case 'task':

          // Add task property details
          postData.task = {
            due_to: (post.date_due_to) ? moment(post.date_due_to).format() : null,
            start_date: (post.start_date) ? moment(post.start_date).format() : null,
            status: post.status,
            _column: post._column,
            custom_fields: post.task.custom_fields,
            isNorthStar: post.task.isNorthStar,
            northStar: post.task.northStar,
            _parent_task: post.task._parent_task
          }

          break;

        case 'performance_task':

          // Adding skills to the post
          postData.skill = post.skill

          // Adding performance task details
          postData.performance_task = {
            _assigned_to: post.assigned_to[0]._id,
            status: post.status
          }

          break;

        case 'event':
          // transform due_to time to UTC
          post.date_due_to = moment.utc(post.date_due_to).format();

          // Add Event property details
          postData.event = {
            due_to: post.event.due_to,
          }

          break;

        case 'normal':

          // Postdata remains the same for normal post
          postData = postData

          break;

        case 'document':

          // Postdata remains the same for document post
          postData = postData

          break;
      }

      // Update the post
      post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $set: postData
      }, {
        new: true
      })

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Send all the required emails and notifications
      this.sendNotifications(post);

      // Return the post
      return post;

    } catch (err) {

      // Return with error
      throw (err);
    }
  };


  /**
   * This function is responsible for retrieving a post
   * @param postId
   */
  async get(postId: any) {

    // Post Object
    let post: any;

    // Find the Post By ID
    post = await Post.findOne({ _id: postId })
      .populate('_group', this.groupFields)
      .populate('_posted_by', this.userFields)
      .populate('_assigned_to', this.userFields)
      .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
      .populate('performance_task._assigned_to', this.userFields)
      .lean();
    // Return the post
    return post
  }


  /**
   * This function is used to remove a post
   * @param { userId, postId }
   */
  async remove(userId: string, postId: string) {
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
        await Post.update({
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

  /**
   * This function is used to like a post
   * @param { userId, postId }
   */
  async like(userId: string, postId: string) {

    // Find the post and update the _liked_by array and increment the likes_count
    const post = await Post.findOneAndUpdate
      (
        { _id: postId },
        { $addToSet: { _liked_by: userId }, $inc: { likes_count: 1 } },
        { new: true }
      )
      .lean();
    
    await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-like-post`, {
      postId: post._id,
      posted_by: post['_posted_by'],
      followers: post['_followers'],
      assigned_to:post['_assigned_to'],
      mentions:post['_content_mentions'],
      groupId:post['_group'],
      user: userId
    });

    // Find the User 
    const user = await User.findOne
      (
        { _id: userId }
      )
      .select('first_name last_name');

    // Return the Data
    return {
      post,
      user
    }
  }


  /**
   * This function is used to unlike a post
   * @param { userId, postId }
   */
  async unlike(userId: string, postId: string) {

    // Find the post and update the _liked_by array and decrement the likes_count
    const post = await Post.findOneAndUpdate
      (
        { _id: postId },
        { $pull: { _liked_by: userId }, $inc: { likes_count: -1 } },
        { new: true }
      )
      .lean();

    // Find the User 
    const user = await User.findOne
      (
        { _id: userId }
      )
      .select('first_name last_name');

    // Return the Data
    return {
      post,
      user
    }
  }

  /**
   * This function is used to follow a post
   * @param { userId, postId }
   */
  async follow(userId: string, postId: string) {

    // Find the post and update the _followers array and increment the followers_count
    const post = await Post.findOneAndUpdate
      (
        { _id: postId },
        { $addToSet: { _followers: userId }, $inc: { followers_count: 1 } },
        { new: true }
      )
      .lean();

    await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-follow-post`, {
      postId: post._id,
      posted_by: post['_posted_by'],
      assigned_to:post['_assigned_to'],
      mentions:post['_content_mentions'],
      groupId:post['_group'],
      follower: userId
    }).catch(err => sendErr(err, new Error(err), 'Internal Server Error!', 500));

    // Find the User 
    const user = await User.findOne
      (
        { _id: userId }
      )
      .select('first_name last_name');

    // Return the Data
    return {
      post,
      user
    }
  }


  /**
   * This function is used to unfollow a post
   * @param { userId, postId }
   */
  async unfollow(userId: string, postId: string) {

    // Find the post and update the _followers array and decrement the followers_count
    const post = await Post.findOneAndUpdate
      (
        { _id: postId },
        { $pull: { _followers: userId }, $inc: { followers_count: -1 } },
        { new: true }
      )
      .lean();

    // Find the User 
    const user = await User.findOne
      (
        { _id: userId }
      )
      .select('first_name last_name');

    // Return the Data
    return {
      post,
      user
    }
  }

  // -| TASKS |-

  /**
   * This function is responsible for changing the task assignee
   * @param postId 
   * @param assigneeId 
   */
  async removeAssignee(postId: string, assigneeId: string, userId: string) {

    try {
      // Update post
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $pull: { _assigned_to: assigneeId }
      }, {
        new: true
      })

      // save record of assignment
      post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $push: {
          "records.assignments": {
            date: moment().format(),
            type: 'unassign',
            _assigned_to: assigneeId,
            _assigned_from: userId
          }
        }
      }, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post);

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task assignee
   * @param postId 
   * @param assigneeId 
   */
  async addAssignee(postId: string, assigneeId: string, userId: string) {

    try {

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $addToSet: { _assigned_to: assigneeId }
      }, {
        new: true
      })

      // save record of assignment
      post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $push: {
          "records.assignments": {
            date: moment().format(),
            type: 'assign',
            _assigned_to: assigneeId,
            _assigned_from: userId
          }
        }
      }, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post);

      // Create Real time Notification to notify user about the task reassignment
      http.post(`${process.env.NOTIFICATIONS_SERVER_API}/task-reassign`, {
        postId: post._id,
        assigneeId: assigneeId,
        _assigned_from: userId
      })

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task assignee
   * @param postId 
   * @param assigneeId 
   */
  async changeTaskAssignee(postId: string, assigneeId: string, userId: string) {

    try {

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        'task._assigned_to': assigneeId
      }, {
        new: true
      })

      // save record of assignment
      post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $push: {
          "records.assignments": {
            date: moment().format(),
            type: 'assign',
            _assigned_to: assigneeId,
            _assigned_from: userId
          }
        }
      }, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post)

      // Create Real time Notification to notify user about the task reassignment
      http.post(`${process.env.NOTIFICATIONS_SERVER_API}/task-reassign`, {
        postId: post._id,
        assigneeId: assigneeId,
        _assigned_from: userId
      })

      /*
      // Email notification for the new task reassignment
      http.post(`${process.env.MAILING_SERVER_API}/task-reassign`, {
        post: post
      })
      */

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task due date
   * @param postId
   * @param date_due_to
   */
  async changeTaskDueDate(postId: string, date_due_to: string) {
    try {
      // Get post data
      
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        "task.due_to": date_due_to ? moment(date_due_to).hours(12).format('YYYY-MM-DD') : null,
      }, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post)

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task dates
   * @param postId
   * @param date_field
   * @param newDate
   */
  async changeTaskDate(postId: string, date_field: string, newDate: Date) {
    
    try {
      let field = {};
      if (date_field === 'start_date') {
        field = { "task.start_date":newDate? moment(newDate).hours(12).format('YYYY-MM-DD'):null }
      }

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, field, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post)

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task status
   * @param postId
   * @param status
   * @param userId
   */
  async changeTaskStatus(postId: string, status: string, userId: string) {

    try {
      var oldPost: any = await Post.findOne({ _id: postId }).select('task');

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $set: {
          "task.status": status ? status : 'to do'
        },
        $push: {
          "records.status": {
            date: moment().format(),
            status: status,
            _user: userId
          }
        }
      }, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post);

      if (status !== 'to do') {
        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/status-change`, {
          postId: post._id,
          userId: userId,
          assigned_to: post._assigned_to,
          status: status ? status : 'to do',
          followers: post._followers,
          posted_by: post._posted_by
        });
      }

      if (status === 'done' || oldPost.task.status === 'done') {
        let counter = 0;

        if (status === 'done' && oldPost.task.status !== 'done') {
          counter++;
        } else if (oldPost.task.status === 'done' && status !== 'done') {
          counter--;
        }

        this.groupsService.increaseDoneTasks(post._group._id, counter, status);
      }

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task column
   * @param postId
   * @param columnId
   * @param userId
   */
  async changeTaskColumn(postId: string, columnId: string, userId: string) {

    try {

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $set: {
          "task._column": columnId,
        },
        $push: {
          "records.column": {
            date: moment().format(),
            _column: columnId,
            _user: userId
          }
        }
      }, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post)

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }


  /**
   * Anish 02/04 edits start
   */


  /**
   * This function is used to retrieve this month's tasks
   * @param userId 
   */
  async getThisMonthTasks(userId) {
    try {

      // Generate the actual time
      const todayForTask = moment().local().add(1, 'days').startOf('day').format();

      const today = moment().local().add(1, 'days').format('YYYY-MM-DD');

      // Generate the +24h time
      const todayPlus30DaysForTask = moment().local().add(30, 'days').endOf('day').format();

      const tasks = await Post.find({
        '_assigned_to': userId,
        'task.due_to': { $gte: todayForTask, $lte: todayPlus30DaysForTask },
        $or: [
          { 'task.status': 'to do' },
          { 'task.status': 'in progress' },
          { 'task.status': 'done' }
        ]
      })
        .sort('-task.due_to')
        .populate('_group', 'group_name')
        .populate('_posted_by', 'first_name last_name profile_pic')
        .populate('_assigned_to', 'first_name last_name profile_pic')
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .lean();

      return {
        today: today,
        todayForTask: todayForTask,
        message: `Found ${tasks.length} pending tasks.`,
        tasks: tasks
      };
    } catch (err) {
      throw (err);
    }
  }


  /**
   * This function is used to get first 10 tasks for this week
   * @param userId 
   */
  async getThisWeekTasks(userId) {
    try {

      // Generate the actual time
      const todayForTask = moment().local().add(1, 'days').startOf('day').format();

      const today = moment().local().add(1, 'days').format('YYYY-MM-DD');

      // Generate the +24h time
      const todayPlus7DaysForTask = moment().local().add(7, 'days').endOf('day').format();

      const tasks = await Post.find({
        '_assigned_to': userId,
        'task.due_to': { $gte: todayForTask, $lte: todayPlus7DaysForTask },
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
        .populate('_assigned_to', 'first_name last_name profile_pic')
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .lean();

      return {
        today: today,
        todayForTask: todayForTask,
        message: `Found ${tasks.length} pending tasks.`,
        tasks: tasks
      };
    } catch (err) {
      throw (err);
    }
  }


  /**
   * This function is used to get next 5 tasks for this week
   * @param userId 
   * @param lastTaskId 
   */
  async getNextTasks(userId, lastTaskId) {
    try {

      // Generate the actual time
      const todayForTask = moment().local().add(1, 'days').startOf('day').format();

      const today = moment().local().add(1, 'days').format('YYYY-MM-DD');

      // Generate the +24h time
      const todayPlus7DaysForTask = moment().local().add(7, 'days').endOf('day').format();

      const tasks = await Post.find({
        '_assigned_to': userId,
        'task.due_to': { $gte: todayForTask, $lte: todayPlus7DaysForTask },
        '_id': { $gte: lastTaskId },
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
        .populate('_assigned_to', 'first_name last_name profile_pic')
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .lean();

      return {
        today: today,
        todayForTask: todayForTask,
        message: `Found ${tasks.length} pending tasks.`,
        tasks: tasks
      };
    } catch (err) {
      throw (err);
    }
  }


  /**
   * This function is used to get this month's events
   * @param userId 
   */
  async getThisMonthsEvents(userId) {
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
            { '_assigned_to': userId },
            { 'event.due_to': { $gte: todayForEvent, $lte: todayPlus7DaysForEvent } }
          ]
        }]
      }).sort('event.due_to').populate('_assigned_to', 'first_name last_name').populate('_group', 'group_name');

      return {
        today: today,
        todayForEvent: todayForEvent,
        message: `Found ${events.length} events!`,
        events: events,
        groups: groups
      };
    } catch (err) {
      throw (err);
    }
  }


  /**
   * This function is used to get first 10 events for this week
   * @param userId 
   */
  async getThisWeekEvents(userId) {
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
            { '_assigned_to': userId },
            { 'event.due_to': { $gte: todayForEvent, $lte: todayPlus7DaysForEvent } }
          ]
        }]
      }).sort('event.due_to').limit(10).populate('_assigned_to', 'first_name last_name').populate('_group', 'group_name');

      return {
        today: today,
        todayForEvent: todayForEvent,
        message: `Found ${events.length} events!`,
        events: events,
        groups: groups
      };
    } catch (err) {
      throw (err);
    }
  }


  /**
   * This function is used to get next 5 events for this week
   * @param userId 
   * @param lastEventId 
   */
  async getNextEvents(userId, lastEventId) {
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
        '_id': { $gte: lastEventId },
        $or: [{
          $and: [
            // Find events due to today
            { '_assigned_to': userId },
            { 'event.due_to': { $gte: todayForEvent, $lte: todayPlus7DaysForEvent } }
          ]
        }]
      }).sort('event.due_to').limit(5).populate('_assigned_to', 'first_name last_name').populate('_group', 'group_name');

      return {
        today: today,
        todayForEvent: todayForEvent,
        message: `Found ${events.length} events!`,
        events: events,
        groups: groups
      };
    } catch (err) {
      throw (err);
    }
  }


  /**
   * Fetch posts for recent activity
   * @param userId 
   */
  async getRecentActivity(userId: any) {
    try {
      var groupList: any = await User.find({ '_id': userId }).select("_groups");
      groupList = groupList[0]['_groups'];
      const today = moment().local().startOf('day').format();
      if (groupList.length > 0) {
        var posts: any = await Post.find({
          '_group': { $in: groupList },
          $and: [{ 'created_date': { $gte: today } }]
        }).sort('-created_date').limit(10);
        return posts;
      }
      else {
        return null;
      }
    } catch (error) {
      throw (error);
    }
  }


  /**
   * Fetch next 5 recent activity posts
   * @param userId 
   * @param lastPostId 
   */
  async getNextRecentActivity(userId: any, lastPostId: any) {
    try {
      var groupList: any = await User.find({ '_id': userId }).select("_groups");
      groupList = groupList[0]['_groups'];
      const todayMinus7Days = moment().local().subtract(7, 'days').endOf('day').format();
      if (groupList.length > 0) {
        var posts: any = await Post.find({
          '_group': { $in: groupList },
          $and: [
            { '_id': { $lt: lastPostId } },
            { 'created_date': { $gte: todayMinus7Days } }
          ]
        }).sort('-created_date').limit(5);
        return posts;
      }
      else {
        return null;
      }
    } catch (error) {
      throw (error);
    }
  }


  /**
   * Fetch recent groups
   * @param userId 
   */
  async getRecentGroups(userId: any) {
    try {
      // Get 2 recent posted groups
      var fromPost: any = await Post.find({
        '_posted_by': userId,
      }).sort('-created_date').limit(2).select('_group created_date');

      // Get 2 recent commented groups
      var fromComment: any = await Comment.find({
        '_commented_by': userId
      }).sort('-created_date').limit(2).select('_post._group created_date');

      // Create groupList and sort
      var groupsList = [];
      for (var i in fromPost) groupsList.push(fromPost[i]);
      for (var i in fromComment) groupsList.push(fromComment[i]);
      groupsList.sort((obj1, obj2) => {
        return obj2.created_date > obj1.created_date ? 1 : -1;
      });

      // Get unique groups
      var groupSet = new Set();
      var index = 0;
      while (groupSet.size != 2) {
        groupSet.add(groupsList[index]._group);
        index++;
      }
      return groupSet;
    } catch (error) {
      throw (error);
    }
  }

  async changeCustomFieldValue(postId: string, customFieldName: any, customFieldValue: any) {
    try {
      const task = await Post.findById(postId);

      if (!task['task']['custom_fields']) {
        task['task']['custom_fields'] = new Map<string, string>();
      }
      task['task']['custom_fields'].set(customFieldName, customFieldValue);

      // Find the post and update the custom field
      let post = await Post.findByIdAndUpdate({
        _id: postId
      }, {
        $set: { "task.custom_fields": task['task']['custom_fields'] }
      });

      return await this.populatePostProperties(post);

    } catch (error) {
      throw (error);
    }
  }

  async getNorthStarTasks(groups: any) {
    try {
      return await this.filterGroupPosts(
        Post.find({
          '_group': { $in: groups },
          $and: [
            { 'task.isNorthStar': true }
          ]
        }).sort('-created_date'), 'task');
    } catch (error) {
      throw (error);
    }
  }

  async addBar(postId: string, bar: any) {
    try {
      const task: any = await Post.findById(postId);
      const barExists = task.bars.includes(bar);
      if (!barExists) {
        task.bars.push({
          bar_tag: bar.bar_tag,
          tag_members: bar.tag_members
        });
      }
      task.save();
    } catch (error) {
      throw (error);
    }
  }

  async removeBar(postId: string, bar: any) {
    const task: any = await Post.findById(postId);
    task.bars = task.bars.filter(barDB => barDB.bar_tag !== bar.bar_tag);
    task.save();
  }

  async getWorspacePostsResults(workspaceId: any, type: any, numDays: number, overdue: boolean, isNorthStar: boolean) {

    const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');

    const groups = await Group.find({ _workspace: workspaceId }).select('_id').lean();

    let groupsIds = [];

    groups.forEach(group => {
      groupsIds.push(group._id);
    })

    let posts = [];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format()

      // Fetch the tasks posts
      posts = await Post.find({
        $and: [
          { _group: { $in: groupsIds } },
          { type: type },
          { 'task.due_to': { $gte: comparingDate, $lt: today } },
          {
            $or: [
              { 'task.status': 'to do' },
              { 'task.status': 'in progress' }
            ]
          }
        ]
      })
        .sort('-task.due_to')
        .populate('_group', this.groupFields)
        .populate('_posted_by', this.userFields)
        .populate('_assigned_to', this.userFields)
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .lean();

    } else {
      posts = await Post.find({
        $and: [
          { _group: { $in: groupsIds } },
          { type: type },
          { 'task.due_to': { $gte: comparingDate } }
        ]
      })
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .lean();
    }

    return posts;
  }

  async getWorspaceNorthStars(workspaceId: any, type: any, numDays: number, overdue: boolean, isNorthStar: boolean) {

    const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');

    const groups = await Group.find({ _workspace: workspaceId }).select('_id').lean();

    let groupsIds = [];

    groups.forEach(group => {
      groupsIds.push(group._id);
    })

    let posts = [];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format()

      // Fetch the tasks posts
      posts = await Post.find({
        $and: [
          { _group: { $in: groupsIds } },
          { type: type },
          { 'task.isNorthStar': isNorthStar },
          { 'task.due_to': { $gte: comparingDate, $lt: today } }
        ]
      })
        .sort('-task.due_to')
        .populate('_group', this.groupFields)
        .populate('_posted_by', this.userFields)
        .populate('_assigned_to', this.userFields)
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .lean();

    } else {
      posts = await Post.find({
        $and: [
          { _group: { $in: groupsIds } },
          { type: type },
          { 'task.isNorthStar': isNorthStar },
          { 'task.due_to': { $gte: comparingDate } }
        ]
      })
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .lean();
    }

    return posts;
  }

  async getGroupTasksResults(groupId: any, type: any, numDays: number, overdue: boolean) {

    const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');

    let posts = [];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format()

      // Fetch the tasks posts
      posts = await Post.find({
        $and: [
          { _group: groupId },
          { type: type },
          { 'task.due_to': { $gte: comparingDate, $lt: today } },
          {
            $or: [
              { 'task.status': 'to do' },
              { 'task.status': 'in progress' }
            ]
          }
        ]
      })
        .sort('-task.due_to')
        .populate('_group', this.groupFields)
        .populate('_posted_by', this.userFields)
        .populate('_assigned_to', this.userFields)
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .lean();

    } else {
      posts = await Post.find({
        $and: [
          { _group: groupId },
          { type: type },
          { 'task.due_to': { $gte: comparingDate } }
        ]
      })
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .lean();
    }

    return posts;
  }

  async getAllGroupTasks(groupId: any, period: any) {

    let posts = [];
    let query = {};

    // We assume that by default it will be 'this_week'
    // Generate the date for the start of the week
    let startingDate = moment().add(1, 'days').endOf('day').startOf('week').format();
    // Generate the date for the end of the week
    let endDate = moment().add(1, 'days').endOf('day').endOf('week').format();

    if (period == 'next_week') {
      // Generate the date for the start of the next week
      startingDate = moment().add(1, 'weeks').endOf('day').startOf('week').format();
      // Generate the date for the end of the next week
      endDate = moment().add(1, 'weeks').endOf('day').endOf('week').format();

    } else if (period == 'this_month') {
      // Generate the date for the start of the month
      startingDate = moment().add(1, 'days').endOf('day').startOf('month').format();
      // Generate the date for the end of the month
      endDate = moment().add(1, 'days').endOf('day').endOf('month').format();

    } else if (period == 'next_month') {
      // Generate the date for the start of the next month
      startingDate = moment().add(1, 'months').endOf('day').startOf('month').format();
      // Generate the date for the end of the next month
      endDate = moment().add(1, 'months').endOf('day').endOf('month').format();
    }

    if (period == 'this_week') {
      query = {
        $and: [
          { _group: groupId },
          { type: 'task' },
          { 'task.is_template': { $ne: true }},
          {
            $or: [
              { 'task.due_to': { $gte: startingDate, $lte: endDate }},
              {
                $and:[
                  { 'task.due_to': { $lte: moment().local().add(1, 'days').format('YYYY-MM-DD') }},
                  { 'task.status': { $ne: 'done' }}
                ]
              }
            ]
          }
        ]
      };
    } else {
      query = {
        $and: [
          { _group: groupId },
          { type: 'task' },
          { 'task.is_template': { $ne: true }},
          { 'task.due_to': { $gte: startingDate, $lte: endDate }}
        ]
      };
    }
    
    
    // Fetch the tasks posts
    posts = await Post.find(query)
      .sort('-task.due_to')
      .select('_id _group task')
      .populate('_assigned_to', this.userFields)
      .lean();

    return posts;
  }

  async getGroupPostsResults(groupId: any, numDays: number) {

    const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');

    let posts = [];

    posts = await Post.find({
      $and: [
        { _group: groupId },
        { type: { $ne: 'task' } },
        { 'created_date': { $gte: comparingDate } }
      ]
    })
      .lean();

    return posts;
  }

  async getSubtasks(parentId: any) {

    let posts = [];

    posts = await Post.find({
      $and: [
        { type: 'task' },
        { 'task._parent_task': parentId }
      ]
    })
      .sort('created_date')
      .populate({ path: '_group', select: this.groupFields })
      .populate({ path: '_posted_by', select: this.userFields })
      .populate({ path: '_assigned_to', select: this.userFields })
      .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
      .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
      .lean();

    return posts;
  }

  async getSubtasksCount(parentId: any) {

    return await Post.find({
      $and: [
        { type: 'task' },
        { 'task._parent_task': parentId }
      ]
    }).countDocuments();
  }

  async moveToGroup(postId: string, groupId: string, columnId: string, oldGroupId: string, userId: string) {

    let update = {};

    if (columnId && columnId != '') {
      update = {
        _group: groupId,
        'task._column': columnId,
        $push: {
          "records.group_change": {
            date: moment().format(),
            _fromGroup: oldGroupId,
            _toGroup: groupId,
            type: 'move',
            _user: userId
          }
        }
      }
    } else {
      update = {
        _group: groupId,
        $push: {
          "records.group_change": {
            date: moment().format(),
            _fromGroup: oldGroupId,
            _toGroup: groupId,
            type: 'move',
            _user: userId
          }
        }
      }
    }

    try {
      // Update the post
      let post = await Post.findOneAndUpdate({
        _id: postId
      }, update, {
        new: true
      })

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Update subtasks
      const subtasks = await Post.updateMany({
        $and: [
          { type: 'task' },
          { 'task._parent_task': post._id }
        ]
      }, {
        _group: groupId,
        $push: {
          "records.group_change": {
            date: moment().format(),
            _fromGroup: oldGroupId,
            _toGroup: groupId,
            type: 'move',
            _user: userId
          }
        }
      }).select('_id').lean();

      // delete the comments
      await Comment.deleteMany({ _post: postId });

      // delete the comments of the subtasks
      (await this.getSubtasks(postId)).forEach(async task => {
        await Comment.deleteMany({ _post: task._id });
      });

      // Return the post
      return post;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  async copyToGroup(postId: string, groupId: string, columnId: string, oldGroupId?: string, userId?: string, parentId?: string, isTemplate?: boolean) {

    try {
      const oldPost = await Post.findById(postId).lean();

      let newPost = oldPost;

      delete newPost._id;
      delete newPost.bars;
      delete newPost.records;
      delete newPost.comments;
      if (newPost.task && newPost.task.custom_fields) {
        delete newPost.task.custom_fields;
      }
      if (newPost.records && newPost.records.assignments) {
        delete newPost.records.assignments;
      }

      newPost._group = groupId;
      newPost.comments_count = 0;
      newPost.created_date = moment().format();
      if (!isTemplate) {
        newPost._assigned_to = [];
      }
      if (parentId) {
        newPost.task._parent_task = parentId;
      } else {
        newPost.task._column = columnId;
      }

      if (newPost.files) {
        let files = newPost.files;
        newPost.files = [];

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          // Get the folder link from the environment
          const folder = process.env.FILE_UPLOAD_FOLDER;

          // Modify the file accordingly and handle request
          await fs.copyFile(folder + currentFile.modified_name, folder + fileName, (error: Error) => {
            if (error) {
              fileName = null;
              console.log(`\n⛔️ Error:\n ${error}`);
              throw (error);
            }
          });

          // Modify the file and serialise the object
          const file = {
            original_name: currentFile.original_name,
            modified_name: fileName
          };

          // Push the file object
          newPost.files.push(file);
        });
      }

      // Create new post
      newPost = await Post.create(newPost);

      // set the record in the new post
      if (oldGroupId && groupId && userId) {
        newPost = Post.findOneAndUpdate({
          _id: newPost._id
        }, {
          $push: {
            "records.group_change": {
              date: moment().format(),
              _fromGroup: oldGroupId,
              _toGroup: groupId,
              type: 'copy',
              _user: userId
            }
          }
        }, {
          new: true
        });
      }

      // populate the assigned_to property of this document
      newPost = await this.populatePostProperties(newPost);

      // copy the subtasks
      if (!oldPost.task._parent_task) {
        (await this.getSubtasks(postId)).forEach(task => {
          this.copyToGroup(task._id, groupId, '', oldGroupId, userId, newPost._id);
        });
      }
      /*
      // delete the comments
      await Comment.deleteMany({_post: postId});
      */
      // Return Post Object
      return newPost;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  /**
   * This function fetches the 10 possible parent tasks
   * @param query
   * @param groupId 
   * @param currentPostId 
   */
  async searchPossibleParents(groupId, currentPostId, query, field) {

    try {
      let posts: any;
      if (field == 'subtask') {
        // search for parent task
        posts = await Post.find({
          $and: [
            { _group: groupId },
            { _id: { $ne: currentPostId } },
            { title: { $regex: query, $options: 'i' } },
            { type: 'task' },
            { 'task._parent_task': null }
          ]
        })
          .sort({ title: -1 })
          .limit(5)
          .select('_id title');

      } else {
        // search for dependency
        posts = await Post.find({
          $and: [
            { _group: groupId },
            { _id: { $ne: currentPostId } },
            { title: { $regex: query, $options: 'i' } },
            { type: 'task' },
            { "task.start_date": { $ne: null } },
            { "task.due_to": { $ne: null } }
          ]
        })
          .sort({ title: -1 })
          .limit(5)
          .select('_id title type task');

        if (posts && posts.length > 0) {
          for (var i = 0; i < posts.length; i++) {
            if (posts[i]?.task?._parent_task) {
              posts.splice(i, 1);
            }
          }
        }

      }


      // Return set of posts 
      return posts;

    } catch (err) {
      // Return With error
      throw (err);
    }
  }

  async setParentTask(postId: string, parentTaskId: string) {

    try {
      // Update the post
      let post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        'task._parent_task': parentTaskId,
        $unset: { 'task._column': '' }
      }, {
        new: true
      })

      // populate the properties of this document
      post = await this.populatePostProperties(post);

      // Return the post
      return post;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  async setDependencyTask(postId: string, dependecyTaskId: string) {

    try {

      // Update the post

      let post11 = await Post.findById(postId);
      if (post11.task && post11.task._dependency_task) {
        let oldParent = await Post.findById(post11.task._dependency_task);

        for (var i = 0; i < oldParent.task._dependent_child.length; i++) {
          if (oldParent.task._dependent_child[i] + '' == post11._id + '') {
            oldParent.task._dependent_child.splice(i, 1);
            break;
          }
        }

        oldParent.save();
      }

      let post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        'task._dependency_task': dependecyTaskId
      }, {
        new: true
      })

      let post1 = await Post.findOneAndUpdate({
        _id: dependecyTaskId
      }, {
        "$push": { "task._dependent_child": postId }
      }, {
        new: true
      })



      // populate the properties of this document
      post = await this.populatePostProperties(post);

      // Return the post
      return post;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  async removeDependencyTask(postId: string, dependecyTaskId: string) {

    try {
      
      let oldParent = await Post.findById(dependecyTaskId);
      
      for (var i = 0; i < oldParent.task._dependent_child.length; i++) {
        if (oldParent.task._dependent_child[i] + '' == postId + '') {
          oldParent.task._dependent_child.splice(i, 1);
          break;
        }
      }

      oldParent.save();
      

      let post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        'task._dependency_task': undefined
      }, {
        new: true
      })

      // populate the properties of this document
      post = await this.populatePostProperties(post);

      // Return the post
      return post;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  async cloneToAssignee(postId: string, assigneeId: string, parentId?: string) {

    try {
      const oldPost = await Post.findById(postId).lean();

      let newPost = oldPost;

      delete newPost._id;
      delete newPost.bars;
      delete newPost.records;
      delete newPost.comments;
      if (newPost.task && newPost.task.custom_fields) {
        delete newPost.task.custom_fields;
      }
      if (newPost.records && newPost.records.assignments) {
        delete newPost.records.assignments;
      }

      newPost._assigned_to = [assigneeId];
      newPost.task.status = 'to do';
      newPost.comments_count = 0;
      newPost.created_date = moment().format();
      
      if (parentId) {
        newPost.task._parent_task = parentId;
      }

      if (newPost.files) {
        let files = newPost.files;
        newPost.files = [];

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          // Get the folder link from the environment
          const folder = process.env.FILE_UPLOAD_FOLDER;

          // Modify the file accordingly and handle request
          await fs.copyFile(folder + currentFile.modified_name, folder + fileName, (error: Error) => {
            if (error) {
              fileName = null;
              console.log(`\n⛔️ Error:\n ${error}`);
              throw (error);
            }
          });

          // Modify the file and serialise the object
          const file = {
            original_name: currentFile.original_name,
            modified_name: fileName
          };

          // Push the file object
          newPost.files.push(file);
        });
      }

      // Create new post
      newPost = await Post.create(newPost);

      // set the record in the new post
      newPost = Post.findOneAndUpdate({
        _id: newPost._id
      }, {
        new: true
      });

      // populate the assigned_to property of this document
      newPost = await this.populatePostProperties(newPost);

      // copy the subtasks
      if (!oldPost.task._parent_task) {
        (await this.getSubtasks(postId)).forEach(task => {
          this.cloneToAssignee(task._id, assigneeId, newPost._id);
        });
      }
      
      // Return Post Object
      return newPost;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }
  
  /**
   * This service is responsible for fetching templates based on the @groupId
   * @param groupId
   */
  async getGroupTemplates(groupId: any) {

    try {

      // Posts Variable
      var posts = []

      posts = await Post.find({
          $and: [
            { _group: groupId },
            { type: 'task' },
            { 'task.is_template': true },
            { 'task._parent_task': null }
          ]
        }).select('_id task.template_name')
        .sort('-task.template_name');

      // Return set of posts 
      return posts;

    } catch (err) {

      // Return With error
      throw (err);
    }
  }

  async createTemplate(postId: string, groupId: string, templateName: string, parentId?: string) {

    try {
      const oldPost = await Post.findById(postId).lean();

      let template = oldPost;

      template.task.is_template = true;
      template.task.template_name = templateName;

      // Delete unneeded fields
      delete template._id;
      delete template.bars;
      delete template.records;
      delete template.comments;
      delete template.task._column;
      delete template.task.due_date;
      delete template.task.start_date;
      if (template.task && template.task.custom_fields) {
        delete template.task.custom_fields;
      }
      if (template.records && template.records.assignments) {
        delete template.records.assignments;
      }

      template._group = groupId;
      template.comments_count = 0;
      template.created_date = moment().format();
      if (parentId) {
        template.task._parent_task = parentId;
      }

      if (template.files) {
        let files = template.files;
        template.files = [];

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          // Get the folder link from the environment
          const folder = process.env.FILE_UPLOAD_FOLDER;

          // Modify the file accordingly and handle request
          await fs.copyFile(folder + currentFile.modified_name, folder + fileName, (error: Error) => {
            if (error) {
              fileName = null;
              console.log(`\n⛔️ Error:\n ${error}`);
              throw (error);
            }
          });

          // Modify the file and serialise the object
          const file = {
            original_name: currentFile.original_name,
            modified_name: fileName
          };

          // Push the file object
          template.files.push(file);
        });
      }

      // Create new post
      template = await Post.create(template);

      // populate the assigned_to property of this document
      template = await this.populatePostProperties(template);

      // copy the subtasks
      if (!oldPost.task._parent_task) {
        (await this.getSubtasks(postId)).forEach(task => {
          this.createTemplate(task._id, groupId, templateName, template._id);
        });
      }

      // Return Post Object
      return template;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  async overwriteTemplate(postId: string, templateId: string, templateName: string) {
    try {
      let template = await Post.findById(templateId).select("_id _group _posted_by");
      const groupId = template._group._id || template._group;
      const posted_by = template._posted_by._id || template._posted_by;

      // Delete old template
      this.remove(posted_by, templateId);

      // Create the new template
      return this.createTemplate(postId, groupId, templateName);

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  async createTaskFromTemplate(templatePostId: string, newPostId: string) {

    try {
      const template = await Post.findById(templatePostId).lean();

      // Update the new post
      let newPost = await Post.findOneAndUpdate({_id: newPostId}, {
        title: template.title,
        content: template.content,
        _assigned_to: template._assigned_to
      });

      //delete files, this catches both document insertion as well as multiple file attachment deletes
      if (newPost.files?.length > 0) {
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
        deleteFiles(newPost.files, function (err) {
          if (err) { throw (err); }
          //all files removed);
        });
      }

      //chec/delete document files that were exported
      const filepath = `${process.env.FILE_UPLOAD_FOLDER}${newPostId + (newPost._group._id || newPost._group) + 'export' + '.docx'}`;
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
      
      if (template.files) {
        // Start adding the files from the template
        let files = template.files;
        let postFiles = [];

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          // Get the folder link from the environment
          const folder = process.env.FILE_UPLOAD_FOLDER;

          // Modify the file accordingly and handle request
          await fs.copyFile(folder + currentFile.modified_name, folder + fileName, (error: Error) => {
            if (error) {
              fileName = null;
              console.log(`\n⛔️ Error:\n ${error}`);
              throw (error);
            }
          });

          // Modify the file and serialise the object
          const file = {
            original_name: currentFile.original_name,
            modified_name: fileName
          };

          // Push the file object
          postFiles.push(file);
        });

        newPost = await Post.findOneAndUpdate({_id: newPostId}, {
          files: postFiles
        });
      }

      // populate the assigned_to property of this document
      newPost = await this.populatePostProperties(newPost);

      // copy the subtasks
      if (!template.task._parent_task) {
        // remove subtasks
        await Post.deleteMany({
          $and: [
            { type: 'task' },
            { 'task._parent_task': newPostId }
          ]
        });
        
        // Create new subtasks
        (await this.getSubtasks(templatePostId)).forEach(task => {
          this.copyToGroup(task._id, template._group._id || template._group, '', null, null, newPostId, true);
        });
      }

      // Return Post Object
      return newPost;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task dates
   * @param postId
   * @param date_field
   * @param newDate
   */
  async saveAllocation(postId: string, allocation: number) {

    try {
      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        "task.allocation": allocation
      }, {
        new: true
      });

      // Populate the post properties
      post = await this.populatePostProperties(post);

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * Execute the actions from the automator
   * 
   * @param actions 
   * @param post 
   * @param userId 
   * @param groupId 
   * @param isChildStatusTrigger 
   */
  executeActionFlow(actions: any[], post: any, userId: string, groupId: string, isChildStatusTrigger: boolean) {
    actions.forEach(async action => {
        switch (action.name) {
            case 'Assign to':
                action._user.forEach(async userAction => {
                    let assigneeIndex = -1;
                    if (post._assigned_to) {
                        assigneeIndex = post._assigned_to.findIndex(assignee => { return (assignee._id || assignee) == (userAction._id || userAction) });
                        if (assigneeIndex < 0) {
                          if (isChildStatusTrigger && post.task._parent_task) {
                            post = await this.addAssignee(post.task._parent_task._id || post.task._parent_task, userAction, userId);
                          } else {
                            post = await this.addAssignee(post._id, userAction, userId);
                          }
                        }
                    }
                });

                break;
            case 'Custom Field':
                  if (isChildStatusTrigger && post.task._parent_task) {
                    post = await this.changeCustomFieldValue(post.task._parent_task._id || post.task._parent_task, action.custom_field.name, action.custom_field.value);
                  } else {
                    post = await this.changeCustomFieldValue(post._id, action.custom_field.name, action.custom_field.value);
                  }
                break;
            case 'Move to':
                if (isChildStatusTrigger && post.task._parent_task) {
                  post = await this.changeTaskColumn(post.task._parent_task._id || post.task._parent_task, (action._section._id || action._section), userId);
                } else {
                  if (!post.task._parent_task) {
                    post = await this.changeTaskColumn(post._id, (action._section._id || action._section), userId);
                  }
                }
                break;
            case 'Change Status to':
                if (isChildStatusTrigger && post.task._parent_task) {
                  post = await this.changeTaskStatus(post.task._parent_task._id || post.task._parent_task, action.status, userId);
                } else {
                  post = await this.changeTaskStatus(post._id, action.status, userId);
                }
                break;
            default:
                break;
        }
    });
    return post;
}
}
