const socketIO = require('socket.io');

const notifications = require('../api/controllers/notifications.controller');
const { Post } = require('../api/models');

const init = (server) => {
  const io = socketIO(server);

  /* =================
   * - NOTIFICATIONS -
   * =================
   */

  io.on('connection', (socket) => {

    // -| USER NOTIFICATION CENTER |-

    socket.on('getNotifications', async (userId) => {
      sendNotificationsFeed(socket, userId);
    });

    socket.on('markRead', async (topListId, userId) => {
      await notifications.markRead(topListId);

      // !! HARD CODED FOR TESTING !!
      sendNotificationsFeed(socket, userId);
    });

    // -| GROUP ACTIVITY ROOM |-

    // Join user on specific group room
    socket.on('join', (room) => {
      // generate room name
      const roomName = `${room.workspace}_${room.group}`;

      // join room
      socket.join(roomName);
    });

    // -| POSTS NOTIFICATIONS |-

    // Listen to new post creation
    socket.on('newPost', (data) => {
      notifyRelatedUsers(socket, data);
      notifyGroupPage(socket, data);
    });

    socket.on('disconnect', () => {
      // do nothing...
    });
  });
};

/* ===========
 * - HELPERS -
 * ===========
 */

const sendNotificationsFeed = async (socket, userId) => {
  const feed = {
    unreadNotifications: await notifications.getUnread(userId),
    readNotifications: await notifications.getRead(userId)
  };

  socket.emit('notificationsFeed', feed);
};

const notifyGroupPage = (socket, data) => {
  // generate room name
  const roomName = `${data.workspace}_${data.group}`;

  // broadcast new post to group activity page
  socket.broadcast.to(roomName).emit('newPostOnGroup', data);
};

const notifyRelatedUsers = async (socket, data) => {
  try {
    const post = await Post.findById(data.postId).lean();

    // If there's mentions on post content...
    if (post._content_mentions.length !== 0) {
      // ...emit notificationsFeed for every user mentioned
      for (userId of post._content_mentions) {
        sendNotificationsFeed(socket, userId);
      };
    }

  } catch (err) {
    return err
  }
};

module.exports = { init };
