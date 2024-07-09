import http from 'axios';
import moment from 'moment';
import { Comment, Group, Post, User, Notification } from '../models';
import { CommentsService } from './comments.services';
import { GroupsService } from './groups.services';
import axios from 'axios';
import { DateTime } from 'luxon';

const fs = require('fs');
const minio = require('minio');

/*  ===============================
 *  -- POSTS Service --
 *  ===============================
 */

export class PostService {

  // Select User Fields on population
  userFields: any = 'first_name last_name profile_pic role email _workspace';

  // Select Group Fileds on population
  groupFields: any = 'group_name group_avatar workspace_name enabled_rights';

  groupsService = new GroupsService();

  commentsService = new CommentsService();

  /**
   * This service is responsible for fetching recent 5 posts based on the @lastPostId and @groupId
   * @param groupId
   * @param lastPostId
   */
  async getPosts(groupId: any, pinned: boolean, type?: any, lastPostId?: any, filters?: any) {

    try {

      // Posts Variable
      var posts = [];

      let pinnedQuery = {};
      if (pinned) {
        pinnedQuery =
          { pin_to_top: true }
      } else {
        pinnedQuery = {
          $or: [
            { pin_to_top: false },
            { pin_to_top: null }
          ]
        }
      }

      let postedByFilter = {};
      let tagsFilter = {};
      // let numLikesFilter = {};
      if (filters && filters != 'undefined') {
        filters = JSON.parse(filters)

        if (filters && filters.users && filters.users.length > 0) {
          postedByFilter = {
            _posted_by: { $in: filters.users }
          };
        }

        if (filters && filters.tags && filters.tags.length > 0) {
          tagsFilter = {
            tags: { $in: filters.tags }
          }
        }
      }

      const numLikes = (filters && filters.numLikes) ? +(filters.numLikes) : 0;

      // Fetch posts on the basis of the params @lastPostId
      if (lastPostId) {

        switch (type) {

          // Fetch all next posts
          case 'all':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { _id: { $lt: lastPostId } },
                  pinnedQuery,
                  postedByFilter,
                  tagsFilter
                ]
              }), type, numLikes)

            break;

