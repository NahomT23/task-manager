import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { configDotenv } from 'dotenv';

configDotenv()

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Missing token"));
  }
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await User.findById((decoded as any).id).select('-password');
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }
    socket.data.user = user;
    return next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token"));
  }
};
