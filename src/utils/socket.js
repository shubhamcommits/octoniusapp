const socketIO = require('socket.io');

const notifications = require('../api/controllers/notifications.controller');

const init = (server) => {
  const io = socketIO(server);

  /* =================
   * - NOTIFICATIONS -
   * =================
   */

  io.on('connection', (socket) => {
    // User notification center feed
    socket.on('getNotifications', async (userId) => {
      const feed = {
        unreadNotifications: await notifications.getUnread(userId),
        readNotifications: await notifications.getRead(userId)
      };

      socket.emit('notificationsFeed', feed);
    });


    // Join user on specific group room
    socket.on('join', (room) => {
      // generate room name
      const roomName = `${room.workspace}_${room.group}`;

      // join room
      socket.join(roomName);
    });

    // -| NEW POST ON GROUP |-
    socket.on('newPost', (data) => {
      // generate room name
      const roomName = `${data.workspace}_${data.group}`;

      // broadcast new post to group
      socket.broadcast.to(roomName).emit('newPostOnGroup', data);

      // Create Notification ??
    });

    socket.on('disconnect', () => {
      // do nothing...
    });
  });
};

module.exports = { init };
