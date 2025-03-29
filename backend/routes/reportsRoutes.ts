import { Router } from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware";
import { exportTasksReport, exportUserReport } from "../controllers/reportsController";

const reportRoutes = Router()

// TO EXCEL/PDF
reportRoutes.get('/export/tasks', protect, adminOnly, exportTasksReport) 

// FOR USER-TASK REPORT
reportRoutes.get('/export/users', protect, adminOnly, exportUserReport)


export default reportRoutes