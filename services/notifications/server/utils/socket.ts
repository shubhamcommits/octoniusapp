import { helperFunctions } from '.';
import { NotificationsService } from '../api/service/notification.service';

// Creating notification service class
const notifications = new NotificationsService();

// Maintains the count of all the connected users
const globalConnections = [];

function init(server: any) {

    const io: any = require('socket.io')(server, {cors: '*:*'});

    /* =================
     * - NOTIFICATIONS -
     * =================
     */
    // Allowing all the origins to connect
    // io.set('origins', '*:*');
    
    
    try {
        // Initiate the connection
        io.sockets.on('connection', (socket: any) => {
        
            // Push the socket into the array
            globalConnections.push(socket);

            // -| USER NOTIFICATION CENTER |-

            // Join user on private user room
            socket.on('joinUser', (userId: string) => {
                socket.join(userId);
            });

            // User Role Socket 
            socket.on('userData', (userId: string, userData: Object) => {
                
                // Emit socket with 
                io.sockets.in(userId).emit('userDataUpdate', userData);
            });

            // Get notifications based on the userId
            socket.on('getNotifications', async (userId: string) => {
                // Send notification to the user
                await helperFunctions.sendNotificationsFeed(socket, userId, io);
            });

            // Mark the unreadNotifications as read
            socket.on('markRead', async (topListId: string, userId: string) => {
                
                // Mark the notification as read
                await notifications.markRead(topListId);
            });

            /* =================
            * - WORKSPACE DATA -
            * =================
            */

            //  Joins the user to the workspace room
            socket.on("joinWorkspace", async (workspaceData: any) => {
                // Create the room name
                const roomName = `${workspaceData.workspace_name}`;

                // Join the workspace room
                socket.join(roomName, ()=>{
                });
                
            });

            // Listen to workspace data change
            socket.on("workspaceData", async (workspaceData: any) => {
                
                // Create the room name
                const roomName = `${workspaceData.workspace_name}`;

                // Send the update to all the members in the room
                socket.broadcast.to(roomName).emit("workspaceDataUpdate", workspaceData);
            });

            // -| GROUP ACTIVITY ROOM |-

            // Join user on specific group room
            socket.on('joinGroup', (room) => {
                // generate room name
                
                const roomName = `${room.workspace}_${room.group}`;

                // join room
                socket.join(roomName, ()=>{
                });
            });

            // -| POSTS NOTIFICATIONS |-

            // Listen to user likes who follows a post
            socket.on('userLiked', (data) => {
            });

            // Listen to new post creation
            socket.on('postAdded', async (data) => {
                const roomName = `${data.workspace}_${data.group}`;
                // Broadcast add event to group

                // Notify the related users
                await helperFunctions.notifyRelatedUsers(io, socket, data)

                socket.broadcast.to(roomName).emit('postAddedInGroup', data);
            });

            socket.on('postDeleted', (data) => {
                const roomName = `${data.workspace}_${data.group}`;
                // Broadcast delete event to group
                socket.broadcast.to(roomName).emit('postDeletedInGroup', data);
            });

            socket.on('postEdited', (data) => {
                const roomName = `${data.workspace}_${data.group}`;
                // Broadcast edit event to group
                socket.broadcast.to(roomName).emit('postEditedInGroup', data);
            });

            // -| APP NOTIFICATIONS |-

            socket.on('join-app', (room) => {
                // Broadcast edit event to user
                socket.join('user_' + room);
            });

            socket.on('leave-app', (room) => {
                // Broadcast edit event to user
                socket.leave('user_' + room);
            });

            socket.on('join', (payload) => {
                const roomId = payload.room
                const roomClients = io.sockets.adapter.rooms.get(roomId) || { size: 0 }
                const numberOfClients = roomClients.size
                console.log(`Room ID: ${roomId}`)
                console.log(`roomClients: ${roomClients}`)
                console.log(`numberOfClients of ${roomId}: ${numberOfClients}`)
                // These events are emitted only to the sender socket.
                if (numberOfClients == 0) {
                    console.log(`Creating room ${roomId} and emitting room_created socket event`)
                    socket.join(roomId)
                    socket.emit('room_created', {
                        roomId: roomId,
                        peerId: socket.id
                    })
                } else {
                    console.log(`Joining room ${roomId} and emitting room_joined socket event`)
                    socket.join(roomId)
                    socket.emit('room_joined', {
                        roomId: roomId,
                        peerId: socket.id
                    })
                } 
            })

            // These events are emitted to all the sockets connected to the same room except the sender.
            socket.on('start_call', (event) => {
console.log(event);
                console.log(`Broadcasting start_call event to peers in room ${event.roomId} from peer ${event.senderId}`)
                socket.broadcast.to(event.roomId).emit('start_call', {
                senderId: event.senderId
            })})

            //Events emitted to only one peer
            socket.on('webrtc_offer', (event) => {
                console.log(`Sending webrtc_offer event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
                socket.broadcast.to(event.receiverId).emit('webrtc_offer', {
                sdp: event.sdp,
                senderId: event.senderId
            })})

            socket.on('webrtc_answer', (event) => {
                console.log(`Sending webrtc_answer event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
                socket.broadcast.to(event.receiverId).emit('webrtc_answer', {
                sdp: event.sdp,
                senderId: event.senderId
            })})

            socket.on('webrtc_ice_candidate', (event) => {
                console.log(`Sending webrtc_ice_candidate event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
                socket.broadcast.to(event.receiverId).emit('webrtc_ice_candidate', event)
            })

            socket.on('disconnect', () => {
                // Remove the socket from globalConnection array
                globalConnections.splice(globalConnections.indexOf(socket), 1);
            });
        });
        return io;
    } catch (error) {
        console.log("Socket server error",error);
    }
};

export {
    init
}