import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { configDotenv } from 'dotenv';
import connectToDB from './config/db';

import msgRoute from './routes/msgRoutes';
import authRoutes from './routes/authRoutes';
import orgRoutes from './routes/organizationRoutes';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import reportRoutes from './routes/reportsRoutes';
import chatbotRoute from './routes/chatbotRoutes';

import { apiLimiter, chatbotLimiter, uploadLimiter } from './middlewares/rateLimitMiddleware';
import { initializeSocket } from './config/socket';


configDotenv();

const PORT = process.env.PORT || 3000;
const app = express();

app.set('trust proxy', 1);


// app.use(cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
// }));


// app.options('*', cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true
// }));

// Middlewares
app.use(mongoSanitize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/org', apiLimiter, orgRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/tasks', apiLimiter, taskRoutes);
app.use('/api/reports', apiLimiter, reportRoutes);
app.use('/api/bot', chatbotLimiter, chatbotRoute);
app.use('/api/messages', msgRoute);


const server = http.createServer(app);
initializeSocket(server);

connectToDB();
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
