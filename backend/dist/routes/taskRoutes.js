"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const taskController_1 = require("../controllers/taskController");
const taskRoutes = (0, express_1.Router)();
taskRoutes.get('/dashboard-data', authMiddleware_1.protect, authMiddleware_1.adminOnly, taskController_1.getDashboardData);
taskRoutes.get('/user-dashboard-data', authMiddleware_1.protect, taskController_1.getUserDashboardData);
taskRoutes.get('/my-tasks', authMiddleware_1.protect, taskController_1.getMyTasks);
taskRoutes.get('/', authMiddleware_1.protect, taskController_1.getTasks);
taskRoutes.get('/:id', authMiddleware_1.protect, taskController_1.getTasksById);
taskRoutes.post('/', authMiddleware_1.protect, authMiddleware_1.adminOnly, taskController_1.createTask);
taskRoutes.put('/:id', authMiddleware_1.protect, taskController_1.updateTask);
taskRoutes.delete('/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, taskController_1.deleteTask);
taskRoutes.put('/:id/status', authMiddleware_1.protect, taskController_1.updateTaskStatus);
taskRoutes.put('/:id/todo', authMiddleware_1.protect, taskController_1.updateTaskCheckList);
exports.default = taskRoutes;
