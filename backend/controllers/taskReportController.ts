import { Request, Response } from "express";
import Task from "../models/Task";
import excelJS from "exceljs";
import moment from "moment";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

// Enhanced duration formatter with commas and "and"
const formatDuration = (durationDays: number): string => {
  if (durationDays === 0) return "0 days";
  const parts: string[] = [];

  // Calculate components
  const months = Math.floor(durationDays / 30);
  const remainingDays = durationDays % 30;
  const days = Math.floor(remainingDays);
  const hoursDecimal = (remainingDays - days) * 24;
  const hours = Math.floor(hoursDecimal);
  const minutes = Math.round((hoursDecimal - hours) * 60);

  // Add months
  if (months > 0) {
    parts.push(`${months} month${months > 1 ? "s" : ""}`);
  }

  // Add days
  if (days > 0) {
    parts.push(`${days} day${days > 1 ? "s" : ""}`);
  }

  // Add hours
  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  }

  // Add minutes (only for durations <1 day)
  if (minutes > 0 && durationDays < 1) {
    parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  }

  // Handle edge case: duration <1 day with hours and minutes
  if (durationDays < 1) {
    if (hours > 0 && minutes > 0) {
      parts.splice(-2, 2, `${hours} hour${hours > 1 ? "s" : ""}`, `${minutes} minute${minutes > 1 ? "s" : ""}`);
    } else if (hours > 0) {
      parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    } else if (minutes > 0) {
      parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }
  }

  // Join parts with commas and "and"
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(" and ");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
};

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
      const tableBody = [
        ["Title", "Description", "Priority", "Status", "Created On", "Due Date", "Duration", "Assigned To", "Overdue"]
      ];

      tasks.forEach((task) => {
        const assignedToArray = Array.isArray(task.assignedTo)
          ? task.assignedTo
          : task.assignedTo ? [task.assignedTo] : [];
        const assignedToStr = assignedToArray.map((user: any) => `${user.name} (${user.email})`).join(", ") || "Unassigned";

        const createdOnStr = task.createdAt ? moment(task.createdAt).format("MM/DD/YYYY") : "";
        const dueDateStr = task.dueDate ? moment(task.dueDate).format("MM/DD/YYYY") : "";

        let duration = "N/A";
        if (task.createdAt && task.dueDate) {
          const diffMs = task.dueDate.getTime() - task.createdAt.getTime();
          const durationDays = diffMs / (1000 * 60 * 60 * 24);
          duration = formatDuration(durationDays);
        }

        const overdue = task.dueDate && moment(task.dueDate).isBefore(moment()) && task.status !== "completed" ? "Yes" : "No";

        tableBody.push([
          task.title || "No Title",
          task.description || "No Description",
          task.priority ?? "N/A",
          task.status ?? "N/A",
          createdOnStr,
          dueDateStr,
          duration,
          assignedToStr,
          overdue,
        ]);
      });

      const docDefinition: any = {
        pageOrientation: "landscape",
        content: [
          { text: "Tasks Report", style: "header" },
          {
            table: {
              headerRows: 1,
              widths: ["*", "*", "auto", "auto", "auto", "auto", "auto", "*", "auto"],
              body: tableBody,
            },
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10],
          },
        },
        defaultStyle: {
          font: "Roboto",
        },
      };

      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=tasks_report.pdf");
        res.send(Buffer.from(buffer));
      });
    } else {
      // Excel Generation: create complete buffer then send it
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Tasks Report");

      worksheet.columns = [
        { header: "Task ID", key: "_id", width: 25 },
        { header: "Title", key: "title", width: 30 },
        { header: "Description", key: "description", width: 50 },
        { header: "Priority", key: "priority", width: 15 },
        { header: "Status", key: "status", width: 20 },
        { header: "Created On", key: "createdOn", width: 20 },
        { header: "Due Date", key: "dueDate", width: 20 },
        { header: "Duration", key: "duration", width: 30 },
        { header: "Assigned To", key: "assignedTo", width: 30 },
        { header: "Overdue", key: "overdue", width: 15 },
      ];

      let totalTasks = tasks.length;
      let completedTasks = 0;
      let highPriority = 0;
      let mediumPriority = 0;
      let lowPriority = 0;

      tasks.forEach((task) => {
        const assignedToArray = Array.isArray(task.assignedTo)
          ? task.assignedTo
          : task.assignedTo ? [task.assignedTo] : [];
        const assignedToStr = assignedToArray.map((user: any) => `${user.name} (${user.email})`).join(", ") || "Unassigned";

        const createdOnStr = task.createdAt ? moment(task.createdAt).format("MM/DD/YYYY") : "";
        const dueDateStr = task.dueDate ? moment(task.dueDate).format("MM/DD/YYYY") : "";

        let duration = "N/A";
        if (task.createdAt && task.dueDate) {
          const diffMs = task.dueDate.getTime() - task.createdAt.getTime();
          const durationDays = diffMs / (1000 * 60 * 60 * 24);
          duration = formatDuration(durationDays);
        }

        const overdue = task.dueDate && moment(task.dueDate).isBefore(moment()) && task.status !== "completed" ? "Yes" : "No";

        if (task.status === "completed") completedTasks++;
        if (task.priority === "high") highPriority++;
        if (task.priority === "medium") mediumPriority++;
        if (task.priority === "low") lowPriority++;

        worksheet.addRow({
          _id: task._id.toString(),
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          createdOn: createdOnStr,
          dueDate: dueDateStr,
          duration,
          assignedTo: assignedToStr,
          overdue,
        });
      });

      // Add summary statistics
      const taskCompletionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) + "%" : "0%";
      const highPriorityPercentage = ((highPriority / totalTasks) * 100).toFixed(2) + "%";
      const mediumPriorityPercentage = ((mediumPriority / totalTasks) * 100).toFixed(2) + "%";
      const lowPriorityPercentage = ((lowPriority / totalTasks) * 100).toFixed(2) + "%";

      worksheet.addRow({});
      worksheet.addRow({ title: "Task Completion Rate", description: taskCompletionRate, assignedTo: "" });
      worksheet.addRow({ title: "Priority Distribution (High)", description: highPriorityPercentage, assignedTo: "" });
      worksheet.addRow({ title: "Priority Distribution (Medium)", description: mediumPriorityPercentage, assignedTo: "" });
      worksheet.addRow({ title: "Priority Distribution (Low)", description: lowPriorityPercentage, assignedTo: "" });

      // Generate the Excel file as a complete buffer
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=tasks_report.xlsx");
      res.send(buffer);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error exporting tasks", error: error.message });
  }
};
