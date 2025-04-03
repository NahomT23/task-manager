import { Request, Response } from "express";
import User from "../models/User";
import Task from "../models/Task";
import moment from "moment";
import { generateUserPdf } from "../services/pdfReportGenerator";
import { generateUserExcel } from "../services/excelReportGenerator";

interface UserReportData {
  name: string;
  email: string;
  taskCount: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  memberSince: string;
  tenure: string;
  taskCompletionRate: string;
  taskStatusByUser: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export const exportUserReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userOrganization = req.user?.organization;
    const exportType = req.query.type || "excel";

    if (!userOrganization) {
      res.status(403).json({ message: "User not part of an organization" });
      return;
    }

    // Get users and tasks for the organization
    const users = await User.find({ organization: userOrganization })
      .select("name email _id createdAt")
      .lean();
    const tasks = await Task.find({ organization: userOrganization }).populate("assignedTo", "name email _id");

    // Create user task map
    const userTaskMap: { [key: string]: UserReportData } = {};

    users.forEach((user) => {
      const memberSinceFormatted = moment(user.createdAt).format("MM/DD/YYYY");

      // Calculate tenure
      const years = moment().diff(moment(user.createdAt), "years");
      const months = moment().diff(moment(user.createdAt), "months") % 12;
      const days = moment().diff(moment(user.createdAt), "days") % 30;

      const tenureParts: string[] = [];
      if (years > 0) {
        tenureParts.push(`${years} year${years > 1 ? "s" : ""}`);
      }
      if (months > 0) {
        tenureParts.push(`${months} month${months > 1 ? "s" : ""}`);
      }
      if (days > 0) {
        tenureParts.push(`${days} day${days > 1 ? "s" : ""}`);
      }
      const tenure = tenureParts.length > 0 ? tenureParts.join(" ") : "0 days";

      userTaskMap[user._id.toString()] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        memberSince: memberSinceFormatted,
        tenure: tenure,
        taskCompletionRate: "0%",
        taskStatusByUser: {
          pending: 0,
          inProgress: 0,
          completed: 0,
        }
      };
    });

    // Process tasks
    tasks.forEach((task) => {
      const assignedUsers = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo ? [task.assignedTo] : [];

      assignedUsers.forEach((assignedUser: any) => {
        const userId = assignedUser._id.toString();
        if (userTaskMap[userId]) {
          userTaskMap[userId].taskCount += 1;
          switch (task.status) {
            case "pending":
              userTaskMap[userId].pendingTasks += 1;
              userTaskMap[userId].taskStatusByUser.pending += 1;
              break;
            case "inProgress":
              userTaskMap[userId].inProgressTasks += 1;
              userTaskMap[userId].taskStatusByUser.inProgress += 1;
              break;
            case "completed":
              userTaskMap[userId].completedTasks += 1;
              userTaskMap[userId].taskStatusByUser.completed += 1;
              break;
          }
        }
      });
    });

    // Calculate Task Completion Rate
    Object.values(userTaskMap).forEach((userData) => {
      const completionRate =
        userData.taskCount > 0
          ? ((userData.completedTasks / userData.taskCount) * 100).toFixed(2) + "%"
          : "0%";
      userData.taskCompletionRate = completionRate;
    });

    const reportData = Object.values(userTaskMap);

    if (exportType === "pdf") {
      const pdfBuffer = await generateUserPdf(reportData);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=user_report.pdf");
      res.send(pdfBuffer);
    } else {
      const excelBuffer = await generateUserExcel(reportData);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=user_report.xlsx");
      res.send(excelBuffer);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error exporting report", error: error.message });
  }
};
