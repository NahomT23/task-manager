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
  
    const orgId = user.organization.toString(); 
    console.log(`User ${user._id} joining room ${orgId}`);
  
    socket.join(orgId);
  
    onlineUsers[user._id] = (onlineUsers[user._id] || 0) + 1;
    io.to(orgId).emit('updateOnlineStatus', onlineUsers);
  
    socket.on('sendMessage', async (messageText: string) => {
      try {
        const populatedMessage = await saveMessage(messageText, user._id, orgId);
        io.to(orgId).emit('newMessage', populatedMessage); 
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });
  
    socket.on('disconnect', () => {
      onlineUsers[user._id] = (onlineUsers[user._id] || 1) - 1;
      if (onlineUsers[user._id] <= 0) delete onlineUsers[user._id];
      io.to(orgId).emit('updateOnlineStatus', onlineUsers);
    });
  });
}
