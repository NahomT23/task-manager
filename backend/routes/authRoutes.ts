import { Router } from 'express';
import { getUserProfile, signin, signup, updateUserProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';
import { authLimiter, uploadLimiter } from '../middlewares/rateLimitMiddleware';

const authRoutes = Router();

authRoutes.post("/sign-up", authLimiter, uploadLimiter, upload.single("image"), signup);
authRoutes.post("/sign-in", authLimiter, signin);
authRoutes.get("/profile", protect, getUserProfile);
authRoutes.put("/profile", uploadLimiter, protect, upload.single("image"), updateUserProfile);

export default authRoutes;
