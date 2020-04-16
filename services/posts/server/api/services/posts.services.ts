import { Group, Post, User, Comment } from '../models';
import http from 'axios';
import moment from 'moment';
import * as fs from 'fs';

/*  ===============================
 *  -- POSTS Service --
 *  ===============================
 */

export class PostService {

  // Select User Fields on population
  userFields: any = 'first_name last_name profile_pic role email';

  // Select Group Fileds on population
  groupFields: any = 'group_name group_avatar';


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
        .populate('_posted_by', this.userFields)
        .populate('task._assigned_to', this.userFields)
        .populate('event._assigned_to', this.userFields)
        .populate('_liked_by', this.userFields)
        .populate('_followers', this.userFields)
        .lean();

    // If all tasks are selected
    else if (type === 'task')
      filteredPosts = posts
        .sort('-task.due_to')
        .populate('_group', this.groupFields)
        .populate('_posted_by', this.userFields)
        .populate('task._assigned_to', this.userFields)
        .populate('_liked_by', 'first_name')
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
        { path: '_posted_by', select: this.userFields }
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
      await http.post('http://localhost:9000/api/new-mention', {
        post: post
      });

      // start the process to send an email to every user mentioned in the post coneten
      await post._content_mentions.forEach((user: any, index: number) => {
        http.post('http://localhost:2000/api/user-post-mention', {
          post: post,
          user: user
        })
      });
    }

    // Send notification after post creation
    switch (post.type) {

      case 'task':
        if (!post.task.unassigned) {

          // Real time notification for new task assignment
          await http.post('http://localhost:9000/api/new-task', {
            post: post
          })

          // Email notification for the new task
          await http.post('http://localhost:2000/api/task-assigned', {
            post: post
          })

          // Schedule task reminder, which will be called in future
          await http.post('http://localhost:2000/api/task-reminder', {
            post: post
          })
        }
        break;

      case 'event':

        // Real time notification for new event assignment
        await http.post('http://localhost:9000/api/new-event', {
          post: post
        })

        // Email notification for the new email assignment
        await http.post('http://localhost:2000/api/event-assigned', {
          post: post
        })

        // Schedule event reminder, which will be called in future
        await http.post('http://localhost:2000/api/event-reminder', {
          post: post
        })

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

      // Send all the required emails and notifications
      await this.sendNotifications(post);

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

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
      }

      switch (post.type) {
        case 'task':

          // Add task property details
          postData.task = {
            due_to: (post.date_due_to) ? moment(post.date_due_to).format('YYYY-MM-DD') : null,
            _assigned_to: post.assigned_to,
            status: post.status,
            unassigned: post.unassigned,
            _column: post._column
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

          // make arr with ids user who got assigned to event
          const assignedUsers = post.assigned_to.map((item, index) => item._id);

          // Add Event property details
          postData.event = {
            due_to: post.date_due_to,
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

      // Send all the required emails and notifications
      this.sendNotifications(post);

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

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

  /**
   * This function is used to like a post
   * @param { userId, postId }
   */
  like = async (userId, postId) => {

    try {
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
      throw (err);
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
      throw (err);
    }
  };

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

      // Create Real time Notification to notify user about the task reassignment
      http.post('http://localhost:9000/api/task-reassign', {
        post: post
      })
        .catch((err) => {
          console.error(err)
        })

      // Email notification for the new task reassignment
      http.post('http://localhost:2000/api/task-reassign', {
        post: post
      })
        .catch((err) => {
          console.error(err)
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
        "task.due_to": date_due_to ? moment(date_due_to).format('YYYY-MM-DD') : null,
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


  async getRecentActivity(userId: any){
    try {
      var groupList: any = await User.findById(userId).populate('_groups');
      if (groupList.length > 0){
        var posts: any = Group.find({
          '_group': { $in: groupList }
        }).sort(['created_date', -1]).limit(10);
        return posts;
      }
      else{
        return null;
      }
    } catch (error) {
      throw(error);
    }
  }


  async getNextRecentActivity(userId: any, lastPostId: any){
    try {
      var groupList: any = await User.findById(userId).populate('_groups');
      if (groupList.length > 0){
        var posts: any = Group.find({
          '_id': { $gte: lastPostId },
          $and: [
          { '_group': { $in: groupList } },
          ]
        }).sort(['created_date', -1]).limit(5);
        return posts;
      }
      else{
        return null;
      }
    } catch (error) {
      throw(error);
    }
  }
}
