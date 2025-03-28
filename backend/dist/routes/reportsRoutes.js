"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const reportsController_1 = require("../controllers/reportsController");
const reportRoutes = (0, express_1.Router)();
// TO EXCEL/PDF
reportRoutes.get('/export/tasks', authMiddleware_1.protect, authMiddleware_1.adminOnly, reportsController_1.exportTasksReport);
// FOR USER-TASK REPORT
reportRoutes.get('/export/tasks', authMiddleware_1.protect, authMiddleware_1.adminOnly, reportsController_1.exportUserReport);
exports.default = reportRoutes;
