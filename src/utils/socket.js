const socketIO = require('socket.io');

const init = (server) => {
  const io = socketIO(server);

  /* =================
   * - NOTIFICATIONS -
   * =================
   */

  io.on('connection', (socket) => {
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
    });

    socket.on('disconnect', () => {
      // do nothing...
    });
  });
};

module.exports = { init };
