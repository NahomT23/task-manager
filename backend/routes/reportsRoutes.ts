import { Router } from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware";

import { exportUserReport } from "../controllers/UserReportController";
import { exportTaskReport, exportUserTaskReport } from "../controllers/taskReportController";

const reportRoutes = Router()

// FOR TASK -REPORT
reportRoutes.get('/export/tasks', protect, adminOnly, exportTaskReport) 

// FOR USER-TASK REPORT
reportRoutes.get('/export/users', protect, adminOnly, exportUserReport)

// USERS-TASK REPORT
reportRoutes.get('/export/user-tasks', protect, exportUserTaskReport);


export default reportRoutes