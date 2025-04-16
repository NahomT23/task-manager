import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/socketMiddleware';
import { saveMessage } from '../controllers/msgController';
import http from 'http';

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
    });
  });
}
