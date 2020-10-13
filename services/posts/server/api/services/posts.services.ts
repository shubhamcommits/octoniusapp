import { Group, Post, User, Comment } from '../models';
import http from 'axios';
import moment from 'moment';
const fs = require('fs');
import { Readable } from 'stream';
import { CommentsController } from '../controllers';
import { sendErr } from '../utils/sendError';

/*  ===============================
 *  -- POSTS Service --
 *  ===============================
 */

export class PostService {

  // Select User Fields on population
  userFields: any = 'first_name last_name profile_pic role email';

  // Select Group Fileds on population
  groupFields: any = 'group_name group_avatar workspace_name';


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
        .populate({ path: 'task._assigned_to', select: this.userFields })
        // .populate({ path: 'event._assigned_to', select: this.userFields })
        // .populate({ path: '_liked_by', select: this.userFields, options: { limit: 10 } })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .lean();

    // If all tasks are selected
    else if (type === 'task')
      filteredPosts = posts
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: 'task._assigned_to', select: this.userFields })
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
        { path: 'task._assigned_to', select: this.userFields },
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields },
        // { path: '_liked_by', select: this.userFields, options: { limit: 10 } }
      ]);

    } else if (post.type === 'performance_task') {

      // Populate performance task properties
      post = await Post.populate(post, [
        { path: 'performance_task._assigned_to', select: this.userFields },
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields },
        // { path: '_liked_by', select: this.userFields, options: { limit: 10 } }
      ]);

    } else if (post.type === 'event') {

      // Populate event properties
      if (post.event._assigned_to.includes('all')) {
        post = await Post.populate(post, [
          { path: '_group', select: this.groupFields },
          { path: '_posted_by', select: this.userFields },
          // { path: '_liked_by', select: this.userFields, options: { limit: 10 } }
        ])
      } else {
        post = await Post.populate(post, [
          { path: 'event._assigned_to', select: this.userFields },
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
        if (!post.task.unassigned) {

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
  async addPost(postData: any) {
    try {

      // Parse the String to JSON Object
      postData = JSON.parse(postData);

      // Create new post
      let post: any = await Post.create(postData);

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
        files: post.files
      }

      switch (post.type) {
        case 'task':

          // Add task property details
          postData.task = {
            due_to: (post.date_due_to) ? moment(post.date_due_to).format() : null,
            _assigned_to: post.assigned_to,
            status: post.status,
            unassigned: post.unassigned,
            _column: post._column,
            custom_fields: post.task.custom_fields,
            isNorthStar: post.task.isNorthStar,
            northStar: post.task.northStar
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

          let assignedUsers: any = post.event._assigned_to

          // Add Event property details
          postData.event = {
            due_to: post.event.due_to,
            _assigned_to: assignedUsers
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
      .populate('task._assigned_to', this.userFields)
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

      if(post.comments.length > 0){
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
   * This function is used to ununfollow a post
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
  async changeTaskAssignee(postId: string, assigneeId: string) {

    try {

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        'task._assigned_to': assigneeId,
        'task.unassigned': false
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
   * This function is responsible for changing the task status
   * @param postId
   * @param status
   */
  async changeTaskStatus(postId: string, status: string) {

    try {

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        "task.status": status ? status : 'to do',
      }, {
        new: true
      })

      // Populate the post properties
      post = await this.populatePostProperties(post);
      
      if (status !== 'to do') {
        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/status-change`, {
          post: post
        });
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
   */
  async changeTaskColumn(postId: string, title: string) {

    try {

      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        "task._column.title": title ? title : 'to do',
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
        'task._assigned_to': userId,
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
        .populate('task._assigned_to', 'first_name last_name profile_pic')
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
        'task._assigned_to': userId,
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
        .populate('task._assigned_to', 'first_name last_name profile_pic')
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
        'task._assigned_to': userId,
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
        .populate('task._assigned_to', 'first_name last_name profile_pic')
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
            { 'event._assigned_to': userId },
            { 'event.due_to': { $gte: todayForEvent, $lte: todayPlus7DaysForEvent } }
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
            { 'event._assigned_to': userId },
            { 'event.due_to': { $gte: todayForEvent, $lte: todayPlus7DaysForEvent } }
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
            { 'event._assigned_to': userId },
            { 'event.due_to': { $gte: todayForEvent, $lte: todayPlus7DaysForEvent } }
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
      const post = await Post.findByIdAndUpdate({
        _id: postId
      }, {
        $set: { "task.custom_fields": task['task']['custom_fields'] }
      });

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
      .populate('task._assigned_to', this.userFields)
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
      .populate({ path: 'task._assigned_to', select: this.userFields })
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
      .populate('task._assigned_to', this.userFields)
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
      .populate({ path: 'task._assigned_to', select: this.userFields })
      .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
      .lean();
    }

    return posts;
  }
}
