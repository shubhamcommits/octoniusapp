import { helperFunctions } from '.';
import { NotificationsService } from '../api/service/notification.service';

// Creating notification service class
const notifications = new NotificationsService();

// Maintains the count of all the connected users
const globalConnections = [];

function init(server: any){

    const io: any = require('socket.io')(server,{cors: '*:*'});

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

        console.log("connected...... ",socket)
        // Join user on private user room
        socket.on('joinUser', (userId: string) => {
            // join room
            console.log("joinUser");
            socket.join(userId);
        });

        // User Role Socket 
        socket.on('userData', (userId: string, userData: Object) => {
            
            // Emit socket with 
            io.sockets.in(userId).emit('userDataUpdate', userData);
        });

        // Get notifications based on the userId
        socket.on('getNotifications', async (userId: string) => {
            console.log("getting data");
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
            console.log("joinWorkspace");
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
            console.log("joinGroup");
            
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