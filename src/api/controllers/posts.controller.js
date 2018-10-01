const moment = require('moment');

const { Group, Post, User, Workspace } = require('../models');
const { sendMail, sendErr } = require('../../utils');

/*	======================
 *	-- POST CONTROLLERS --
 *	======================
 */

const add = async (req, res, next) => {
  try { 
    const postData = req.body;

    // Id it's event post, convert due_to date to UTC before storing 
    if (postData.type === 'event') {
      postData[`event.due_to`] = moment.utc(postData[`event.due_to`]).format();
    }

    const post = await Post.create(postData);

    // Send Email notification after post creation
    switch(post.type) {
      case 'task':
        sendMail.taskAssigned(post);
      case 'event':
        sendMail.eventAssigned(post);
    };

    return res.status(200).json({
      message: 'New post created!',
      post,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const edit = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate({
      _id: req.params.postId,
      _posted_by: req.userId
    }, { 
      $set : {
        content: req.body.content,
        _content_mentions: req.body._content_mentions
      }
    }, {
      new: true
    });
    
    if (!post) {
      return sendErr(res, err, 'User not allowed to edit this post!', 403);
    }

    return res.status(200).json({
      message: 'Post updated!',
      post,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
  add,
  edit
};
