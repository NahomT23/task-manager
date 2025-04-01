import { Router } from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware";

import { exportUserReport } from "../controllers/UserReportController";
import { exportTaskReport } from "../controllers/taskReportController";

const reportRoutes = Router()

// TO EXCEL/PDF
reportRoutes.get('/export/tasks', protect, adminOnly, exportTaskReport) 

// FOR USER-TASK REPORT
reportRoutes.get('/export/users', protect, adminOnly, exportUserReport)


export default reportRoutes