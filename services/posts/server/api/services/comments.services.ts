import { Comment, Post, User } from '../models';
import http from 'axios';
import { sendErr } from '../utils/sendError';
import moment from 'moment';

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
          const {
            userId,
            query: { postId },
            body: { content, contentMentions,  _highlighted_content_range}
          } = req;
          console.log(postId);
          // Generate comment data
          const commentData = {
            content,
            _content_mentions: contentMentions,
            _highlighted_content_range: _highlighted_content_range,
            _commented_by: userId,
            _post: postId
          };
      
          // Create comment
          let comment:any = await Comment.create(commentData);
      
          // populate comment
          comment = await Comment.populate(comment, {
            path: '_commented_by'
          });
      
      
          // Update post: add new comment id, increase post count
          const post = await Post.findOneAndUpdate({
            _id: postId
          }, {
              $push: {
                comments: comment._id
              },
              $inc: {
                comments_count: 1
              }
            }, {
              new: true
            });
      
      
          if (comment._content_mentions.length !== 0) {
            // Create Notification for mentions on comments
            // notifications.newCommentMentions(comment);
            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-comment-mention`, {
                comment: comment
            });
      
            /*
            // for every user mentioned in the comment, we send an email
            await comment._content_mentions.forEach((user) => {
            //   sendMail.userMentionedComment(comment, post, user);
                http.post(`${process.env.MAILING_SERVER_API}/user-comment-mention`,{
                    comment: comment,
                    post: post,
                    user: user
                });
            });
            */
          }
      
          return comment;
        } catch (err) {
          throw(err);
        }
      };



      /**
       * Function which is responsible for editing a comment
       */
    editComment = async (req) => {
        try {
          const {
            userId,
            query: { commentId },
            body: { content, contentMentions }
          } = req;
      
          const user:any = await User.findOne({ _id: userId });
      
          const comment:any = await Comment.findOne({ _id: commentId });
      
          // Only let admins, owners or the people who posted this comment edit it
          if (!(user.role === 'admin' || user.role === 'owner') && !comment._commented_by == userId) {
              throw(null);
            // return sendErr(res, null, 'User not allowed to edit this comment!', 403);
          }
      
          // Update comment
          const updatedComment = await Comment.findOneAndUpdate({
            _id: commentId
          }, {
              $set: {
                content,
                _content_mentions: contentMentions,
                created_date: moment.utc().format()
              }
            }, {
              new: true
            })
            .populate('_commented_by', 'first_name last_name profile_pic')
            .lean();
      
          // Create Notification for mentions on comments
          if (comment._content_mentions.length !== 0) {
            // notifications.newCommentMentions(comment);
            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-comment-mention`, {
                comment: updatedComment
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
            .populate({ path: '_post', populate: { path: '_group' } })
            .lean();
      
          return comment;
        } catch (err) {
          throw(err);
        }
      };


      /**
       * Function to get first 5 comments on a post
       * @param { postId }
       */
      getComments = async (postId) => {
        try {
          const comments = await Comment.find({
            _post: postId
          })
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
      
          // Get post data
          const post:any = await Post.findOne({
            _id: comment._post
          }).lean();
      
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
      
          const commentRemoved = await Comment.findByIdAndRemove(commentId);
      
          // Update post: remove new comment id, decrease post count
          const updatedPost = await Post.findOneAndUpdate({
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
            .populate('_post', '_posted_by')
            .lean();
console.log(comment);
          const user = await User.findOne({
            _id: userId
          }).select('first_name last_name');
      
          await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-like-comment`, {
            comment: comment
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
 }