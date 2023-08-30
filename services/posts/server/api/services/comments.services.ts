import { Comment, Post, User, Notification, Story, Page } from '../models';
import http from 'axios';
import moment from 'moment';
import followRedirects from 'follow-redirects';

const fs = require('fs');
const minio = require('minio');

/*  ===============================
 *  -- COMMENTS Service --
 *  ===============================
 */


 export class CommentsService{
     
    /**
     * Function responsible for adding a new comment
     */
    addComment = async (req) => {
        try {
          let {
            userId,
            query: { postId, storyId, pageId },
            body: { comment }
          } = req;

          comment = JSON.parse(comment);
          
          // console.log("comentndfvdvvsdc",comment);
          // Generate comment data
          const commentData = {
            content: comment['content'],
            _content_mentions: comment['_content_mentions'],
            _highlighted_content_range: comment['_highlighted_content_range'],
            _commented_by: userId,
            _post: postId,
            _story: storyId,
            _page: pageId,
            files: comment.files,
            created_date: moment().format()
          };

          // Create comment
          let newComment:any = await Comment.create(commentData);

          // populate comment
          newComment = await this.getComment(newComment._id);
          newComment.files = comment.files;

          if (postId) {
            // Update post: add new comment id, increase post count
            const post = await Post.findOneAndUpdate({
              _id: postId
            }, {
                $push: {
                  comments: newComment._id,
                  "logs": {
                    action: 'commented',
                    action_date: moment().format(),
                    _actor: userId
                  }
                },
                $inc: {
                  comments_count: 1
                }
              }, {
                new: true
              }).select('title _posted_by task _content_mentions _assigned_to _followers');

            followRedirects.maxBodyLength = 60 * 1024 * 1024;
            // const parsed_newComment = JSON.stringify(newComment);
            var forward_data_object = {
              _id: null,
              _commented_by: '',
              _post_id: null,
              _story_id: null
            };

            forward_data_object._id = newComment._id;
            forward_data_object._commented_by = newComment._commented_by;
            
            if (newComment._post) {
              forward_data_object._post_id = newComment._post._id;
            }

            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-comment`, {
                comment: JSON.stringify(forward_data_object),
                posted_by: post['_posted_by'],
                assigned_to: post['_assigned_to'],
                followers: post['_followers']
              }, { maxContentLength: 60 * 1024 * 1024 }
            );
          } else if (storyId) {
            // Update post: add new comment id, increase post count
            const story = await Story.findOneAndUpdate({
              _id: storyId
            }, {
                $addToSet: {
                  _comments: newComment._id
                }
              }, {
                new: true
              }).select('title _posted_by _content_mentions _assigned_to _followers');
            /*
            followRedirects.maxBodyLength = 60 * 1024 * 1024;
            // const parsed_newComment = JSON.stringify(newComment);
            var forward_data_object = {
              _id: null,
              _commented_by: '',
              _post_id: null,
              _story_id: null
            };

            forward_data_object._id = newComment._id;
            forward_data_object._commented_by = newComment._commented_by;
            
            if (newComment._story) {
              forward_data_object._story_id = newComment._story._id;
            }

            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-comment`, {
                comment: JSON.stringify(forward_data_object),
                posted_by: story['_posted_by'],
                assigned_to: story['_assistants'],
                followers: story['_followers']
              }, { maxContentLength: 60 * 1024 * 1024 }
            );
            */
          } else if (pageId) {
            // Update post: add new comment id, increase post count
            const page = await Page.findOneAndUpdate({
                _id: pageId
              }, {
                $addToSet: {
                  _comments: newComment._id
                }
              }, {
                new: true
              }).select('_id');
          }
      
          if (newComment._content_mentions.length !== 0) {
            // Create Notification for mentions on comments
            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-comment-mention`, {
                comment: JSON.stringify(newComment)
            });
          }
      
          return newComment;
        } catch (err) {
          throw(err);
        }
      };



      /**
       * Function which is responsible for editing a comment
       */
    editComment = async (req) => {
        try {
          let {
            userId,
            params: { commentId },
            body: { comment }
          } = req;
      
          const user:any = await User.findOne({ _id: userId });
      
          const commentFound:any = await Comment.findOne({ _id: commentId });
      
          // Only let admins, owners or the people who posted this comment edit it
          if (!(user.role === 'admin' || user.role === 'owner') && !commentFound._commented_by == userId) {
              throw(null);
            // return sendErr(res, null, 'User not allowed to edit this comment!', 403);
          }

          comment = JSON.parse(comment)
      
          // Update comment
          const updatedComment = await Comment.findOneAndUpdate({
            _id: commentId
          }, {
              $set: {
                content: comment.content,
                _content_mentions: comment._content_mentions,
                files: comment.files//,
                //created_date: moment.utc().format()
              }
            }, {
              new: true
            })
            .populate('_commented_by', 'first_name last_name profile_pic')
            .lean();
      
          // Create Notification for mentions on comments
          if (comment._content_mentions && comment._content_mentions.length !== 0) {
            // notifications.newCommentMentions(comment);
            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-comment-mention`, {
                comment: JSON.stringify(updatedComment)
            });
          }
      
          return updatedComment;
        } catch (err) {
          throw(err);
        }
      };


      /**
       * Function responsible for retrieving a comment
       * @param commentId
       */
      getComment = async (commentId) => {
        try {
          
            const comment = await Comment.findOne({
            _id: commentId
          })
            .populate('_commented_by', '_id first_name last_name profile_pic')
            .populate({path: '_post', select: '_id _group', populate: {path: '_group'}})
            .populate({ path: '_story', select: 'name type icon_pic _lounge _workspace _posted_by created_date' })
            .lean();
      
          return comment;
        } catch (err) {
          throw(err);
        }
      };

      /**
       * Function to get all comments of a post
       * @param { postId }
       */
      getAllComments = async (postId, storyId, pageId) => {
        try {
          let query = (storyId) ? { _story: storyId } : ((pageId) ? { _page: pageId } : { _post: postId });
          const comments = await Comment.find(query)
            //  sorting them on ID will make the more recent ones be fetched first
            .sort('-_id')
            .populate('_commented_by', 'first_name last_name profile_pic')
            .populate('_liked_by', 'first_name last_name profile_pic')
            .lean();
      
          return comments;
        } catch (err) {
          throw(err);
        }
      };


      /**
       * Function to get first 5 comments on a post
       * @param { postId }
       */
      getComments = async (postId, storyId, pageId) => {
        try {
          let query = (storyId) ? { _story: storyId } : ((pageId) ? { _page: pageId } : { _post: postId });
          const comments = await Comment.find(query)
            //  sorting them on ID will make the more recent ones be fetched first
            .sort('-_id')
            .limit(5)
            .populate('_commented_by', 'first_name last_name profile_pic')
            .populate('_liked_by', 'first_name last_name profile_pic')
            .lean();
      
          return comments;
        } catch (err) {
          throw(err);
        }
      };


      /**
       * Function to get next 5 comments on a post
       * @param { postId, commentId }
       */
      getNextComments = async (postId, storyId, pageId, commentId) => {
        try {
          let query = (storyId) 
            ? {
              $and: [
                { _story: storyId },
                { _id: { $lt: commentId } }
              ]
            }
              : ((pageId) 
                ? {
                    $and: [
                      { _page: pageId },
                      { _id: { $lt: commentId } }
                    ]
                  }
                  : {
                      $and: [
                        { _post: postId },
                        { _id: { $lt: commentId } }
                      ]
                    });
          const comments = await Comment.find(query)
            .sort('-_id')
            .limit(5)
            .populate('_commented_by', 'first_name last_name profile_pic')
            .populate('_liked_by', 'first_name last_name')
            .lean();
      
          return comments;
        } catch (err) {
          throw(err);
        }
      };


      /**
       * Function to remove comment from a post
       * @param { userId, commentId }
       */
    removeComment = async (userId, commentId) => {
        try {
      
          // Get comment data
          const comment:any = await Comment.findOne({
            _id: commentId
          }).lean();
      
          let post: any;
          let story: any;
          if (comment._post) {
            // Get post data
            post = await Post.findOne({
              _id: comment._post
            }).lean();
          } else if (comment._story) {
            // Get story data
            story = await Story.findOne({
              _id: comment._story
            }).lean();
          }

          // Get user data
          const user:any = await User.findOne({ _id: userId });
console.log({ user });
          if (
            // If user is not one of group's admins... and...
            !(user.role === 'owner' || user.role === 'admin')
            // ...user is not the post author... and...
            && (!post._posted_by.equals(userId)
              // ...user is not the cooment author
              && !comment._commented_by.equals(userId))
          ) {
            // Deny access!
            throw(null);
          }

          //delete files, this catches both document insertion as well as multiple file attachment deletes
          if (comment.files?.length > 0) {
            //gather source file
            function deleteFiles(files, callback) {
              var i = files.length;
              files.forEach(async function (filepath) {
                const finalpath = `${filepath.modified_name}`
                var minioClient = new minio.Client({
                  endPoint: process.env.MINIO_DOMAIN,
                  port: +(process.env.MINIO_API_PORT),
                  useSSL: process.env.MINIO_PROTOCOL == 'https',
                  accessKey: process.env.MINIO_ACCESS_KEY,
                  secretKey: process.env.MINIO_SECRET_KEY
                });
                await minioClient.removeObject(user._workspace, finalpath, (error) => {
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
            deleteFiles(comment.files, function (err) {
              if (err) { throw (err); }
              //all files removed);
            });
          }

          let commentRemoved: any;
          if (post) {
            // TODO - not sure if the files are being deleted. Wrong name
            //chec/delete document files that were exported
            const filepath = `${post._id + post._group + 'export' + '.docx'}`;

            var minioClient = new minio.Client({
              endPoint: process.env.MINIO_DOMAIN,
              port: +(process.env.MINIO_API_PORT),
              useSSL: process.env.MINIO_PROTOCOL == 'https',
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY
            });
            await minioClient.removeObject(user._workspace, filepath, (error) => {
              if (error) { throw (error); }
            });

            // Update post: remove new comment id, decrease post count
            await Post.findOneAndUpdate({
                _id: post._id
              }, {
                $pull: {
                  comments: comment._id
                },
                $push: {
                  "logs": {
                    action: 'comment_removed',
                    action_date: moment().format(),
                    _actor: userId
                  }
                },
                $inc: {
                  comments_count: -1
                }
              }, {
                new: true
              });
          } else if (story) {
            // TODO - not sure if the files are being deleted. Wrong name
            //chec/delete document files that were exported
            const filepath = `${story._id + 'export' + '.docx'}`;

            var minioClient = new minio.Client({
              endPoint: process.env.MINIO_DOMAIN,
              port: +(process.env.MINIO_API_PORT),
              useSSL: process.env.MINIO_PROTOCOL == 'https',
              accessKey: process.env.MINIO_ACCESS_KEY,
              secretKey: process.env.MINIO_SECRET_KEY
            });
            await minioClient.removeObject(user._workspace, filepath, (error) => {
              if (error) { throw (error); }
            });
                    
            // Update story: remove new comment id
            await Story.findOneAndUpdate({
                _id: story._id
              }, {
                $pull: {
                  _comments: comment._id
                }
              }, {
                new: true
              });
          }

          await Notification.deleteMany({ _origin_comment: commentId });

          commentRemoved = await Comment.findByIdAndRemove(commentId);

          return commentRemoved;
        } catch (err) {
          throw(err);
        }
      };


      /**
       * Marks the comment as read for a particular user
       * by adding that user to the _read_by list which
       * contains all of the users that have read that comment.
       * @param { userId, commentId }
     */
      markCommentAsRead = async (userId, commentId) => {
        // add the user to _read_by
        try {
            await Comment.findByIdAndUpdate(commentId, {
                $addToSet: {
                  _read_by: userId
                }
              }, {
                new: true
              }).lean();
            
              return 'Comment marked as read!';
        } catch (error) {
            throw(error);
        }
      };



      /**
       * This function is used to like a comment
       * @param { userId, commentId }
       */
    likeComment = async (userId, commentId) => {
        try {
          const comment = await Comment.findOneAndUpdate({
            _id: commentId
          }, {
              $addToSet: {
                _liked_by: userId
              }, 
              $inc: { likes_count: 1 }
            }, {
              new: true
            })
            .populate('_liked_by', 'first_name last_name')
            .populate('_post', '_posted_by _assigned_to _followers')
            .populate({ path: '_story', select: 'name type icon_pic _lounge _workspace _posted_by created_date' })
            .lean();

          const user = await User.findOne({
            _id: userId
          }).select('first_name last_name');
      
          if (comment._post) {
            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-like-comment`, {
              comment: comment,
              user: userId
            });
          }
          return {
              comment: comment,
              user: user
          };
        } catch (err) {
          throw(err);
        }
      };


      /**
     * This function is used to unlike a comment
     * @param { userId, commentId }
     */
    unlikeComment = async (userId, commentId) => {
        try {
          const comment = await Comment.findOneAndUpdate({
            _id: commentId
          }, {
              $pull: {
                _liked_by: userId
              }, 
              $inc: { likes_count: -1 }
            }, {
              new: true
            })
            .populate('_liked_by', 'first_name last_name')
            .populate('post', '_posted_by')
            .populate({ path: '_story', select: 'name type icon_pic _lounge _workspace _posted_by created_date' })
            .lean();
      
          const user = await User.findOne({
            _id: userId
          }).select('first_name last_name');
      
      
          return {
            comment,
            user
          };
        } catch (err) {
          throw(err);
        }
      };


      /**
       * This function is used to return the users who like the comment
       * @param { postId }
       */
      async likedBy(commentId: string) {

        const comment = await Comment.findOne({ _id: commentId })
          .select('_liked_by')
          .populate({ path: '_liked_by', select: 'first_name last_name profile_pic role email' })
          .lean();

        // Return the Data
        return comment?._liked_by || []
      }

      /**
       * Function to get next 5 comments on a post
       * @param { postId, commentId }
       */
      getCommentsCount = async (postId, numDays) => {
        try {
          const comparingDate = moment().local().subtract(+numDays, 'days').format('YYYY-MM-DD');

          const numComments = await Comment.find({
            $and: [
              { _post: postId },
              { created_date: { $gte: comparingDate } }
            ]
          }).countDocuments();

          return numComments;

        } catch (err) {
          throw(err);
        }
      };
 }