import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/socketMiddleware';
import { saveMessage } from '../controllers/msgController';
import http from 'http';

const onlineUsers: { [userId: string]: number } = {};

export function initializeSocket(server: http.Server): void {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (!user) {
      console.error("Socket connected without user data");
      return;
    }

    const orgId = user.organization;
    console.log(`User ${user._id} connected and joining organization ${orgId}`);

    socket.join(orgId);

    // Mark user as online (increment the count)
    onlineUsers[user._id] = (onlineUsers[user._id] || 0) + 1;
    // Broadcast updated online status to everyone in the organization room
    io.to(orgId).emit('updateOnlineStatus', onlineUsers);

    socket.on('sendMessage', async (messageText: string) => {
      console.log(`Received message from user ${user._id}: ${messageText}`);
      try {
        const populatedMessage = await saveMessage(messageText, user._id, orgId);
        io.to(orgId).emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${user._id} disconnected`);
      // Decrement the count – if no sockets remain, remove the user from the online list
      onlineUsers[user._id] = (onlineUsers[user._id] || 1) - 1;
      if (onlineUsers[user._id] <= 0) {
        delete onlineUsers[user._id];
      }
      io.to(orgId).emit('updateOnlineStatus', onlineUsers);
    });
  


});
}
