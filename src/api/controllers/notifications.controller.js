const { Notification } = require('../models');
const { sendErr } = require('../../utils');

/*	===============================
 *	-- NOTIFICATIONS CONTROLLERS --
 *	===============================
 */

const newPostMentions = async (post) => {
  try {
    await post._content_mentions.forEach( async (user) => {
      const notification = await Notification.create({
        _actor: post._posted_by,
        _owner: user,
        _origin_post: post._id,
        message: 'mentioned you in a post.',
        type: 'mention'
      });
      
      // Somehow tell socket that there's a new notifiction
    });

    //  !! TRIGGER NOTIFICATION TO USER'S CENTRAL NOTIFICATION !!

  } catch (err) {
    return { err }
  }
};

const getRead = async (userId) => {
  try {
    // Find all posts that has files and belongs to this group
    const notifications = await Notification.find({
      _owner: userId,
      read: true
    })
      .limit(20)
      .sort('-created_date')
      .populate('_actor', 'first_name last_name profile_pic')
      .populate('_owner', 'first_name last_name profile_pic').lean();
    
    return notifications;

  } catch (err) {
    return err;
  }
};

const getUnread = async (userId) => {
  try {
    const notifications = await Notification.find({
      _owner: userId,
      read: false
    })
      .sort('-created_date')
      .populate('_actor', 'first_name last_name profile_pic')
      .populate('_owner', 'first_name last_name profile_pic').lean();

    return notifications;

  } catch (err) {
    return err;
  }
};

const markRead = async (notificationsIds) => {
  try {
    const markRead = await Notification.updateMany({
      _id: notificationsIds
    }, {
      $set: {
        read: true
      }
    });

  } catch (err) {
    return err;
  }
};

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
  newPostMentions,
  getRead,
  getUnread,
  markRead
};
