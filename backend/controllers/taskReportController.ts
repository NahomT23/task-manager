import { Request, Response } from "express";
import Task from "../models/Task";
import { generateTaskPdf } from "../services/pdfReportGenerator";
import { generateTaskExcel } from "../services/excelReportGenerator";

export const exportTaskReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userOrganization = req.user?.organization;
    const exportType = req.query.type || "excel";

    if (!userOrganization) {
      res.status(403).json({ message: "User not part of an organization" });
      return;
    }

    const tasks = await Task.find({ organization: userOrganization }).populate("assignedTo", "name email");

    if (exportType === "pdf") {
      const pdfBuffer = await generateTaskPdf(tasks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=tasks_report.pdf");
      res.send(pdfBuffer);
    } else {
      const excelBuffer = await generateTaskExcel(tasks);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=tasks_report.xlsx");
      res.send(excelBuffer);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error exporting tasks", error: error.message });
  }
};
