import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import express from 'express'
import { configDotenv } from 'dotenv'; 
import connectToDB from './config/db';
import helmet from 'helmet';
import { RequestHandler } from 'express';
import authRoutes from './routes/authRoutes';
import orgRoutes from './routes/organizationRoutes';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import reportRoutes from './routes/reportsRoutes';
configDotenv();



const PORT = process.env.PORT  || 3000
const app = express()


// MIDDLEWARES

app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders:['Content-Type', 'Authorization']    
}))
app.use(mongoSanitize())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(helmet() as RequestHandler);


// ROUTES

app.use('/api/auth', authRoutes)
app.use('/api/org', orgRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/reports', reportRoutes)


app.get('/', (req, res) => {
    res.send('Hello wworld')
})




app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`)
    connectToDB()
})