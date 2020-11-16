import http from 'axios';
import moment from 'moment';
import { Readable } from 'stream';
import { Comment, Group, Post, User } from '../models';
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
              }), type)

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
      return err;
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
        // .populate({ path: '_liked_by', select: this.userFields, options: { limit: 10 } })
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
        // .populate({ path: '_liked_by', select: this.userFields, options: { limit: 10 } })
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
        { path: 'task._parent_task', select: '_id title _assigned_to' }
      ]);

    } else if (post.type === 'performance_task') {

      // Populate performance task properties
      post = await Post.populate(post, [
        { path: 'performance_task._assigned_to', select: this.userFields },
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields },
      ]);

    } else if (post.type === 'event') {

      // Populate event properties
      if (post._assigned_to.includes('all')) {
        post = await Post.populate(post, [
          { path: '_group', select: this.groupFields },
          { path: '_posted_by', select: this.userFields },
          // { path: '_liked_by', select: this.userFields, options: { limit: 10 } }
        ])
      } else {
        post = await Post.populate(post, [
          { path: '_assigned_to', select: this.userFields },
          { path: '_group', select: this.groupFields },
          { path: '_posted_by', select: this.userFields },
          // { path: '_liked_by', select: this.userFields, options: { limit: 10 } }
        ])
      }


    } else if (post.type === 'normal') {

      // Populate normal post properties
      post = await Post.populate(post, [
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields },
        // { path: '_liked_by', select: this.userFields, options: { limit: 10 } }
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
      await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-mention`, {
        post: post
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
          await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-task`, {
            post: post
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
        http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-event`, {
          post: post
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
            $push: { "records.assignments": {
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
      this.sendNotifications(post)

      // Return Post Object
      return post;

    } catch (err) {

      // Return with error
      return err;
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
            end_date: (post.end_date) ? moment(post.end_date).format() : null,
            //_assigned_to: post.assigned_to,
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

          //let assignedUsers: any = post._assigned_to

          // Add Event property details
          postData.event = {
            due_to: post.event.due_to,
            //_assigned_to: assignedUsers
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
      return err;
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
  async remove (userId: string, postId: string ){
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
      if(post.comments.length > 0) {
        await post.comments?.forEach(async (commentId) => {
          try {
            await Comment.findByIdAndRemove(commentId);
  
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
      //
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
      post: post,
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
        post: post,
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
        $push: { "records.assignments": {
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
      return err
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
        $push: { _assigned_to: assigneeId }
      }, {
        new: true
      })

      // save record of assignment
      post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $push: { "records.assignments": {
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
        post: post,
        assigneeId: assigneeId
      })

      // Return the post
      return post;

    } catch (err) {
      return err
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
        $push: { "records.assignments": {
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
        post: post
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
      return err
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
        "task.due_to": date_due_to ? moment(date_due_to).format() : null,
      }, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post)

      // Return the post
      return post;

    } catch (err) {
      return err
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
        field = { "task.start_date": newDate }
      }
      if (date_field === 'end_date') {
        field = { "task.end_date": newDate }
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
      return err
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
      var oldPost: any = await Post.findOne({_id: postId}).select('task');

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $set: {
          "task.status": status ? status : 'to do'
        },
        $push: { "records.status": {
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
          post: post,
          userId: userId
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
      return err
    }
  }

  /**
   * This function is responsible for changing the task column
   * @param postId
   * @param status
   * @param userId
   */
  async changeTaskColumn(postId: string, title: string, userId: string) {

    try {

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $set: {
          "task._column.title": title,
        },
        $push: { "records.column": {
            date: moment().format(),
            title: title,
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
      return err
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
      throw(error);
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
      throw(error);
    }
  }
  
  async addBar(postId: string, bar: any){
    try {
      const task: any = await Post.findById(postId);
      const barExists = task.bars.includes(bar);
      if(!barExists) {
        task.bars.push({
          bar_tag: bar.bar_tag,
          tag_members: bar.tag_members
        });
      }
      task.save();
    } catch (error) {
      throw(error);
    }  
  }

  async removeBar(postId: string, bar: any){
    const task: any = await Post.findById(postId);
      task.bars = task.bars.filter( barDB => barDB.bar_tag !== bar.bar_tag);
      task.save();
  }

  async getWorspacePostsResults(workspaceId: any, type: any, numDays: number, overdue: boolean, isNorthStar: boolean) {
    
    const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');

    const groups = await Group.find({ _workspace: workspaceId }).select('_id').lean();
    
    let groupsIds = [];
    
    groups.forEach(group => {
      groupsIds.push(group._id);
    })
    
    let posts =[];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format()

      // Fetch the tasks posts
      posts = await Post.find({
        $and: [
          { _group: { $in: groupsIds } },
          { type: type },
          {'task.due_to': { $gte: comparingDate, $lt: today }},
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
    
    let posts =[];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format()

      // Fetch the tasks posts
      posts = await Post.find({
        $and: [
          { _group: { $in: groupsIds } },
          { type: type },
          { 'task.isNorthStar': isNorthStar},
          {'task.due_to': { $gte: comparingDate, $lt: today }}
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
          { 'task.isNorthStar': isNorthStar},
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

    let posts =[];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format()

      // Fetch the tasks posts
      posts = await Post.find({
        $and: [
          { _group: groupId },
          { type: type },
          {'task.due_to': { $gte: comparingDate, $lt: today }},
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

  async getGroupPostsResults(groupId: any, numDays: number) {
    
    const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');

    let posts =[];

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
    
    let posts =[];

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

  async moveToGroup(postId: string, groupId: string, oldGroupId: string, userId: string) {
    
    try {
      // Update the post
      let post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        _group: groupId,
        $push: { "records.group_change": {
            date: moment().format(),
            _fromGroup: oldGroupId,
            _toGroup: groupId,
            type: 'move',
            _user: userId
          }
        }
      }, {
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
        $push: { "records.group_change": {
            date: moment().format(),
            _fromGroup: oldGroupId,
            _toGroup: groupId,
            type: 'move',
            _user: userId
          }
        }
      }).select('_id').lean();

      // delete the comments
      await Comment.deleteMany({_post: postId});

      // delete the comments of the subtasks
      (await this.getSubtasks(postId)).forEach(async task => {
        await Comment.deleteMany({_post: task._id});
      });

      // Return the post
      return post;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      return err;
    }
  }

  async copyToGroup(post: any, oldGroupId: string, userId: string) {

    try {
      const groupId = post._group;
      const postId = post._id;

      delete post._id;

      if (post.files) {
        let files = post.files;
        post.files = [];

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          // Get the folder link from the environment
          const folder = process.env.FILE_UPLOAD_FOLDER;

          // Modify the file accordingly and handle request
          await fs.copyFile(folder + currentFile.modified_name, folder + fileName,  (error: Error) => {
            if (error) {
              fileName = null;
              console.log(`\n⛔️ Error:\n ${error}`);
              return error;
            }
          });

          // Modify the file and serialise the object
          const file = {
            original_name: currentFile.original_name,
            modified_name: fileName
          };

          // Push the file object
          post.files.push(file);
        });
      }
      // Create new post
      post = await Post.create(post);

      // set the record in the new post
      post = Post.findOneAndUpdate({
          _id: post._id
        }, {
          $push: { "records.group_change": {
              date: moment().format(),
              _fromGroup: oldGroupId,
              _toGroup: groupId,
              type: 'copy',
              _user: userId
            }
          }
        }, {
          new: true
        })

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // copy the subtasks
      if(!post.task._parent_task) {
        (await this.getSubtasks(postId)).forEach(task => {
          delete task.bars;
          delete task.records;
          delete task.comments;
          delete task.task.custom_fields;
          task._group = groupId;
          task.task._parent_task = post._id;
          task.created_date = moment().local().startOf('day').format('YYYY-MM-DD');
          this.copyToGroup(task, oldGroupId, userId);
        });
      }

      // delete the comments
      await Comment.deleteMany({_post: postId});

      // Return Post Object
      return post;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      return err;
    }
  }

  async updateTaskOrderInColumn(postId: string, order) {
    
    try {
      // Update the post
      let post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $set: { "task._column.order": order }
      }, {
        new: true
      });

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Return the post
      return post;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      return err;
    }
  }

  /**
   * This function fetches the 10 possible parent tasks
   * @param query
   * @param groupId 
   * @param currentPostId 
   */
  async searchPossibleParents(groupId, currentPostId, query) {

    try {
      let posts = Post.find({
        $and: [
          { _group: groupId },
          { _id: { $ne: currentPostId }},
          { title: { $regex: query, $options: 'i' } },
        ]
      })
      .sort({ title: -1 })
      .limit(5)
      .select('_id title');

      // Return set of posts 
      return posts;

    } catch (err) {
      // Return With error
      return err;
    }
  }

  async setParentTask(postId: string, parentTaskId: string) {
    
    try {
      // Update the post
      let post = await Post.findOneAndUpdate({
        _id: postId
      }, {
        'task._parent_task': parentTaskId,
        'task._column.title': ''
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
      return err;
    }
  }
}
