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

    // Join user on private user room
    socket.on('joinUser', (userId) => {

      // join room
      socket.join(userId);
    });

    socket.on('getNotifications', async (userId) => {
      sendNotificationsFeed(socket, userId);
    });

    socket.on('markRead', async (topListId, userId) => {
      await notifications.markRead(topListId);

      sendNotificationsFeed(socket, userId);
    });

    // -| GROUP ACTIVITY ROOM |-

    // Join user on specific group room
    socket.on('joinGroup', (room) => {
      // generate room name
      const roomName = `${room.workspace}_${room.group}`;

      // join room
      socket.join(roomName);
    });

    // -| POSTS NOTIFICATIONS |-

    // Listen to new post creation
    socket.on('newPost', (data) => {
      notifyRelatedUsers(io, socket, data);
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

const generateFeed = async (userId) => {
  return {
    unreadNotifications: await notifications.getUnread(userId),
    readNotifications: await notifications.getRead(userId)
  };
};

const sendNotificationsFeed = async (socket, userId) => {
  const feed = await generateFeed(userId);

  socket.emit('notificationsFeed', feed);
};

const notifyGroupPage = (socket, data) => {
  // generate room name
  const roomName = `${data.workspace}_${data.group}`;

  // broadcast new post to group activity page
  socket.broadcast.to(roomName).emit('newPostOnGroup', data);
};

const notifyRelatedUsers = async (io, socket, data) => {
  try {
    const post = await Post.findById(data.postId).lean();

    // If there's mentions on post content...
    if (post._content_mentions.length !== 0) {
      // ...emit notificationsFeed for every user mentioned
      for (userId of post._content_mentions) {
        let feed = await generateFeed(userId);

        io.sockets.in(userId).emit('notificationsFeed', feed);
      };
    }

    // Send Email notification after post creation
    switch(post.type) {
      case 'task':
        if (post.task._assigned_to.length !== 0) {
          let feed = await generateFeed(post._id);

          io.sockets.in(post._id).emit('notificationsFeed', feed);
        }
      case 'event':
        if (post.event._assigned_to.length !== 0) {
          for (userId of post.event._assigned_to) {
            let feed = await generateFeed(userId);

            io.sockets.in(userId).emit('notificationsFeed', feed);
          };
        }
    };

  } catch (err) {
    return err
  }
};

module.exports = { init };
