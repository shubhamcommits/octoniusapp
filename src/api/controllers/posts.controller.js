const moment = require('moment');

const { Group, Post, User, Workspace } = require('../models');
const { sendMail, sendErr } = require('../../utils');

/*	==================
 *	-- POST METHODS --
 *	==================
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

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
  add
};
