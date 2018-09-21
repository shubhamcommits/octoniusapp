const socketIO = require('socket.io');

const init = (server) => {
  const io = socketIO(server);

  /* =================
   * - NOTIFICATIONS -
   * =================
   */

  // FOR NEW POSTS ON GROUP FEED:
  // -- When a user open a group activity page, connect user to this group's room
  // -- For every new post, create the hook to broadcast the notification in respective room
  // -- When a user leaves the group page, disconnect user from group room

  io.on('connection', (socket) => {
    console.log('--> User connected, New Post notifications enabled!');

    // Join user on specific group room
    socket.on('join', (room) => {
      // generate room name
      const roomName = `${room.workspace}_${room.group}`;

      // join room
      socket.join(roomName);

      console.log(`User joined ${roomName} room!`);
    });

    // For every new post added, user emit to room, room broadcast to group
    socket.on('newPost', (data) => {
      // generate room name
      const roomName = `${data.workspace}_${data.group}`;

      console.log(data);
      // broadcast new post to group
      socket.broadcast.to(roomName).emit('newPostOnGroup', data.userName);
    });

    socket.on('disconnect', () => {
      console.log('--> User disconnected!');
    });
  });
};

module.exports = { init };
