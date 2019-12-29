const moment = require('moment');
const mongoose = require('mongoose');

const notifications = require('./notifications.controller');
const {
  Comment, Group, Post, User, Document, DocumentEditHistory, DocumentAuthor, TableCell
} = require('../models');
const { sendMail, sendErr } = require('../../utils');
const fs = require('fs');

const { postService } = require('../services/index');

/*  ======================
 *  -- POST CONTROLLERS --
 *  ======================
 */

// -| MAIN |-

const add = async (req, res, next) => {
  try {
    const postData = req.body;
    let post = await Post.create(postData);
      
    if (post._content_mentions.length !== 0) {
      // Create Notification for mentions on post content
      notifications.newPostMentions(post);

      // start the process to send an email to every user mentioned
      post._content_mentions.forEach((user, i) => {
        sendMail.userMentionedPost(post, user, i);
      });
    }

    // Send Email notification after post creation
    switch (post.type) {
      case 'task':
        if(post.task.unassigned != 'Yes')
        {
        await notifications.newTaskAssignment(post);
        await sendMail.taskAssigned(post);
        await sendMail.scheduleTaskReminder(post);
        }
        break;
      case 'event':
        await notifications.newEventAssignments(post);
        await sendMail.eventAssigned(post);
        await sendMail.scheduleEventReminder(post);
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
    return res.status(200).json({
      message: 'New post created!',
      post
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const edit = async (req, res, next) => {
  try {
    let postData;
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

    const post = await Post.findOne({ _id: req.params.postId });

    const user = await User.findOne({ _id: req.userId });

    // Allow all group's users to edit a multi editor post
    if (post.type === 'document' && user._groups.includes(post._group)) {
      user.role = 'admin';
    }

    // if the user is not an owner or an admin and is not the one who posted, we throw auth error
    if (!(user.role === 'owner' || user.role === 'admin') && !post._posted_by == req.userId) {
      return sendErr(res, null, 'User not allowed to edit this post!', 403);
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
      notifications.newPostMentions(post);
    }

    // Send Email notification after post creation
    switch (post.type) {
      case 'task':
        await notifications.newTaskAssignment(post);
        await sendMail.taskAssigned(post);
        break;
      case 'event':
        await notifications.newEventAssignments(post);
        await sendMail.eventAssigned(post);
        break;
      default:
        break;
    }

    return res.status(200).json({
      message: 'Post updated!',
      post: updatedPost
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const get = async (req, res, next) => {
  try {
    const { postId } = req.params;

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

    return res.status(200).json({
      message: 'Post found!',
      post
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { userId, params: { postId } } = req;

    // Get post data
    const post = await Post.findOne({
      _id: postId
    }).lean();

    // Get user data
    const user = await User.findOne({ _id: req.userId });

    if (
      // If user is not an admin or owner
      !(user.role === 'admin' || user.role === 'owner')
      // ...user is not the post author...
      && !post._posted_by.equals(userId)
    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to remove this post!', 403);
    }

    await post.comments.forEach(async (commentId) => {
      try {
        await Comment.findByIdAndRemove(commentId);

        return true;
      } catch (err) {
        return sendErr(res, err);
      }
    });
//delete files, this catches both document insertion as well as multiple file attachment deletes
   if(post.files.length > 0){
    //gather source file
    function deleteFiles(files, callback){
      var i = files.length;
      files.forEach(function(filepath){
        const finalpath =`${process.env.FILE_UPLOAD_FOLDER}${filepath.modified_name}`
        fs.unlink(finalpath, function(err) {
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
    deleteFiles(post.files, function(err) {
      if (err) {return sendErr(res, err)}
       //all files removed);
    });
  }
//chec/delete document files that were exported
    const filepath = `${process.env.FILE_UPLOAD_FOLDER}${postId + post._group + 'export' + '.docx'}`;
    //check if file exists
    fs.access(filepath, fs.F_OK, error => {
      //if error there was no file
      if(!error){
        //the file was there now unlink it
        fs.unlink(filepath, (err) => {
        //handle error when file was not deleted properly
        if (err) {return sendErr(res, err)}
        //deleted document
        })
      }
    })
//
    const postRemoved = await Post.findByIdAndRemove(postId);

    return res.status(200).json({
      message: 'Post deleted!',
      postRemoved
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/**
 * Marks the post as read for a particular user
 * by adding that user to the _read_by list which
 * contains all of the users that have read that post.
 *
 * @param req the request object
 * @param res the response object
 * @returns http response
 */
const markPostAsRead = async (req, res) => {
  const { userId } = req;
  const { postId } = req.params;

  // add the user to _read_by
  await Post.findByIdAndUpdate(postId, {
    $addToSet: {
      _read_by: userId
    }
  }, {
    new: true
  }).lean();

  return res.status(200).json({
    message: 'Post marked as read!'
  });
};

// -| COMMENTS |-

const addComment = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId },
      body: { content, contentMentions,  _highlighted_content_range}
    } = req;

    // Generate comment data
    const commentData = {
      content,
      _content_mentions: contentMentions,
      _highlighted_content_range: _highlighted_content_range,
      _commented_by: userId,
      _post: postId
    };

    // Create comment
    let comment = await Comment.create(commentData);

    // populate comment
    comment = await Comment.populate(comment, '_commented_by');


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
      notifications.newCommentMentions(comment);

      // for every user mentioned in the comment, we send an email
      comment._content_mentions.forEach((user) => {
        sendMail.userMentionedComment(comment, post, user);
      });
    }

    return res.status(200).json({
      message: 'Comment added!',
      comment
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const editComment = async (req, res, next) => {
  try {
    const {
      userId,
      params: { commentId },
      body: { content, contentMentions }
    } = req;

    const user = await User.findOne({ _id: userId });

    const comment = await Comment.findOne({ _id: commentId });

    // Only let admins, owners or the people who posted this comment edit it
    if (!(user.role === 'admin' || user.role === 'owner') && !comment._commented_by == userId) {
      return sendErr(res, null, 'User not allowed to edit this comment!', 403);
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
      notifications.newCommentMentions(comment);
    }

    return res.status(200).json({
      message: 'Comment updated!',
      comment: updatedComment
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId
    })
      .populate('_commented_by', '_id first_name last_name profile_pic')
      .populate({ path: '_post', populate: { path: '_group' } })
      .lean();

    return res.status(200).json({
      message: 'Comment found!',
      comment
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      _post: postId
    })
      //  sorting them on ID will make the more recent ones be fetched first
      .sort('-_id')
      .limit(5)
      .populate('_commented_by', 'first_name last_name profile_pic')
      .populate('_liked_by', 'first_name last_name profile_pic')
      .lean();

    return res.status(200).json({
      message: `First ${comments.length} comments!`,
      comments
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getNextComments = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

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

    return res.status(200).json({
      message: `Next ${comments.length} comments!`,
      comments
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const removeComment = async (req, res, next) => {
  try {
    const { userId, params: { commentId } } = req;

    // Get comment data
    const comment = await Comment.findOne({
      _id: commentId
    }).lean();

    // Get post data
    const post = await Post.findOne({
      _id: comment._post
    }).lean();

    // Get user data
    const user = await User.findOne({ _id: userId });

    if (
      // If user is not one of group's admins... and...
      !(user.role === 'owner' || user.role === 'admin')
      // ...user is not the post author... and...
      && (!post._posted_by.equals(userId)
        // ...user is not the cooment author
        && !comment._commented_by.equals(userId))
    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to delete this comment!', 403);
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


    return res.status(200).json({
      message: 'Comment deleted!',
      commentRemoved
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/**
 * Marks the comment as read for a particular user
 * by adding that user to the _read_by list which
 * contains all of the users that have read that comment.
 *
 * @param req the request object
 * @param res the response object
 * @returns http response
 */
const markCommentAsRead = async (req, res) => {
  const { userId } = req;
  const { commentId } = req.params;

  // add the user to _read_by
  await Comment.findByIdAndUpdate(commentId, {
    $addToSet: {
      _read_by: userId
    }
  }, {
    new: true
  }).lean();

  return res.status(200).json({
    message: 'Comment marked as read!'
  });
};

// -| DOCUMENTS |-

const getDocument = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const document = await Document.findOne({
      _id: postId
    });

    return res.status(200).json({
      message: 'document found!',
      //postId
      document
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getDocumentHistory = async(req, res, next) => {
  try {
    const { postId } = req.params;

    const docHistory = await DocumentEditHistory.find({
      "d": postId,
    }, {"op": true, "m": true}).populate("op.user_id", {first_name: 1, last_name: 1});
    let documentHistory = docHistory.map((item) => {
      return {
        ops: item.op.ops,
        user_id: item.op.user_id
      }
    });

    return res.status(200).json({
      message: 'document history found!',
      //postId
      documentHistory
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const addDocumentAuthor = async(req, res, next) =>{
  try{
    const {
      params: { postId },
      body: { _user_id, name, color}
    } = req;

    const authorData = {
      _user_id: _user_id,
      name: name,
      color: color,
      _post_id: postId
    };

    const authors = await DocumentAuthor.find({
      _post_id: postId,
      _user_id: _user_id
    });

    if(authors.length == 0 || !authors){
      let author = await DocumentAuthor.create(authorData);

      return res.status(200).json({
        message: 'Document Author Added',
        author
      });
    }
    else{
      return res.status(304).json({
        message: "Author already exist!"
      })
    }

  } catch(err){
    return sendErr(res, err);
  }
};

const getDocumentAuthors = async(req, res, next) => {
  try{
    const { postId } = req.params;

    const authors = await DocumentAuthor.find({
      _post_id: postId
    });

    return res.status(200).json({
      message: 'Authors Found',
      authors
    });
  }
  catch(err){
    return sendErr(res, err);
  }
}

// -| LIKES |-

const like = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId }
    } = req;

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

    return res.status(200).json({
      message: 'Post liked!',
      post,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const unlike = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId }
    } = req;

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


    return res.status(200).json({
      message: 'Post unliked!',
      post,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const likeComment = async (req, res) => {
  try {
    const {
      userId,
      params: { commentId }
    } = req;

    const comment = await Comment.findOneAndUpdate({
      _id: commentId
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

    return res.status(200).json({
      message: 'Post liked!',
      comment,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const unlikeComment = async (req, res) => {
  try {
    const {
      userId,
      params: { commentId }
    } = req;

    const comment = await Comment.findOneAndUpdate({
      _id: commentId
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


    return res.status(200).json({
      message: 'Post unliked!',
      comment,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

// -| Follow |-

const follow = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId }
    } = req;

    const post = await Post.findOneAndUpdate({
      _id: postId
    }, {
        $addToSet: {
          _followers: userId
        }
      }, {
        new: true
      })
      .populate('_followers', 'first_name last_name')
      .lean();

    const user = await User.findOne({
      _id: userId
    }).select('first_name last_name');

    return res.status(200).json({
      message: 'Post Followed!',
      post,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const unfollow = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId }
    } = req;

    const post = await Post.findOneAndUpdate({
      _id: postId
    }, {
        $pull: {
          _followers: userId
        }
      }, {
        new: true
      })
      .populate('_followers', 'first_name last_name')
      .lean();

    const user = await User.findOne({
      _id: userId
    }).select('first_name last_name');


    return res.status(200).json({
      message: 'Post Unfollowed!',
      post,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getNumFollowers = async (req, res, next) => {
  try {
    const {
      params: { postId }
    } = req;

    const post = await Post.findOne({
      _id: postId
    })
      .populate('_followers')

    return res.status(200).json({
      numFollowers: post._followers.length
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

// -| TASKS |-

const changeTaskStatus = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId },
      body: { status }
    } = req;

    // Get post data
    const post = await Post.findOne({
      _id: postId
    }).lean();

    // Get group data
    const group = await Group.findOne({
      _id: post._group
    }).lean();

    // const get user data
    const user = await User.findOne({ _id: userId });

    if (
      // If user is not an admin or owner... and...
      !(user.role === 'admin' || user.role === 'owner')
      // ...user is not the post author... and...
      && (!post._posted_by.equals(userId)
        // ...user is not the task assignee
        && !post.task._assigned_to.equals(userId)
        // ...user is not the performance_task assignee
        && !post.performance_task._assigned_to.equals(userId))

    ) {
      // Deny access!
      return sendErr(res, null, 'User not allowed to update this post!', 403);
    }

    const postUpdated = await Post.findOneAndUpdate({
      _id: postId
    }, {
        'task.status': status,
        'performance_task': status
      }, {
        new: true
      });

    // send email to user and poster when task status is done
    if (status === 'done') {

      await postService.completeTask(postId);

      sendMail.userCompletedTask(req.userId, postUpdated);
    } else if (status === 'in progress') {
      await Post.findOneAndUpdate({ _id: postId }, { 'task.started_at': moment(), 'task.completed_at': null });
    }

    return res.status(200).json({
      message: 'Task status updated!',
      post: postUpdated
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const changeTaskAssignee = async (req, res, next) => {
  try {
    const {
      userId,
      params: { postId },
      body: { assigneeId }
    } = req;

    // Get post data
    const post = await Post.findOne({
      _id: postId
    }).lean();

    // Get group data
    const group = await Group.findOne({
      _id: post._group
    }).lean();

    const postUpdated = await Post.findOneAndUpdate({
      _id: postId
    }, {
        'task._assigned_to': assigneeId,
        'task.unassigned': 'No'
      }, {
        new: true
      })
      .populate('task._assigned_to', 'first_name last_name profile_pic')
      .populate('_group', '_id group_name')
      .populate('_posted_by', 'first_name last_name profile_pic')
      await notifications.newTaskReassignment(postUpdated);
      await sendMail.taskReassigned(postUpdated);

    return res.status(200).json({
      message: 'Task assignee updated!',
      post: postUpdated
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/*  =============
 *  -- TABLE --
 *  =============
 */

const getFormattedTableCells = async (req, res, next) => {
  try{
    const { postId } = req.params;

    const tableCells = await TableCell.find({
      _post_id: postId
    });

    return res.status(200).json({
      message: 'All Table Cells for this post has been found!',
      tableCells
    });
  } catch (err){
    return sendErr(res, err);
  }
}

const insertFormattedTableCells = async (req, res, next) => {
  try{
    const {
      params: { postId },
      body: { _cell_id, _color}
    } = req;

    const tableCellData = {
      _cell_id: _cell_id,
      _color: _color,
      _post_id: postId
    };

    let tableCell = await TableCell.create(tableCellData);

    return res.status(200).json({
      message: 'Table Cell Added',
      tableCell
    });

  } catch (err){
    return sendErr(res, err);
  }
}

//This controller is made for quill to upload it's files to server
const upload = async (req, res, next) => {
  try {
    const { files } = req.body;
    return res.status(200).json({
      message: 'Files uploaded!',
      file: files
    });
  } catch (err) {
    return sendErr(res, err);
  }

}

/*  =============
 *  -- EXPORTS --
 *  =============
 */

module.exports = {
  // Main
  add,
  edit,
  get,
  remove,
  upload,
  markPostAsRead,
  // Comments
  addComment,
  editComment,
  getComment,
  getComments,
  getNextComments,
  removeComment,
  markCommentAsRead,
  // Documents
  getDocument,
  getDocumentHistory,
  addDocumentAuthor,
  getDocumentAuthors,
  // Likes
  like,
  unlike,
  likeComment,
  unlikeComment,
  // Tasks
  changeTaskAssignee,
  changeTaskStatus,
  // Follow
  follow,
  unfollow,
  getNumFollowers,
  // Table Cells
  getFormattedTableCells,
  insertFormattedTableCells
};
