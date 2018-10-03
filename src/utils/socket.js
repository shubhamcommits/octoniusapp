const socketIO = require('socket.io');

const notifications = require('../api/controllers/notifications.controller');

const init = (server) => {
  const io = socketIO(server);

  /* =================
   * - NOTIFICATIONS -
   * =================
   */

  io.on('connection', (socket) => {

    // -| USER NOTIFICATION CENTER |-

    socket.on('getNotifications', async (userId) => {
      const feed = await generateFeed(userId);

      socket.emit('notificationsFeed', feed);
    });

    socket.on('markRead', async (topListId) => {
      await notifications.markRead(topListId);

      const feed = await generateFeed(userId);

      socket.emit('notificationsFeed', feed);
    });

    // -| GROUP ACTIVITY NOTIFICATIONS |-

    // Join user on specific group room
    socket.on('join', (room) => {
      // generate room name
      const roomName = `${room.workspace}_${room.group}`;

      // join room
      socket.join(roomName);
    });

    // Notify new posts on group
    socket.on('newPost', (data) => {
      // generate room name
      const roomName = `${data.workspace}_${data.group}`;

      // broadcast new post to group
      socket.broadcast.to(roomName).emit('newPostOnGroup', data);

      // ?? Create Notification for each user ??
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

const generateFeed = async (userId) => {
  return {
    unreadNotifications: await notifications.getUnread(userId),
    readNotifications: await notifications.getRead(userId)
  };
};

module.exports = { init };
