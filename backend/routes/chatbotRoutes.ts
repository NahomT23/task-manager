import { Router } from 'express'
import { adminOnly,  protect } from '../middlewares/authMiddleware';
import { chatbot  } from '../controllers/chatbotController';

const chatbotRoute = Router()

chatbotRoute.post('/chat', protect, adminOnly, chatbot)

export default chatbotRoute