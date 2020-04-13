const socketIO = require('socket.io');

const init = (server) => {
  const io = socketIO(server);

  /* =================
   * - NOTIFICATIONS -
   * =================
   */
  // io.set('transports', ["websocket", "polling"]);
  
  io.on('connection', (socket) => {
    // -| USER NOTIFICATION CENTER |-

    // Join user on private user room
    socket.on('joinUser', (userId) => {
      // join room
      socket.join(userId);
    });

    // socket.on('getNotifications', async (userId) => {
    //   sendNotificationsFeed(socket, userId, io);
    // });

    // socket.on('markRead', async (topListId, userId) => {
    //   await notifications.markRead(topListId);

    //   sendNotificationsFeed(socket, userId, io);
    // });

    // /* =================
    //  * - WORKSPACE DATA -
    //  * =================
    //  */
    // socket.on("workspaceData", async (workspaceData) => {
    //   // const workspaceData = await workspace.getWorkspaceDetails(workspaceId);

    //   io.emit("workspaceData", workspaceData);
    // });

    // // -| GROUP ACTIVITY ROOM |-

    // // Join user on specific group room
    // socket.on('joinGroup', (room) => {
    //   // generate room name
    //   const roomName = `${room.workspace}_${room.group}`;

    //   // join room
    //   socket.join(roomName);
    // });

    // -| POSTS NOTIFICATIONS |-

    // Listen to user likes who follows a post
    // socket.on('userLiked', (data) => {
    //   console.log('userLiked: ', data);
    // });

    // // Listen to new post creation
    // socket.on('newPost', (data) => {
    //   notifyRelatedUsers(io, socket, data);
    //   notifyGroupPage(socket, data);
    // });

    // socket.on('postAdded', (data) => {
    //   const roomName = `${data.workspace}_${data.group}`;
    //   // Broadcast add event to group
    //   socket.broadcast.to(roomName).emit('postAddedInGroup', data);
    // });

    // socket.on('postDeleted', (data) => {
    //   const roomName = `${data.workspace}_${data.group}`;
    //   // Broadcast delete event to group
    //   socket.broadcast.to(roomName).emit('postDeletedInGroup', data);
    // });

    // socket.on('postEdited', (data) => {
    //   const roomName = `${data.workspace}_${data.group}`;
    //   // Broadcast edit event to group
    //   socket.broadcast.to(roomName).emit('postEditedInGroup', data);
    // });

    socket.on('disconnect', () => {
      // do nothing...
    });
  });
};

/* ===========
 * - HELPERS -
 * ===========
 */

// const generateFeed = async (userId, io) => {
//   try {
//     const unreadNotifications = await notifications.getUnread(userId);
//     const readNotifications = await notifications.getRead(userId);

//     const feed = { unreadNotifications, readNotifications };

//     // I moved this line from outside this function to inside
//     io.sockets.in(userId).emit('notificationsFeed', feed);
//   } catch (err) {
//     console.log('err', err);
//   }
// };

// const sendNotificationsFeed = async (socket, userId, io) => {
//   //  here the same as before, I deleted the emit code
//   generateFeed(userId, io);
// };

// const notifyGroupPage = (socket, data) => {
//   // generate room name
//   const roomName = `${data.workspace}_${data.group}`;

//   // broadcast new post to group activity page
//   socket.broadcast.to(roomName).emit('newPostOnGroup', data);
// };

// const notifyRelatedUsers = async (io, socket, data) => {
//   try {
//     let post;
//     let comment;
//     // we had a problem that the flow got interrupted because of the db search
//     //  by adding type property (at the moment post or comment) to data  we can specify which database to search through
//     if (data.type === 'post') {
//       post = await Post.findById(data.postId).lean();

//       // If there are mentions on post content...
//       if (post._content_mentions.length !== 0) {
//         // ...emit notificationsFeed for every user mentioned
//         //  generateFeed seems to always be followed by emitting it to the specified user, so I placed the socket.emit function inside the generateFeed function
//         //  this way I wouldn't put an await inside a for function
//         //  proposal: we might want to change name generateFeed to generateFeedAndEmitToUser
//         for (const userId of post._content_mentions) {
//           generateFeed(userId, io);
//         }
//       }

//       // If there are followers on post content...
//       if (post._followers && post._followers.length !== 0) {
//         // ...emit notificationsFeed for every follower
//         for (const userId of post._followers) {
//           generateFeed(userId, io);
//         }
//       }

//       // If there are followers on post content...
//       if (post._followers && post._followers.length !== 0) {
//         // ...emit notificationsFeed for every follower
//         for (const userId of post._followers) {
//           generateFeed(userId, io);
//         }
//       }

//       switch (post.type) {
//         //  task posts have only one assigned member so generatefeed needs to only be called once
//         case 'task':
//           if (post.task._assigned_to.length !== 0) {
//             generateFeed(post.task._assigned_to, io);
//           }
//           break;
//         case 'event':
//           if (post.event._assigned_to.length !== 0) {
//             for (const userId of post.event._assigned_to) {
//               generateFeed(userId, io);
//             }
//           }
//           break;
//         default:
//             // do nothing!
//       }
//     //  if we mentioned someone in a comment we trigger this part
//     //    same process, we generate the feed and emit it to the mentioned user, tiggering a notification in real-time
//     } else if (data.type === 'comment') {

//       comment = await Comment.findById(data.commentId).lean();
//       post = await Post.findById(comment._post).lean();
//       if (post._followers && post._followers.length !== 0) {
//         // ...emit notificationsFeed for every follower
//         for (const userId of post._followers) {
//           generateFeed(userId, io);
//         }
//       }
//       // If there are mentions on comments content...
//       if (comment._content_mentions.length !== 0) {

//         // ...emit notificationsFeed for every user mentioned
//         for (const userId of comment._content_mentions) {
//           generateFeed(userId, io);
//         }
//       }
//     }
//   } catch (err) {
//     return err;
//   }
// };

module.exports = { init };
