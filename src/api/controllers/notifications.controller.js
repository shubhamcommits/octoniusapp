const { Notification } = require('../models');

/*  ===============================
 *  -- NOTIFICATIONS CONTROLLERS --
 *  ===============================
 */

const newCommentMentions = async (comment) => {
  try {
    await comment._content_mentions.forEach(async (user) => {
      const notification = await Notification.create({
        _actor: comment._commented_by,
        _owner: user,
        _origin_comment: comment._id,
        _origin_post: comment._post,
        message: 'mentioned you in a comment.',
        type: 'mention'
      });
    });
  } catch (err) {
    return err;
  }
};

const newEventAssignments = async (post) => {
  try {
    await post.event._assigned_to.forEach(async (user) => {
      const notification = await Notification.create({
        _actor: post._posted_by,
        _owner: user,
        _origin_post: post._id,
        message: 'assigned an event to you.',
        type: 'assignment'
      });
    });
  } catch (err) {
    return err;
  }
};

const newPostMentions = async (post) => {
  try {
    await post._content_mentions.forEach(async (user) => {
      const notification = await Notification.create({
        _actor: post._posted_by,
        _owner: user,
        _origin_post: post._id,
        message: 'mentioned you in a post.',
        type: 'mention'
      });
    });
  } catch (err) {
    return err;
  }
};

const newTaskAssignment = async (post) => {
  try {
    const notification = await Notification.create({
      _actor: post._posted_by,
      _owner: post.task._assigned_to,
      _origin_post: post._id,
      message: 'assigned a task to you.',
      type: 'assignment'
    });
  } catch (err) {
    return err;
  }
};

const newTaskReassignment = async (postUpdated) => {
  try {
    const notification = await Notification.create({
      _actor: postUpdated._posted_by,
      _owner: postUpdated.task._assigned_to,
      _origin_post: postUpdated._id,
      message: 'reassigned a task to you.',
      type: 'assignment'
    });
  } catch (err) {
    return err;
  }
};

const getRead = async (userId) => {
  try {
    const notifications = await Notification.find({
      _owner: userId,
      read: true
    })
      .limit(5)
      .sort('-created_date')
      .populate('_actor', 'first_name last_name profile_pic')
      .populate('_origin_post', '_group')
      .populate('_origin_comment', '_post')
      .populate('_owner', 'first_name last_name profile_pic')
      .lean();

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
      .populate('_origin_post', '_group')
      .populate('_origin_comment', '_post')
      .populate('_owner', 'first_name last_name profile_pic')
      .lean();

    return notifications;
  } catch (err) {
    return err;
  }
};

const markRead = async (topListId) => {
  try {
    const markRead = await Notification.updateMany({
      $and: [
        { read: false },
        { _id: { $lte: topListId } }
      ]
    }, {
      $set: {
        read: true
      }
    });

    return true;
  } catch (err) {
    return err;
  }
};

/*  =============
 *  -- EXPORTS --
 *  =============
 */

module.exports = {
  newCommentMentions,
  newEventAssignments,
  newPostMentions,
  newTaskAssignment,
  newTaskReassignment,
  getRead,
  getUnread,
  markRead
};
