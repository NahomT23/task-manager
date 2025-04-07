import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import express from 'express'
import { configDotenv } from 'dotenv'; 
import connectToDB from './config/db';
import helmet from 'helmet';;
import authRoutes from './routes/authRoutes';
import orgRoutes from './routes/organizationRoutes';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import reportRoutes from './routes/reportsRoutes';
import { apiLimiter, authLimiter, chatbotLimiter, uploadLimiter } from './middlewares/rateLimitMiddleware';
import chatbotRoute from './routes/chatbotRoutes';
configDotenv();

const PORT = process.env.PORT || 3000
const app = express()

app.set('trust proxy', 1)

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  }))
  

  app.options('*', cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  }));



app.use(mongoSanitize())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/uploads', uploadLimiter, express.static('uploads'));
app.use(helmet())



app.use('/api/auth', authRoutes)
app.use('/api/org', apiLimiter, orgRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/tasks', apiLimiter, taskRoutes);
app.use('/api/reports', apiLimiter, reportRoutes);
app.use('/api/bot', chatbotLimiter, chatbotRoute)


connectToDB()

app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`)
    
})