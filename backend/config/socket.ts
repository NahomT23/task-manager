import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/socketMiddleware';
import Message from '../models/Message';
import http from 'http'

export function initializeSocket(server: http.Server): void {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.use(authenticateSocket);

  // Listen for client connections
  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (!user) {
      console.error("Socket connected without user data");
      return;
    }
    
    const orgId = user.organization;
    console.log(`User ${user._id} connected and joining organization ${orgId}`);
    
    // Join the organization room
    socket.join(orgId);

    // Listen for sendMessage events from the client
    socket.on('sendMessage', async (messageText: string) => {
      console.log(`Received message from user ${user._id}: ${messageText}`);
      try {

        const message = new Message({
          text: messageText,
          sender: user._id,
          organization: orgId,
        });


        await message.save();


        const populatedMessage = await message.populate({
          path: 'sender',
          select: 'name profileImageUrl pseudo_name'
        });


        io.to(orgId).emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log(`User ${user._id} disconnected`);
    });
  });
}
