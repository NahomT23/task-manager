"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const UserReportController_1 = require("../controllers/UserReportController");
const taskReportController_1 = require("../controllers/taskReportController");
const reportRoutes = (0, express_1.Router)();
// FOR TASK -REPORT
reportRoutes.get('/export/tasks', authMiddleware_1.protect, authMiddleware_1.adminOnly, taskReportController_1.exportTaskReport);
// FOR USER-TASK REPORT
reportRoutes.get('/export/users', authMiddleware_1.protect, authMiddleware_1.adminOnly, UserReportController_1.exportUserReport);
// USERS-TASK REPORT
reportRoutes.get('/export/user-tasks', authMiddleware_1.protect, taskReportController_1.exportUserTaskReport);
exports.default = reportRoutes;
