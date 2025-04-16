import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getMessages } from '../controllers/msgController';


const msgRoute = Router();

msgRoute.get('/', protect, getMessages);

export default msgRoute;
