import { Router, Request, Response } from 'express';
import { getUserProfile, signin, signup, updateUserProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const authRoutes = Router();


authRoutes.post("/sign-up", upload.single("image"), signup);
authRoutes.post("/sign-in", signin);
authRoutes.get("/profile", protect, getUserProfile);
authRoutes.put("/profile", protect, updateUserProfile);



export default authRoutes;
