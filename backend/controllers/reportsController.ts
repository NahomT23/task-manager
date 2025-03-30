import { Request, Response } from "express";
import Task from "../models/Task";
import excelJS from "exceljs";
import User from "../models/User";

export const exportTasksReport = async (req: Request, res: Response): Promise<void> => {
  try {
 
    const userOrganization = req.user?.organization;

    if (!userOrganization) {
      res.status(403).json({ message: "User not part of an organization" });
      return;
    }

    // Get tasks for user's organization
    const tasks = await Task.find({ organization: userOrganization }).populate("assignedTo", "name email");

    // Create Excel workbook
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    // Define columns
    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned To", key: "assignedTo", width: 30 },
    ];

    // Add rows
    tasks.forEach((task) => {
      const assignedToArray = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo
        ? [task.assignedTo]
        : [];
      
      const assignedToStr = assignedToArray
        .map((user: any) => `${user.name} (${user.email})`)
        .join(", ") || "Unassigned";

      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.toISOString() : "",
        assignedTo: assignedToStr,
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tasks_report.xlsx"
    );

    // Send Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    res.status(500).json({ message: "Error exporting tasks", error: error.message });
  }
};

export const exportUserReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userOrganization = req.user?.organization;

    if (!userOrganization) {
      res.status(403).json({ message: "User not part of an organization" });
      return;
    }

    // Get users and tasks for the organization
    const users = await User.find({ organization: userOrganization }).select("name email _id").lean();
    const tasks = await Task.find({ organization: userOrganization }).populate("assignedTo", "name email _id");

    // Create user task map
    const userTaskMap: {
      [key: string]: {
        name: string;
        email: string;
        taskCount: number;
        pendingTasks: number;
        inProgressTasks: number;
        completedTasks: number;
      };
    } = {};

    // Initialize user data
    users.forEach((user) => {
      userTaskMap[user._id.toString()] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    // Process tasks
    tasks.forEach((task) => {
      const assignedUsers = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo
        ? [task.assignedTo]
        : [];

      assignedUsers.forEach((assignedUser: any) => {
        const userId = assignedUser._id.toString();
        if (userTaskMap[userId]) {
          userTaskMap[userId].taskCount += 1;
          switch (task.status) {
            case "pending":
              userTaskMap[userId].pendingTasks += 1;
              break;
            case "inProgress":
              userTaskMap[userId].inProgressTasks += 1;
              break;
            case "completed":
              userTaskMap[userId].completedTasks += 1;
              break;
          }
        }
      });
    });

    // Create Excel workbook
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Tasks Report");

    // Define columns
    worksheet.columns = [
      { header: "User Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 40 },
      { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
      { header: "Pending Tasks", key: "pendingTasks", width: 20 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];

    // Add rows
    Object.values(userTaskMap).forEach((userData) => {
      worksheet.addRow(userData);
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users_report.xlsx"
    );

    // Send Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    res.status(500).json({ message: "Error exporting user report", error: error.message });
  }
};