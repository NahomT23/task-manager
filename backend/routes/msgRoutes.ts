import { Router } from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { getMessages, clearMessages } from '../controllers/msgController';

const msgRoute = Router();

msgRoute.get('/', protect, getMessages);
msgRoute.delete('/', protect, adminOnly, clearMessages);
export default msgRoute;