          // Special type for only group posts where we don't need tasks post
          case 'group':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: { $ne: 'task' } },
                  { _id: { $lt: lastPostId } },
                  pinnedQuery,
                  postedByFilter,
                  tagsFilter
                ]
              }), 'all', numLikes)

            break;

          // Fetch only next normal posts
          case 'normal':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                  { _id: { $lt: lastPostId } },
                  pinnedQuery,
                  postedByFilter,
                  tagsFilter
                ]
              }), type, numLikes)

            break;

          // Fetch only next tasks post
          case 'task':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                  { _id: { $lt: lastPostId }}
                ]
              }), type, numLikes)

            break;

          // Fetch only next event posts
          case 'event':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                  { _id: { $lt: lastPostId }}
                ]
              }), type, numLikes)

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
              }), type, numLikes)

            break;

          // Special type for only group posts where we don't need tasks post
          case 'group':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: { $ne: 'task' } },
                  pinnedQuery,
                  postedByFilter,
                  tagsFilter
                ]
              }), 'all', numLikes)

            break;

          // Fetch first set of normal posts
          case 'normal':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                  pinnedQuery,
                  postedByFilter,
                  tagsFilter
                ]
              }), type, numLikes)

            break;

          // Fetch first set of task posts
          case 'task':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type },
                  { archived: { $ne: true }}
                ]
              }), type)

            break;

          // Fetch first set of event posts
          case 'event':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: type }
                ]
              }), type)

            break;

          case 'pinned':
            posts = await this.filterGroupPosts(
              Post.find({
                $and: [
                  { _group: groupId },
                  { type: 'normal' },
                  pinnedQuery,
                  postedByFilter,
                  tagsFilter
                ]
              }), type, numLikes);
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
   * This service is responsible for fetching recent 5 posts based on the @lastPostId and @groupId
   * @param groupId
   * @param lastPostId
   */
  async getTasksBySection(sectionId: string) {

    try {
      // Posts Variable
      var posts = [];

      posts = await this.filterGroupPosts(
        Post.find({
          $and: [
            { 'task._column': sectionId },
            { type: 'task' },
            { archived: { $ne: true }}
          ]
        }), 'task')

      // Return set of posts
      return posts;

    } catch (err) {

      // Return With error
      throw (err);
    }
  }

  async getArchivedTasks(groupId: string) {
    try {

      // Posts Variable
      let posts = await this.filterGroupPosts(
        Post.find({
          $and: [
            { _group: groupId },
            { type: 'task' },
            { archived: true }
          ]
        }), 'task');

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
  filterGroupPosts(posts: any, type?: string, numLikes?: number) {

    // Filtered posts array
    var filteredPosts = posts;

    // If all types of posts are selected
    if (type == 'all' || type == 'group')
      filteredPosts = posts
        .sort((numLikes && numLikes > 0) ? '-likes_count' : '-_id')
        .limit((numLikes && numLikes > 0) ? numLikes : 5)
        .select('title type permissions task approval_flow_launched tags _group comments_count content _content_mentions created_date files')
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        //.populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        //.populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        //.populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        //.populate({ path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar shuttle_type _shuttle_section' })
        //.populate({ path: 'task.shuttles._shuttle_section', select: '_id title' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .populate({ path: '_liked_by', select: this.userFields, options: { limit: 10 } })
        //.populate({ path: 'permissions._members', select: this.userFields })
        .lean();

    // If normal posts are selected
    else if (type === 'normal')
      filteredPosts = posts
        .sort((numLikes && numLikes > 0) ? '-likes_count' : '-_id')
        .limit((numLikes && numLikes > 0) ? numLikes : 5)
        .select('title type permissions task approval_flow_launched tags _group comments_count content _content_mentions created_date files')
        //.populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        //.populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        //.populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        //.populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        //.populate({ path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar shuttle_type _shuttle_section' })
        //.populate({ path: 'task.shuttles._shuttle_section', select: '_id title' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .populate({ path: '_liked_by', select: this.userFields, options: { limit: 10 } })
        //.populate({ path: 'permissions._members', select: this.userFields })
        .lean();

    // If all tasks are selected
    else if (type === 'task')
      filteredPosts = posts
        .sort((numLikes && numLikes > 0) ? '-likes_count' : '-task.due_to')
        .select('title type permissions task approval_flow_launched tags _group created_date files')
        //.populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        //.populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        //.populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        //.populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        //.populate({ path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar shuttle_type _shuttle_section' })
        //.populate({ path: 'task.shuttles._shuttle_section', select: '_id title' })
        //.populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        //.populate({ path: 'permissions._members', select: this.userFields })
        .lean();

    else if (type == 'pinned')
      filteredPosts = posts
        .sort((numLikes && numLikes > 0) ? '-likes_count' : '-created_date')
        .select('title type permissions task approval_flow_launched tags _group comments_count content _content_mentions created_date files')
        //.populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        //.populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        //.populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        //.populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        //.populate({ path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar shuttle_type _shuttle_section' })
        //.populate({ path: 'task.shuttles._shuttle_section', select: '_id title' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .populate({ path: '_liked_by', select: this.userFields, options: { limit: 10 } })
        //.populate({ path: 'permissions._members', select: this.userFields })
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
        { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
        { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
        { path: 'task._parent_task', select: '_id title _assigned_to' },
        { path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar shuttle_type _shuttle_section' },
        { path: 'task.shuttles._shuttle_section', select: '_id title' },
        { path: 'permissions._members', select: this.userFields },
        { path: 'logs._actor', select: this.userFields },
        { path: 'logs._new_section', select: '_id title' },
        { path: 'logs._assignee', select: this.userFields },
        { path: 'logs._group', select: this.groupFields },
        { path: 'logs._task', select: '_id title' },
        { path: 'crm._company', select: '_id name description company_pic' },
        { path: 'crm._contacts', select: '_id name description phones emails links _company position crm_custom_fields' },
        { path: 'crm._contacts._company', select: '_id name description company_pic' },
      ]);

    } else if (post.type === 'performance_task') {

      // Populate performance task properties
      post = await Post.populate(post, [
        { path: 'performance_task._assigned_to', select: this.userFields },
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields },
        { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
        { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
        { path: 'permissions._members', select: this.userFields },
        { path: 'logs._actor', select: this.userFields },
        { path: 'logs._new_section', select: '_id title' },
        { path: 'logs._assignee', select: this.userFields },
        { path: 'logs._group', select: this.groupFields },
        { path: 'logs._task', select: '_id title' }
      ]);

    } else if (post.type === 'event') {

      // Populate event properties
      if (post._assigned_to.includes('all')) {
        post = await Post.populate(post, [
          { path: '_group', select: this.groupFields },
          { path: '_posted_by', select: this.userFields },
          { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
          { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
          { path: 'permissions._members', select: this.userFields }
        ])
      } else {
        post = await Post.populate(post, [
          { path: '_assigned_to', select: this.userFields },
          { path: '_group', select: this.groupFields },
          { path: '_posted_by', select: this.userFields },
          { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
          { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
          { path: 'permissions._members', select: this.userFields },
          { path: 'logs._actor', select: this.userFields },
          { path: 'logs._new_section', select: '_id title' },
          { path: 'logs._assignee', select: this.userFields },
          { path: 'logs._group', select: this.groupFields },
          { path: 'logs._task', select: '_id title' }
        ])
      }


    } else if (post.type === 'normal') {

      // Populate normal post properties
      post = await Post.populate(post, [
        { path: '_group', select: this.groupFields },
        { path: '_posted_by', select: this.userFields },
        { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
        { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
        { path: 'permissions._members', select: this.userFields },
        { path: 'logs._actor', select: this.userFields },
        { path: 'logs._new_section', select: '_id title' },
        { path: 'logs._assignee', select: this.userFields },
        { path: 'logs._group', select: this.groupFields },
        { path: 'logs._task', select: '_id title' }
      ]);
    }

    // Return post with populated properties
    return post;
  }

  /**
   * This function is responsible for sending the related real time notifications to the user(s)
   * @param post
   */
  async sendNotifications(post: any, userId: string, logAction?: string) {
      if (!!logAction && logAction == 'change_content') {
        return http.post(`${process.env.NOTIFICATIONS_SERVER_API}/post-edited`, {
            postId: post._id,
            groupId: post._group._id || post._group,
            posted_by: post._posted_by,
            userId: userId
          }).catch(err => {
            console.log(`\n⛔️ Error:\n ${err}`);
          });
      }

      if (post?._content_mentions?.length !== 0) {
        // Create Real time Notification for all the mentions on post content
        return http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-mention`, {
            postId: post._id,
            content_mentions: post._content_mentions,
            groupId: post._group._id || post._group,
            posted_by: post._posted_by,
            userId: userId
          }).catch(err => {
            console.log(`\n⛔️ Error:\n ${err}`);
          });
      }

      // Send notification after post creation
      switch (post.type) {

        case 'task':
          if (post?._assigned_to && post?._assigned_to.length > 0) {
            // Real time notification for new task assignment
            return http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-task`, {
              postId: post?._id,
              assigned_to: post?._assigned_to,
              groupId: post?._group?._id || post?._group,
              posted_by: post?._posted_by,
              userId: userId
            }).catch(err => {
              console.log(`\n⛔️ Error:\n ${err}`);
            });
          }
          break;

        case 'event':
          if (post._assigned_to && post._assigned_to.length > 0) {
            // Real time notification for new event assignment
            return http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-event`, {
              postId: post._id,
              assigned_to: post._assigned_to,
              grouId: (post._group._id || post._group),
              posted_by: post._posted_by,
              userId: userId
            }).catch(err => {
              console.log(`\n⛔️ Error:\n ${err}`);
            });
          }
          break;

        default:
          break;
      }
  }

  /**
   * This function is responsible for sending the related real time notifications to the user(s)
   * @param post
   */
  async sendNewPostNotification(post: any, userId: string) {
    return http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-post`, {
        postId: post._id,
        groupId: post._group._id || post._group,
        posted_by: post._posted_by,
        userId: userId
      }).catch(err => {
        console.log(`\n⛔️ Error:\n ${err}`);
      });
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

      post = await Post.findOneAndUpdate({
          _id: post._id
        }, {
          $push: {
            "logs": {
              action: 'created',
              action_date: moment().format(),
              _actor: userId
            }
          }
        }, {
          new: true
        });

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Send all the required notifications
      this.sendNotifications(post, userId)

      if (post.type == 'normal') {
        this.sendNewPostNotification(post, userId);
      }

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
  async editPostTitle(postTitle: string, postId: string, userId: string) {
    try {

      // Update the post
      var post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $set: {
            title: postTitle
          }
        }, {
          new: true
        });

        post = await Post.findOneAndUpdate({
            _id: postId
          }, {
            $push: {
              "logs": {
                action: 'change_title',
                action_date: moment().format(),
                _actor: userId
              }
            }
          }, {
            new: true
          });

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Send all the required notifications
      this.sendNotifications(post, userId, 'change_content');

      // Return the post
      return post;

    } catch (err) {
      // Return with error
      throw (err);
    }
  };


  /**
   * This function is responsible for editing a post
   * @param post
   * @param postId
   */
  // async editPostContent(post: any, postId: string, userId: string) {
  //   try {

  //     // Parse the String to JSON Object
  //     post = JSON.parse(post)

  //     // Update the post
  //     var post = await Post.findOneAndUpdate({
  //         _id: postId
  //       }, {
  //         $set: {
  //           content: post.content,
  //           _content_mentions: post._content_mentions
  //         }
  //       }, {
  //         new: true
  //       });

  //       post = await Post.findOneAndUpdate({
  //           _id: postId
  //         }, {
  //           $push: {
  //             "logs": {
  //               action: 'change_content',
  //               action_date: moment().format(),
  //               _actor: userId
  //             }
  //           }
  //         }, {
  //           new: true
  //         });

  //     // populate the assigned_to property of this document
  //     post = await this.populatePostProperties(post);

  //     // Send all the required notifications
  //     this.sendNotifications(post, userId);

  //     // Return the post
  //     return post;

  //   } catch (err) {
  //     // Return with error
  //     throw (err);
  //   }
  // };


  /**
   * This function is responsible for editing a post
   * @param post
   * @param postId
   */
  async attachFiles(post: any, postId: string, userId: string) {
    try {
      const files = post.files;

      if (files) {
        if (!post.files) {
          post = await Post.findOneAndUpdate({
              _id: postId
            }, {
              files: []
            }, {
              new: true
            });
        }

        post = await Post.findOneAndUpdate({
            _id: postId
          }, {
            $push: { "files": { $each: files }}
          }, {
            new: true
          });
      }

      post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $push: {
            "logs": {
              action: 'attach_file',
              action_date: moment().format(),
              _actor: userId
            }
          }
        }, {
          new: true
        });

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Send all the required notifications
      this.sendNotifications(post, userId);

      // Return the post
      return post;

    } catch (err) {
      // Return with error
      throw (err);
    }
  };


  /**
   * This function is responsible for editing a post
   * @param post
   * @param postId
   */
  async editPost(post: any, postId: string, userId: string, logAction: string) {
    try {
      // Parse the String to JSON Object
      post = JSON.parse(post)
      const files = post.files;

      // Post Data Object
      var postData: any = {
        title: post.title,
        content: post.content,
        _content_mentions: post._content_mentions,
        tags: post.tags,
        _read_by: [],
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
            isNorthStar: post.task.isNorthStar || false,
            is_idea: post.task.is_idea || false,
            is_crm_task: post.task.is_crm_task || false,
            is_crm_order: post.task.is_crm_order || false,
            is_milestone: post?.task?.is_milestone || false,
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
        });

      // Update attatched files

      if (files) {
        if (!post.files) {
          post = await Post.findOneAndUpdate({
              _id: postId
            }, {
              files: []
            }, {
              new: true
            });
        }

        post = await Post.findOneAndUpdate({
            _id: postId
          }, {
            $push: { "files": { $each: files }}
          }, {
            new: true
          });
      }

      if (!!logAction) {
        post = await Post.findOneAndUpdate({
            _id: postId
          }, {
            $push: {
              "logs": {
                action: logAction,
                action_date: moment().format(),
                _actor: userId
              }
            }
          }, {
            new: true
          });
      }

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Send all the required notifications
      this.sendNotifications(post, userId, logAction);

      // Return the post

      return post;

    } catch (err) {

      // Return with error
      throw (err);
    }
  };


  /**
   * This function is responsible for editing a post
   * @param post
   * @param postId
   */
  async editPostTags(tags: any, postId: string, userId: string) {
    try {

      // Parse the String to JSON Object
      tags = JSON.parse(tags);

      // Update the post
      let post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $set: { tags: tags }
        }, {
          new: true
        });

      post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $push: {
            "logs": {
              action: 'updated_tags',
              action_date: moment().format(),
              _actor: userId
            }
          }
        }, {
          new: true
        });

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Send all the required notifications
      this.sendNotifications(post, userId);

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
      .populate({ path: '_group', select: this.groupFields })
      .populate({ path: '_posted_by', select: this.userFields })
      .populate({ path: '_assigned_to', select: this.userFields })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate({ path: 'task._parent_task', select: '_id title _assigned_to _group task' })
      .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
      .populate({ path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar' })
      .populate({ path: 'task.shuttles._shuttle_section',select:'_id title' })
      .populate({ path: 'performance_task._assigned_to', select: this.userFields })
      .populate({ path: 'permissions._members', select: this.userFields })
      .populate({ path: 'crm._company', select: '_id name description company_pic' })
      .populate({ path: 'crm._contacts', select: '_id name description phones emails links _company position crm_custom_fields' })
      .populate({ path: 'crm._contacts._company', select: '_id name description company_pic' })
      .populate({ path: 'crm.orders._product', select: '_id name description crm_custom_fields' })
      .populate({ path: 'logs._actor', select: this.userFields })
      .populate({ path: 'logs._new_section', select: '_id title' })
      .populate({ path: 'logs._assignee', select: this.userFields })
      .populate({ path: 'logs._group', select: this.groupFields })
      .populate({ path: 'logs._task', select: '_id title' })
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

      const group: any = await Group.findOne({ _id: post._group }).select('_admins').lean();
      const adminIndex = (!!group?._admins) ? group?._admins.findIndex((admin: any) => (admin._id || admin) == userId) : -1;
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

    http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-like-post`, {
        postId: post._id,
        posted_by: post['_posted_by'],
        followers: post['_followers'],
        assigned_to:post['_assigned_to'],
        mentions:post['_content_mentions'],
        groupId:post['_group'],
        user: userId
      }).catch(err => {
        console.log(`\n⛔️ Error:\n ${err}`);
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
   * This function is used to return the users who like the post
   * @param { postId }
   */
  async likedBy(postId: string) {

    const post = await Post.findOne({ _id: postId })
      .select('_liked_by')
      .populate({ path: '_liked_by', select: this.userFields })
      .lean();

    // Return the Data
    return post?._liked_by || []
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

    http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-follow-post`, {
        postId: post._id,
        userId: userId,
        posted_by: post['_posted_by'],
        assigned_to:post['_assigned_to'],
        mentions:post['_content_mentions'],
        groupId:post['_group']
      }).catch(err => {
        console.log(`\n⛔️ Error:\n ${err}`);
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
        });

      // save record of assignment
      post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $push: {
            "logs": {
              action: 'removed_assignee',
              action_date: moment().format(),
              _actor: userId,
              _assignee: assigneeId
            }
          }
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
   * This function is responsible for changing the task assignee
   * @param postId
   * @param assigneeId
   */
  async addAssignee(postId: string, assigneeId: string, userId: string) {

    try {
      var post: any = await Post.findOne({
          _id: postId
        }).select('_assigned_to').lean();

      if (!post._assigned_to) {
        post = await Post.findOneAndUpdate({
            _id: postId
          }, {
            _assigned_to: []
          }, {
            new: true
          });
      }

      // Get post data
      post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $addToSet: { _assigned_to: assigneeId }
        }, {
          new: true
        });

      // save record of assignment
      post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $push: {
            "logs": {
              action: 'assigned_to',
              action_date: moment().format(),
              _actor: userId,
              _assignee: assigneeId
            }
          }
        }, {
          new: true
        });

      // Populate the post properties
      post = await this.populatePostProperties(post);

      // Create Real time Notification to notify user about the task reassignment
      http.post(`${process.env.NOTIFICATIONS_SERVER_API}/task-reassign`, {
          postId: post._id,
          assigneeId: assigneeId,
          _assigned_from: userId
        }).catch(err => {
          console.log(`\n⛔️ Error:\n ${err}`);
        });

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
          "logs": {
            action: 'assigned_to',
            action_date: moment().format(),
            _actor: userId,
            _assignee: assigneeId
          }
        }
      }, {
        new: true
      });

      // Populate the post properties
      post = await this.populatePostProperties(post)

      // Create Real time Notification to notify user about the task reassignment
      http.post(`${process.env.NOTIFICATIONS_SERVER_API}/task-reassign`, {
          postId: post._id,
          assigneeId: assigneeId,
          _assigned_from: userId
        }).catch(err => {
          console.log(`\n⛔️ Error:\n ${err}`);
        });

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
  async changeTaskDueDate(postId: string, userId: string, date_due_to: string) {
    try {
      // Get post data

      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        "task.due_to": date_due_to ? moment(date_due_to).hours(12).format('YYYY-MM-DD') : null,
      }, {
        new: true
      });

      post = await Post.findOneAndUpdate({
        _id: post._id
      }, {
        $push: {
          "logs": {
            action: 'new_due_date',
            action_date: moment().format(),
            _actor: userId,
            new_date: date_due_to ? moment(date_due_to).hours(12).format('YYYY-MM-DD') : null
          }
        }
      }, {
        new: true
      });

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
  async changeTaskDate(postId: string, userId: string, date_field: string, newDate: Date) {

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
      });

      if (date_field === 'start_date') {
        post = await Post.findOneAndUpdate({
          _id: post._id
        }, {
          $push: {
            "logs": {
              action: 'new_start_date',
              action_date: moment().format(),
              _actor: userId,
              new_date: newDate ? moment(newDate).hours(12).format('YYYY-MM-DD') : null
            }
          }
        }, {
          new: true
        });
      }

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
          "logs": {
            action: 'change_status',
            action_date: moment().format(),
            _actor: userId,
            new_status: status ? status : 'to do'
          }
        }
      }, {
        new: true
      });

      // Populate the post properties
      post = await this.populatePostProperties(post);

      if (status !== 'to do') {
        http.post(`${process.env.NOTIFICATIONS_SERVER_API}/status-change`, {
            postId: post._id,
            userId: userId,
            assigned_to: post._assigned_to,
            status: status ? status : 'to do',
            followers: post._followers,
            posted_by: post._posted_by
          }).catch(err => {
            console.log(`\n⛔️ Error:\n ${err}`);
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
          "logs": {
            action: 'change_section',
            action_date: moment().format(),
            _actor: userId,
            _new_section: columnId
          }
        }
      }, {
        new: true
      });

      // Populate the post properties
      post = await this.populatePostProperties(post)

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

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
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: 'permissions._members', select: this.userFields })
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
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: 'permissions._members', select: this.userFields })
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
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: 'permissions._members', select: this.userFields })
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
      }).sort('event.due_to')
      .populate('_assigned_to', 'first_name last_name')
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate('_group', 'group_name')
      .populate({ path: 'permissions._members', select: this.userFields }).lean();

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
      }).sort('event.due_to')
      .limit(10)
      .populate('_assigned_to', 'first_name last_name')
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate('_group', 'group_name')
      .populate({ path: 'permissions._members', select: this.userFields })
      .lean();

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
      }).sort('event.due_to')
      .limit(5)
      .populate('_assigned_to', 'first_name last_name')
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate('_group', 'group_name')
      .populate({ path: 'permissions._members', select: this.userFields })
      .lean();

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

  async changeCustomFieldValue(postId: string, userId: string, customFieldName: any, customFieldTitle: any, customFieldValue: any) {
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

      post = await Post.findOneAndUpdate({
        _id: post._id
      }, {
        $push: {
          "logs": {
            action: 'change_cf',
            action_date: moment().format(),
            _actor: userId,
            cf_title: customFieldTitle,
            cf_value: customFieldValue
          }
        }
      }, {
        new: true
      });

      return await this.populatePostProperties(post);

    } catch (error) {
      throw (error);
    }
  }

  async getNorthStarTasks(userId: string) {
    try {
      const groups = await Group.find({ $or: [{ _members: userId }, { _admins: userId }] }).select('_id').lean();

      return await Post.find({
          $and: [
            { '_group': { $in: groups }},
            { 'task.isNorthStar': true },
            { 'task._parent_task': null }
          ]
        })
        .sort('-created_date')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields });
    } catch (error) {
      throw (error);
    }
  }

  async getGlobalNorthStarTasks(userId: string) {
    try {
      const userData = await User.findById(userId).select('_workspace').lean();

      let posts = await Post.find({
          $and: [
            { '_group': { $eq: null }},
            { 'task.isNorthStar': true },
            { 'task._parent_task': null }
          ]
        })
        .sort('-created_date')
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .lean();

      posts = posts.filter(tmpPost => tmpPost._posted_by._workspace.toString() == userData._workspace.toString());

      for (let i = 0; i < posts.length; i++) {
        let post = posts[i];

        const subtasks = await Post.find({
            $and: [
              { type: 'task' },
              { 'task._parent_task': post?._id },
            ]
          }).select('task.status task.isNorthStar task.northStar').lean();

        if (subtasks && subtasks.length > 0) {
          let northStarValues = [];
          subtasks.forEach(st => {
            st.task.northStar.values = st?.task?.northStar?.values?.sort((v1, v2) => (moment.utc(v1.date).isBefore(moment.utc(v2.date))) ? 1 : -1)
            let nsValues:any = {};
            if (st?.task?.isNorthStar) {
              const value = st?.task?.northStar?.values[0];
              nsValues = {
                  // currency: st?.task?.northStar?.currency,
                  type: st?.task?.northStar?.type,
                  value: value?.value,
                  status: value?.status,
                };
            } else {
              nsValues = {
                type: '',
                value: 0,
                status: st?.task?.status
              };
            }

            northStarValues = northStarValues.concat(nsValues);
          });

          post.northStarValues = northStarValues;
        }

        posts[i] = post;
      }

      return posts;
    } catch (error) {
      throw (error);
    }
  }

  async getNorthStarStats(userId: string) {
    try {
      let nsAssignedToMe =await Post.find({
          $and: [
            { 'task.isNorthStar': true },
            { '_assigned_to': userId }
          ]
        }).select('task.northStar').lean();

      let nsAssignedByMe =await Post.find({
          $and: [
            { 'task.isNorthStar': true },
            { '_posted_by': userId }
          ]
        }).select('task.northStar').lean();

      return {
        nsAssignedToMe: nsAssignedToMe || [],
        nsAssignedByMe: nsAssignedByMe || []
      };
    } catch (error) {
      throw (error);
    }
  }

  async getGlobalNorthStarStats(userId: string) {
    try {
      let nsAssignedToMe =await Post.find({
          $and: [
            { 'task.isNorthStar': true },
            { 'task._parent_task': null },
            { '_assigned_to': userId },
            { '_group': { $eq: null }}
          ]
        }).select('task.northStar').lean();

      let nsAssignedByMe =await Post.find({
          $and: [
            { 'task.isNorthStar': true },
            { 'task._parent_task': null },
            { '_posted_by': userId },
            { '_group': { $eq: null }}
          ]
        }).select('task.northStar').lean();

      return {
        nsAssignedToMe: nsAssignedToMe || [],
        nsAssignedByMe: nsAssignedByMe || []
      };
    } catch (error) {
      throw (error);
    }
  }

  async getWorspacePostsResults(workspaceId: any, type: any, numDays: number, overdue: boolean, filteringGroups: any) {

    const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');

    let groups = [];
    if (filteringGroups && filteringGroups != 'undefined' && filteringGroups.length > 0) {
      groups = filteringGroups;
    } else {
      groups = await Group.find({ _workspace: workspaceId }).select('_id').lean();
      groups = groups.map(group => group._id);
    }

    let posts = [];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format()

      // Fetch the tasks posts
      posts = await Post.find({
          $and: [
            { _group: { $in: groups } },
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
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: 'permissions._members', select: this.userFields })
        .lean();

    } else {
      posts = await Post.find({
          $and: [
            { _group: { $in: groups } },
            { type: type },
            { 'task.due_to': { $gte: comparingDate } }
          ]
        })
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .populate({ path: 'permissions._members', select: this.userFields })
        .lean();
    }

    return posts;
  }

  async getWorspaceNorthStars(workspaceId: any, type: any, numDays: number, overdue: boolean, isNorthStar: boolean, filteringGroups: any) {

    const comparingDate = moment().local().subtract(numDays, 'days').format('YYYY-MM-DD');

    let groups = [];
    if (filteringGroups && filteringGroups != 'undefined' && filteringGroups.length > 0) {
      groups = filteringGroups;
    } else {
      groups = await Group.find({ _workspace: workspaceId }).select('_id').lean();
      groups = groups.map(group => group._id);
    }

    let posts = [];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format();

      // Fetch the tasks posts
      posts = await Post.find({
          $and: [
            { _group: { $in: groups } },
            { type: type },
            { 'task.isNorthStar': isNorthStar },
            { 'task.due_to': { $gte: comparingDate, $lt: today } }
          ]
        })
        .sort('-task.due_to')
        .populate('_group', this.groupFields)
        .populate('_posted_by', this.userFields)
        .populate('_assigned_to', this.userFields)
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: 'permissions._members', select: this.userFields })
        .lean();

    } else {
      posts = await Post.find({
          $and: [
            { _group: { $in: groups } },
            { type: type },
            { 'task.isNorthStar': isNorthStar },
            { 'task.due_to': { $gte: comparingDate } }
          ]
        })
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .populate({ path: 'permissions._members', select: this.userFields })
        .lean();
    }

    return posts;
  }

  async getGroupTasksResults(groupId: any, type: any, numDays: any, overdue: boolean) {

    let posts = [];

    if (!isNaN(numDays)) {
      const comparingDate = moment().local().subtract(+numDays, 'days').format('YYYY-MM-DD');
      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format();

      if (overdue) {
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
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
          .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
          .populate({ path: 'permissions._members', select: this.userFields })
          .lean();

      } else {
        posts = await Post.find({
          $and: [
            { _group: groupId },
            { type: type },
            { 'task.due_to': { $gte: comparingDate } },
            {
              $or: [
                { 'task.due_to': { $gte: today } },
                { 'task.status': 'done' }
              ]
            }
          ]
        })
          .sort('-task.due_to')
          .populate({ path: '_group', select: this.groupFields })
          .populate({ path: '_posted_by', select: this.userFields })
          .populate({ path: '_assigned_to', select: this.userFields })
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
          .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
          .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
          .populate({ path: 'permissions._members', select: this.userFields })
          .lean();
      }
    } else {
        posts = await Post.find({
          $and: [
            { _group: groupId },
            { type: type }
          ]
        })
          .sort('-task.due_to')
          .populate({ path: '_group', select: this.groupFields })
          .populate({ path: '_posted_by', select: this.userFields })
          .populate({ path: '_assigned_to', select: this.userFields })
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
          .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
          .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
          .populate({ path: 'permissions._members', select: this.userFields })
          .lean();
    }

    return posts;
  }

  async getColumnTasksResults(columnId: any, overdue: boolean) {

    let posts = [];

    // Generate the actual time
    const today = moment().subtract(1, 'days').endOf('day').format()

    if (overdue) {

      // Fetch the tasks posts
      posts = await Post.find({
        $and: [
          { 'task._column': columnId },
          { type: 'task' },
          { 'task.due_to': { $lt: today } },
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
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: 'permissions._members', select: this.userFields })
        .lean();

    } else {
      posts = await Post.find({
        $and: [
          { 'task._column': columnId },
          { type: 'task' },
          {
            $or: [
              { 'task.due_to': { $gte: today } },
              { 'task.status': 'done' }
            ]
          }
        ]
      })
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .populate({ path: 'permissions._members', select: this.userFields })
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
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .lean();

    return posts;
  }

  async getAllProjectTasks(groupId: any, overdue: boolean) {

    let posts = [];

    if (overdue) {

      // Generate the actual time
      const today = moment().subtract(1, 'days').endOf('day').format()

      // Fetch the tasks posts
      posts = await Post.find({
        $and: [
          { _group: groupId },
          { type: 'task' },
          { 'task.due_to': { $lt: today } },
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
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: 'permissions._members', select: this.userFields })
        .lean();

    } else {
      posts = await Post.find({
        $and: [
          { _group: groupId },
          { type: 'task' }
        ]
      })
        .sort('-task.due_to')
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: '_posted_by', select: this.userFields })
        .populate({ path: '_assigned_to', select: this.userFields })
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
        .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
        .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
        .populate({ path: 'permissions._members', select: this.userFields })
        .lean();
    }

    return posts;
  }

  async getGroupPostsResults(groupId: any, numDays: any) {

    const comparingDate = moment().local().subtract(+numDays, 'days').format('YYYY-MM-DD');

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
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate({ path: 'task._parent_task', select: '_id title _assigned_to task' })
      .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
      .populate({ path: 'task.northStar.values._user', select: this.userFields })
      .populate({ path: 'logs._actor', select: this.userFields })
      .populate({ path: '_followers', select: this.userFields, options: { limit: 10 } })
      .populate({ path: 'permissions._members', select: this.userFields })
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
          "logs": {
            action: 'moved_to',
            action_date: moment().format(),
            _actor: userId,
            _group: groupId
          }
        }
      }
    } else {
      update = {
        _group: groupId,
        $push: {
          "logs": {
            action: 'moved_to',
            action_date: moment().format(),
            _actor: userId,
            _group: groupId
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
          "logs": {
            action: 'moved_to',
            action_date: moment().format(),
            _actor: userId,
            _group: groupId
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
      delete newPost.permissions;
      delete newPost.logs;
      delete newPost.comments;
      if (newPost.task && newPost.task.custom_fields) {
        delete newPost.task.custom_fields;
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

      // this if is added to fix old NS tasks with old currency properties
      if (newPost.task.northStar.type == 'Currency $' || newPost.task.northStar.type == 'Currency €') {
        if (newPost.task.northStar.type == 'Currency $') {
          newPost.task.northStar.currency = 'USD';
        }
        if (newPost.task.northStar.type == 'Currency €') {
          newPost.task.northStar.currency = 'EUR';
        }

        newPost.task.northStar.type = 'Currency';
      }

      if (newPost.files) {
        let files = newPost.files;
        newPost.files = [];

        const group: any = await Group.findById(groupId).select('_workspace').lean();

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          // Get the folder link from the environment
          const folder = process.env.FILE_UPLOAD_FOLDER;
          var minioClient = new minio.Client({
              endPoint: process.env.MINIO_DOMAIN,
              port: +(process.env.MINIO_API_PORT),
              useSSL: process.env.MINIO_PROTOCOL == 'https',
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY
          });

          var conds = new minio.CopyConditions();

          await minioClient.bucketExists((group._workspace).toLowerCase(), async (error, exists) => {
            if (error) {
              throw (error);
            }

            if (!exists) {
              // Make a bucket.
              await minioClient.makeBucket((group._workspace).toLowerCase(), async (error) => {
                if (error) {
                  throw (error);
                }

                const encryption = { algorithm: "AES256" };
                await minioClient.setBucketEncryption((group._workspace).toLowerCase(), encryption)
                  .then(() => console.log("Encryption enabled"))
                  .catch((error) => console.error(error));

                // Using fPutObject API upload your file to the bucket.
                minioClient.copyObject((group._workspace).toLowerCase(), fileName, currentFile.modified_name, conds, (e, data) => {
                  if (e) {
                    throw (e);
                  }
                });
              });
            } else {
              // Using fPutObject API upload your file to the bucket.
              minioClient.copyObject((group._workspace).toLowerCase(), fileName, currentFile.modified_name, conds, (e, data) => {
                if (error) {
                  throw (error);
                }
              });
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
            "logs": {
              action: 'copy_to',
              action_date: moment().format(),
              _actor: userId,
              _group: groupId
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
          .select('_id title type task');

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


      if (posts && posts.length > 0) {
        let length = posts.length;
        for (var i = 0; i < length; i++) {
          if (posts[i]?.task?.is_milestone == true) {
            posts.splice(i, 1);
            i--;
            length--;
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

  async setParentTask(postId: string, userId: string, parentTaskId: string) {

    try {

      const parent: any = await Post.findOne({_id: parentTaskId}).select('_group').lean();

      let post: any;
      if (parent && parent._group) {
        post = await Post.findOneAndUpdate({
            _id: postId
          }, {
            'task._parent_task': parentTaskId,
            $unset: { 'task._column': '' }
          }, {
            new: true
          });
      } else {
        post = await Post.findOneAndUpdate({
            _id: postId
          }, {
            'task._parent_task': parentTaskId,
          }, {
            new: true
          });
      }

      post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $push: {
            "logs": {
              action: 'set_parent',
              action_date: moment().format(),
              _actor: userId,
              _task: parentTaskId
            }
          }
        }, {
          new: true
        });

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

  async setDependencyTask(postId: string, userId: string, dependecyTaskId: string) {

    try {

      let dependentPost = await Post.findOneAndUpdate({
        _id: postId
      }, {
        $push: {
          "task._dependency_task": dependecyTaskId,
          "logs": {
            action: 'make_dependent',
            action_date: moment().format(),
            _actor: userId,
            _task: dependecyTaskId
          }
        }
      }, {
        new: true
      })

      let dependencyPost = await Post.findOneAndUpdate({
        _id: dependecyTaskId
      }, {
        $push: {
          "task._dependent_child": postId,
          "logs": {
            action: 'make_dependency',
            action_date: moment().format(),
            _actor: userId,
            _task: postId
          }
        }
      }, {
        new: true
      })



      // populate the properties of this document
      dependentPost = await this.populatePostProperties(dependentPost);

      // Return the post
      return dependentPost;

    } catch (err) {
      console.log(`\n⛔️ Error:\n ${err}`);
      // Return with error
      throw (err);
    }
  }

  async removeDependencyTask(postId: string, userId: string, dependecyTaskId: string) {

    try {


      const dependencyPost = await Post.findByIdAndUpdate({
        _id: dependecyTaskId
      }, {
        $pull: {
           "task._dependent_child": postId
        },
        $push: {
          "logs": {
            action: 'remove_dependency',
            action_date: moment().format(),
            _actor: userId,
            _task: postId
          }
        }
      },
        {
          new: true
        }
      );


      let dependentPost = await Post.findByIdAndUpdate({
        _id: postId
      }, {
        $pull: {
           "task._dependency_task": dependecyTaskId
        },
        $push: {
          "logs": {
            action: 'remove_dependent',
            action_date: moment().format(),
            _actor: userId,
            _task: dependecyTaskId
          }
        }
      },
        {
          new: true
        }
      );


      // populate the properties of this document
      dependentPost = await this.populatePostProperties(dependentPost);

      // Return the post
      return dependentPost;

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
      delete newPost.permissions;
      delete newPost.logs;
      delete newPost.comments;
      if (newPost.task && newPost.task.custom_fields) {
        delete newPost.task.custom_fields;
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

        const group: any = await Group.findById(newPost?._group).select('_workspace').lean();

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          var minioClient = new minio.Client({
              endPoint: process.env.MINIO_DOMAIN,
              port: +(process.env.MINIO_API_PORT),
              useSSL: process.env.MINIO_PROTOCOL == 'https',
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY
          });

          var conds = new minio.CopyConditions();

          await minioClient.bucketExists((group._workspace).toString().toLowerCase(), async (error, exists) => {
            if (error) {
              throw (error);
            }

            if (!exists) {
              // Make a bucket.
              await minioClient.makeBucket((group._workspace).toString().toLowerCase(), async (error) => {
                if (error) {
                  throw (error);
                }

                const encryption = { algorithm: "AES256" };
                await minioClient.setBucketEncryption((group._workspace).toString().toLowerCase(), encryption)
                  .then(() => console.log("Encryption enabled"))
                  .catch((error) => console.error(error));

                // Using fPutObject API upload your file to the bucket.
                minioClient.copyObject((group._workspace).toString().toLowerCase(), fileName, currentFile.modified_name, conds, (e, data) => {
                  if (e) {
                    throw (e);
                  }
                });
              });
            } else {
              // Using fPutObject API upload your file to the bucket.
              minioClient.copyObject((group._workspace).toString().toLowerCase(), fileName, currentFile.modified_name, conds, (e, data) => {
                if (error) {
                  throw (error);
                }
              });
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
      delete template.permissions;
      delete template.logs;
      delete template.comments;
      delete template.task._column;
      delete template.task.due_date;
      delete template.task.start_date;
      if (template.task && template.task.custom_fields) {
        delete template.task.custom_fields;
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

        const group: any = await Group.findById(groupId).select('_workspace').lean();

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          var minioClient = new minio.Client({
              endPoint: process.env.MINIO_DOMAIN,
              port: +(process.env.MINIO_API_PORT),
              useSSL: process.env.MINIO_PROTOCOL == 'https',
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY
          });

          var conds = new minio.CopyConditions();

          await minioClient.bucketExists((group._workspace).toLowerCase(), async (error, exists) => {
            if (error) {
              throw (error);
            }

            if (!exists) {
              // Make a bucket.
              await minioClient.makeBucket((group._workspace).toLowerCase(), async (error) => {
                if (error) {
                  throw (error);
                }

                const encryption = { algorithm: "AES256" };
                await minioClient.setBucketEncryption((group._workspace).toLowerCase(), encryption)
                  .then(() => console.log("Encryption enabled"))
                  .catch((error) => console.error(error));

                // Using fPutObject API upload your file to the bucket.
                minioClient.copyObject((group._workspace).toLowerCase(), fileName, currentFile.modified_name, conds, (e, data) => {
                  if (e) {
                    throw (e);
                  }
                });
              });
            } else {
              // Using fPutObject API upload your file to the bucket.
              minioClient.copyObject((group._workspace).toLowerCase(), fileName, currentFile.modified_name, conds, (e, data) => {
                if (error) {
                  throw (error);
                }
              });
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

      const user: any = await User.findOne({ _id: template._assigned_to }).select('_workspace');

      //delete files, this catches both document insertion as well as multiple file attachment deletes
      if (newPost.files?.length > 0) {
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
        deleteFiles(newPost.files, function (err) {
          if (err) { throw (err); }
          //all files removed);
        });
      }

      //chec/delete document files that were exported
      const filepath = `${newPostId + (newPost._group._id || newPost._group) + 'export' + '.docx'}`;
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

      if (template.files) {
        // Start adding the files from the template
        let files = template.files;
        let postFiles = [];

        // Fetch the files from the current request
        await files.forEach(async (currentFile: any, index: Number) => {

          // Instantiate the fileName variable and add the date object in the name
          let fileName = Date.now().toString() + currentFile.original_name;

          var minioClient = new minio.Client({
              endPoint: process.env.MINIO_DOMAIN,
              port: +(process.env.MINIO_API_PORT),
              useSSL: process.env.MINIO_PROTOCOL == 'https',
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY
          });

          var conds = new minio.CopyConditions();

          await minioClient.bucketExists(user?._workspace?.toLowerCase(), async (error, exists) => {
            if (error) {
              throw (error);
            }

            if (!exists) {
              // Make a bucket.
              await minioClient.makeBucket(user?._workspace?.toLowerCase(), async (error) => {
                if (error) {
                  throw (error);
                }

                const encryption = { algorithm: "AES256" };
                await minioClient.setBucketEncryption(user?._workspace?.toLowerCase(), encryption)
                  .then(() => console.log("Encryption enabled"))
                  .catch((error) => console.error(error));

                // Using fPutObject API upload your file to the bucket.
                minioClient.copyObject(user?._workspace?.toLowerCase(), fileName, currentFile.modified_name, conds, (e, data) => {
                  if (e) {
                    throw (e);
                  }
                });
              });
            } else {
              // Using fPutObject API upload your file to the bucket.
              minioClient.copyObject(user?._workspace?.toLowerCase(), fileName, currentFile.modified_name, conds, (e, data) => {
                if (error) {
                  throw (error);
                }
              });
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
   * This function is responsible for changing the task estimation
   * @param postId
   * @param userId
   * @param estimation
   */
  async saveEstimation(postId: string, userId: string, estimation: number) {

    try {
      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        "task.estimation": estimation
      }, {
        new: true
      });

      post = await Post.findByIdAndUpdate({
        _id: postId
      }, {
        $push: {
          "logs": {
            action: 'save_estimation',
            action_date: moment().format(),
            _actor: userId,
            estimation: estimation
          }
        }
      },
        {
          new: true
        }
      );

      // Populate the post properties
      post = await this.populatePostProperties(post);

      // Return the post
      return post;

    } catch (err) {
      throw (err);
    }
  }

  async pinToTop(postId: string, pin: boolean) {

    try {
      // Get post data
      var post: any = await Post.findOneAndUpdate({
        _id: postId
      }, {
        "pin_to_top": pin
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

  async voteIdea(postId: string, vote: number, userId: string) {

    try {
      let post = await Post.findById(postId).select('task.idea.positive_votes task.idea.negative_votes').lean();

      if (vote > 0) {
        post = await Post.findOneAndUpdate(
          {_id: postId },
          {
            $pull: { 'task.idea.negative_votes': userId },
            $addToSet: { 'task.idea.positive_votes': userId }
          },
          { new: true }
          ).lean();
      } else {
        post = await Post.findOneAndUpdate(
          {_id: postId },
          {
            $pull: { 'task.idea.positive_votes': userId },
            $addToSet: { 'task.idea.negative_votes': userId }
          },
          { new: true }
          ).lean();
      }

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
        let shuttleIndex = (!!post?.task?.shuttles) ? post?.task?.shuttles?.findIndex(shuttle => (shuttle._shuttle_group._id || shuttle._shuttle_group) == groupId) : -1;
        switch (action.name) {
            case 'Assign to':
                action._user.forEach(async userAction => {
                    const assigneeIndex = ((!!post._assigned_to)) ? post._assigned_to.findIndex(assignee => { return (assignee._id || assignee) == (userAction._id || userAction) }) : -1;
                    if (assigneeIndex < 0) {
                      if (isChildStatusTrigger && post.task._parent_task) {
                        post = await this.addAssignee(post.task._parent_task._id || post.task._parent_task, userAction, userId);
                      } else {
                        post = await this.addAssignee(post._id, userAction, userId);
                      }
                    }
                });

                break;
            case 'Custom Field':
                  if (isChildStatusTrigger && post.task._parent_task) {
                    post = await this.changeCustomFieldValue(post.task._parent_task._id || post.task._parent_task, userId, action.custom_field.name, action.custom_field.title, action.custom_field.value);
                  } else {
                    post = await this.changeCustomFieldValue(post._id, userId, action.custom_field.name, action.custom_field.title, action.custom_field.value);
                  }
                break;
            case 'Move to':
                if (isChildStatusTrigger && post.task._parent_task) {
                  if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                    post = await this.selectShuttleSection(post._id, true, (action._section._id || action._section), groupId);
                  }
                } else {
                  if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                    post = await this.selectShuttleSection(post._id, true, (action._section._id || action._section), groupId);
                  } else {
                    if (!post.task._parent_task) {
                      post = await this.changeTaskColumn(post._id, (action._section._id || action._section), userId);
                    }
                  }
                }
                break;
            case 'Change Status to':
                if (isChildStatusTrigger && post.task._parent_task) {
                  if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                    post = await this.selectShuttleStatus(post._id, (post?.task?._shuttle_group?._id || post?.task?._shuttle_group), action.status, userId);
                  } else {
                    post = await this.changeTaskStatus(post.task._parent_task._id || post.task._parent_task, action.status, userId);
                  }
                } else {
                  if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                    post = await this.selectShuttleStatus(post._id, groupId, action.status, userId);
                  } else {
                    post = await this.changeTaskStatus(post._id, action.status, userId);
                  }
                }
                break;
            case 'Shuttle task':
                if (shuttleIndex < 0) {
                  post = await this.selectShuttleGroup(post._id, action?._shuttle_group?._id || action?._shuttle_group, userId);
                }
                break;
            case 'Set Due date':
                if (shuttleIndex < 0) {
                  let newDueDate;
                  if (action?.due_date_value == 'tomorrow') {
                    newDueDate = moment().add(1,'days');
                  } else if (action?.due_date_value == 'end_of_week') {
                    newDueDate = moment().endOf('week').subtract(1,'days');
                  } else if (action?.due_date_value == 'end_of_next_week') {
                    newDueDate = moment().add(1,'weeks').endOf('week').subtract(1,'days');
                  } else if (action?.due_date_value == 'end_of_month') {
                    newDueDate = moment().endOf('month');
                  }

                  if (newDueDate) {
                    post = await this.changeTaskDueDate(post._id, userId, newDueDate);
                  }
                }
                break;
            case 'Set Estimation Time to':
                if (shuttleIndex < 0) {
                  post = await this.saveEstimation(post._id, userId, action?.estimation);
                }
                break;
            default:
                break;
        }
    });
    return post;
  }

  /**
   * Execute the actions from the automator
   *
   * @param postId
   * @param userId
   * @param trigger
   */
  async triggerToZap(postId: string, userId: string, trigger: string) {
    const post = await Post.findById(postId)
      .populate('_assigned_to').select(this.userFields )
      .populate('_group').select(this.groupFields )
      .populate('_posted_by').select(this.userFields )
      .populate({path:'task._column',select:'_id title'}).select('task title content tags');

    const user = await User.findById(userId);
    if(user && post){
      const postData = {
          title: post.title,
          due: DateTime.fromISO(post?.task?.due_to).toISODate(),
          status: post?.task?.status,
          groupName: post?._group?.group_name,
          workspaceName: post?._group?.workspace_name,
          section: post?.task?._column?.title,
          assigneeEmail: user?.email,
          assigneeName: user?.full_name,
          postByEmail: post?._posted_by?.email,
          postByName:post?._posted_by?.full_name,
      }

      user?.integrations?.zapier?.webhook.forEach(async (webhook) => {
        if(webhook.trigger == trigger){
          await axios.post(webhook.webhookURl,postData);
        }
      });
    }
  }

  async selectShuttleSection(postId: string, shuttleType: boolean, shuttleSectionId: string, shuttleGroupId: string) {
    let post = await Post.findByIdAndUpdate({
            _id: postId
        }, {
            $set: {
              'task.shuttle_type': shuttleType,
              "task.shuttles.$[shuttle]._shuttle_section": shuttleSectionId
            }
        }, {
            arrayFilters: [{ "shuttle._shuttle_group": shuttleGroupId }],
            new: true
        }).lean();

    return await this.populatePostProperties(post);
  }

  async selectShuttleStatus(postId: string, shuttleGroupId: string, shuttleStatus: string, userId: string) {

    let post = await Post.findByIdAndUpdate({
          _id: postId
      }, {
          $set: { "task.shuttles.$[shuttle].shuttle_status": shuttleStatus }
      }, {
          arrayFilters: [{ "shuttle._shuttle_group": shuttleGroupId }],
          new: true
      }).lean();

    if (shuttleStatus !== 'to do') {
      http.post(`${process.env.NOTIFICATIONS_SERVER_API}/status-change`, {
          postId: post._id,
          userId: userId,
          assigned_to: post._assigned_to,
          status: shuttleStatus ? shuttleStatus : 'to do',
          followers: post._followers,
          posted_by: post._posted_by
        }).catch(err => {
          console.log(`\n⛔️ Error:\n ${err}`);
        });
    }
    return await this.populatePostProperties(post);
  }

  async selectShuttleGroup(postId: string, shuttleGroupId: string, userId: string) {
      let post =  await Post.findById({ _id: postId }).select('task.shuttles _group').lean();

      const shuttleIndex = await (!!post.task.shuttles) ? post.task.shuttles.findIndex(shuttle => (shuttle._shuttle_group._id || shuttle._shuttle_group) == shuttleGroupId) : -1;

      if (shuttleGroupId && shuttleIndex < 0) {
        const group = await Group.findById({ _id: shuttleGroupId }).lean();

        post = await Post.findByIdAndUpdate({
                _id: postId
            }, {
              $set: {
                'task.shuttle_type': true,
              },
              $addToSet: {
                "task.shuttles": {
                  shuttled_at: moment().format(),
                  shuttle_status: 'to do',
                  _shuttle_section: group._shuttle_section,
                  _shuttle_group: shuttleGroupId
                }
              }
            }, {
                new: true
            });
      }

      http.post(`${process.env.NOTIFICATIONS_SERVER_API}/shuttle-task`, {
          postId: post._id,
          userId: userId,
          groupId: post._group._id || post._group,
          shuttleGroupId: shuttleGroupId
        }).catch(err => {
          console.log(`\n⛔️ Error:\n ${err}`);
        });
      return this.populatePostProperties(post);
  }


  /**
   * This function is responsible for editing a post crm information
   * @param post
   * @param postId
   */
  async saveCRMInfo(postId: string, crmInfo: any, userId: string) {
    try {

      // Update the post
      var post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $set: {
            crm: crmInfo
          }
        }, {
          new: true
        });

      post = await Post.findOneAndUpdate({
          _id: postId
        }, {
          $push: {
            "logs": {
              action: 'update_crm_info',
              action_date: moment().format(),
              _actor: userId
            }
          }
        }, {
          new: true
        });

      // populate the assigned_to property of this document
      post = await this.populatePostProperties(post);

      // Send all the required notifications
      this.sendNotifications(post, userId, 'change_content');

      // Return the post
      return post;

    } catch (err) {
      // Return with error
      throw (err);
    }
  };

  /**
   * This service is responsible for fetching templates based on the @groupId
   * @param groupId
   */
//   async getTasksPerGroupUserStatusAndDate(groupId: any, userId: any, status: any, dueDate: any) {
//     try {
//       // Posts Variable
//       var posts = [];
// console.log(groupId, userId, status, dueDate);
//       let query = {};
//       if (!!status && status != 'undefined' && status != 'null') {
//         if (status == 'overdue') {
//           query = {
//             $and: [
//               { '_group': groupId },
//               { 'type': 'task' },
//               { 'task.is_template': { $ne: true }},
//               {
//                 $or: [
//                   { 'task.status': 'to do' },
//                   { 'task.status': 'in progress' }
//                 ]
//               },
//               { '_assigned_to': userId },
//               { 'task.due_to': { $lt: dueDate } },
//             ]
//           };
//         } else {
//           query = {
//             $and: [
//               { '_group': groupId },
//               { 'type': 'task' },
//               { 'task.is_template': { $ne: true }},
//               { 'task.status': (status == 'to-do') ? 'to do' : (status == 'in-progress') ? 'in progress' : 'done' },
//               { '_assigned_to': userId },
//               { 'task.due_to': dueDate },
//             ]
//           };
//         }
//       } else {
// console.log("AAAAAAAA", groupId, userId, status, dueDate)
//         query = {
//           $and: [
//             { '_group': groupId },
//             { 'type': 'task' },
//             { 'task.is_template': { $ne: true }},
//             { '_assigned_to': userId },
//             {
//               $or: [
//                 { 'task.due_to': dueDate },
//                 {
//                   $and: [
//                     { 'task.due_to': { $lt: dueDate } },
//                     {
//                       $or: [
//                         { 'task.status': 'to do' },
//                         { 'task.status': 'in progress' }
//                       ]
//                     }
//                   ]
//                 }
//               ]
//             } 
//           ]
//         };
//       }

//       posts = await Post.find(query)
//         .select('title type permissions task approval_flow_launched tags _group comments_count content _content_mentions created_date files')
//         .populate({ path: '_group', select: this.groupFields })
//         .populate({ path: '_posted_by', select: this.userFields })
//         .populate({ path: '_assigned_to', select: this.userFields })
//         .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
//         .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
//         .populate({ path: 'task._parent_task', select: '_id title _assigned_to _group task' })
//         .populate({ path: 'task._shuttle_group', select: '_id group_name shuttle_type _shuttle_section' })
//         .populate({ path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar' })
//         .populate({ path: 'task.shuttles._shuttle_section',select:'_id title' })
//         .populate({ path: 'performance_task._assigned_to', select: this.userFields })
//         .populate({ path: 'permissions._members', select: this.userFields })
//         .populate({ path: 'crm._company', select: '_id name description company_pic' })
//         .populate({ path: 'crm._contacts', select: '_id name description phones emails links _company position crm_custom_fields' })
//         .populate({ path: 'crm._contacts._company', select: '_id name description company_pic' })
//         .populate({ path: 'logs._actor', select: this.userFields })
//         .populate({ path: 'logs._new_section', select: '_id title' })
//         .populate({ path: 'logs._assignee', select: this.userFields })
//         .populate({ path: 'logs._group', select: this.groupFields })
//         .populate({ path: 'logs._task', select: '_id title' })
//         .lean();

//       // Return set of posts
//       return posts;

//     } catch (err) {
//       // Return With error
//       throw (err);
//     }
//   }

  async calculateTimeEntityCost(userRate: number, time: any) {
    return (userRate * time.hours + (time.minutes/60)*userRate);
  }
}
