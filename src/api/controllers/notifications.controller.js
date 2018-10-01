const { Notification } = require('../models');
const { sendErr } = require('../../utils');

/*	===============================
 *	-- NOTIFICATIONS CONTROLLERS --
 *	===============================
 */

const add = async (type, ownerId, actorId, postId) => {
  try { 
    const notification = await Notification.create({
      _actor: actorId,
      _owner: ownerId,
      _origin_post: postId,
      message: generateNotificationMsg(type),
      type: type
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
      .populate('_owner', 'first_name last_name profile_pic');

    return { notifications };

  } catch (err) {
    return { err };
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
      .populate('_owner', 'first_name last_name profile_pic');

    return { notifications };

  } catch (err) {
    return { err };
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
    return { err };
  }
};

/*	=============
 *	-- HELPERS --
 *	=============
 */

const generateNotificationMsg = (type, post) => {
  if (type === 'assignment') {
    return `created a new ${post.type} assigned to you.`; 
  } else if (type === 'mention') {
    return `has mentioned you on a post.`; 
  }
};

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
  add,
  getRead,
  getUnread,
  markRead
};
