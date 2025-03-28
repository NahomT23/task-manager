import { Router } from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware";
import { deleteUser, getUserById, getUsers } from "../controllers/userController";

const userRoutes = Router()

userRoutes.get('/', protect, adminOnly, getUsers)
userRoutes.get('/:id', protect, adminOnly, getUserById)
userRoutes.delete('/:id', protect, adminOnly, deleteUser)


export default userRoutes