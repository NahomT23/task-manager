import { Router } from 'express'
import { adminOnly, protect } from '../middlewares/authMiddleware'
import { createTask, deleteTask, getDashboardData, getTasks, getTasksById, getUserDashboardData, updateTask, updateTaskCheckList, updateTaskStatus } from '../controllers/taskController'


const taskRoutes = Router()

taskRoutes.get('/dashboard-data', protect, getDashboardData)
taskRoutes.get('/user-dashboard-data', protect, getUserDashboardData)
taskRoutes.get('/', protect, getTasks)
taskRoutes.get('/:id', protect, getTasksById)
taskRoutes.post('/', protect, adminOnly, createTask)
taskRoutes.put('/:id', protect, updateTask)
taskRoutes.delete('/:id', protect, deleteTask)
taskRoutes.put('/:id/status', protect, updateTaskStatus)
taskRoutes.put('/:id/todo', protect, updateTaskCheckList)

export default taskRoutes
