import { Comment, Post, User, Notification, Story } from '../models';
import http from 'axios';
import { sendErr } from '../utils/sendError';
import moment from 'moment';
import followRedirects from 'follow-redirects';
const fs = require('fs');

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
            query: { postId, storyId },
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
            files: comment.files
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
                  comments: newComment._id
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
            query: { commentId },
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

          // console.log("comentndfvdvvsdc",comment);
      
          // Update comment
          const updatedComment = await Comment.findOneAndUpdate({
            _id: commentId
          }, {
              $set: {
                content: comment.content,
                _content_mentions: comment._content_mentions,
                files: comment.files,
                created_date: moment.utc().format()
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
            // .populate({ path: '_post', populate: { path: '_group' } })
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
      getAllComments = async (postId, storyId) => {
        try {
          let query = (storyId) ? { _story: storyId } : { _post: postId };
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
      getComments = async (postId, storyId) => {
        try {
          let query = (storyId) ? { _story: storyId } : { _post: postId };
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
      getNextComments = async (postId, commentId) => {
        try {
      
          const comments = await Comment.find({
            $and: [
              { _post: postId },
              { _id: { $lt: commentId } }
            ]
          })
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
      
          if (
            // If user is not one of group's admins... and...
            !(user.role === 'owner' || user.role === 'admin')
            // ...user is not the post author... and...
            && (!post._posted_by.equals(userId)
              // ...user is not the cooment author
              && !comment._commented_by.equals(userId))
          ) {
            // Deny access!
            // return sendErr(res, null, 'User not allowed to delete this comment!', 403);
            throw(null);
          }

          //delete files, this catches both document insertion as well as multiple file attachment deletes
          if (comment.files?.length > 0) {
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
            deleteFiles(comment.files, function (err) {
              if (err) { throw (err); }
              //all files removed);
            });
          }

          let commentRemoved: any;
          if (post) {
            // TODO - not sure if the files are being deleted. Wrong name
            //chec/delete document files that were exported
            const filepath = `${process.env.FILE_UPLOAD_FOLDER}${post._id + post._group + 'export' + '.docx'}`;
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

            // Update post: remove new comment id, decrease post count
            await Post.findOneAndUpdate({
                _id: post._id
              }, {
                $pull: {
                  comments: comment._id
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
            const filepath = `${process.env.FILE_UPLOAD_FOLDER}${story._id + 'export' + '.docx'}`;
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
            .lean();

          const user = await User.findOne({
            _id: userId
          }).select('first_name last_name');
      
          await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-like-comment`, {
            comment: comment,
            user: userId
          });

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