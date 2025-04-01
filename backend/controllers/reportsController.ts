// import { Request, Response } from "express";
// import Task from "../models/Task";
// import excelJS from "exceljs";
// import User from "../models/User";
// import moment from 'moment'


// export const exportTasksReport = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userOrganization = req.user?.organization;

//     if (!userOrganization) {
//       res.status(403).json({ message: "User not part of an organization" });
//       return;
//     }

//     // Get tasks for user's organization
//     const tasks = await Task.find({ organization: userOrganization }).populate("assignedTo", "name email");

//     // Create Excel workbook and worksheet
//     const workbook = new excelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Tasks Report");

//     // Define columns
//     worksheet.columns = [
//       { header: "Task ID", key: "_id", width: 25 },
//       { header: "Title", key: "title", width: 30 },
//       { header: "Description", key: "description", width: 50 },
//       { header: "Priority", key: "priority", width: 15 },
//       { header: "Status", key: "status", width: 20 },
//       { header: "Created On", key: "createdOn", width: 20 },
//       { header: "Due Date", key: "dueDate", width: 20 },
//       { header: "Duration (days)", key: "duration", width: 20 },
//       { header: "Assigned To", key: "assignedTo", width: 30 },
//     ];

//     // Add rows to the worksheet
//     tasks.forEach((task) => {
//       const assignedToArray = Array.isArray(task.assignedTo)
//         ? task.assignedTo
//         : task.assignedTo
//         ? [task.assignedTo]
//         : [];

//       const assignedToStr = assignedToArray
//         .map((user: any) => `${user.name} (${user.email})`)
//         .join(", ") || "Unassigned";

//       // Format dates using Moment.js
//       const createdOnStr = task.createdAt ? moment(task.createdAt).format("MM/DD/YYYY") : "";
//       const dueDateStr = task.dueDate ? moment(task.dueDate).format("MM/DD/YYYY") : "";

//       // Calculate duration
//       let duration = "N/A";
//       if (task.dueDate && task.createdAt) {
//         const diffMs = task.dueDate.getTime() - task.createdAt.getTime();
//         duration = (diffMs / (1000 * 60 * 60 * 24)).toFixed(2);
//       }

//       worksheet.addRow({
//         _id: task._id,
//         title: task.title,
//         description: task.description,
//         priority: task.priority,
//         status: task.status,
//         createdOn: createdOnStr,
//         dueDate: dueDateStr,
//         duration,
//         assignedTo: assignedToStr,
//       });
//     });


//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=tasks_report.xlsx"
//     );


//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error: any) {
//     res.status(500).json({ message: "Error exporting tasks", error: error.message });
//   }
// };

// export const exportUserReport = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userOrganization = req.user?.organization;

//     if (!userOrganization) {
//       res.status(403).json({ message: "User not part of an organization" });
//       return;
//     }

//     // Get users and tasks for the organization
//     const users = await User.find({ organization: userOrganization }).select("name email _id createdAt role status").lean();
//     const tasks = await Task.find({ organization: userOrganization }).populate("assignedTo", "name email _id");

//     // Create user task map
//     const userTaskMap: {
//       [key: string]: {
//         name: string;
//         email: string;
//         taskCount: number;
//         pendingTasks: number;
//         inProgressTasks: number;
//         completedTasks: number;
//         memberSince: string;
//         duration: string;  
//       };
//     } = {};


//     users.forEach((user) => {
//       const memberSinceFormatted = moment(user.createdAt).format("MM/DD/YYYY");
//       const duration = moment().diff(moment(user.createdAt), 'years') + " years " +
//                        moment().diff(moment(user.createdAt), 'months') % 12 + " months " +
//                        moment().diff(moment(user.createdAt), 'days') % 30 + " days";

//       userTaskMap[user._id.toString()] = {
//         name: user.name,
//         email: user.email,
//         taskCount: 0,
//         pendingTasks: 0,
//         inProgressTasks: 0,
//         completedTasks: 0,
//         memberSince: memberSinceFormatted,
//         duration: duration,
//       };
//     });

//     // Process tasks
//     tasks.forEach((task) => {
//       const assignedUsers = Array.isArray(task.assignedTo)
//         ? task.assignedTo
//         : task.assignedTo
//         ? [task.assignedTo]
//         : [];

//       assignedUsers.forEach((assignedUser: any) => {
//         const userId = assignedUser._id.toString();
//         if (userTaskMap[userId]) {
//           userTaskMap[userId].taskCount += 1;
//           switch (task.status) {
//             case "pending":
//               userTaskMap[userId].pendingTasks += 1;
//               break;
//             case "inProgress":
//               userTaskMap[userId].inProgressTasks += 1;
//               break;
//             case "completed":
//               userTaskMap[userId].completedTasks += 1;
//               break;
//           }
//         }
//       });
//     });

//     // Create Excel workbook
//     const workbook = new excelJS.Workbook();
//     const worksheet = workbook.addWorksheet("User Tasks Report");

//     // Define columns
//     worksheet.columns = [
//       { header: "User Name", key: "name", width: 30 },
//       { header: "Email", key: "email", width: 40 },
//       { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
//       { header: "Pending Tasks", key: "pendingTasks", width: 20 },
//       { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
//       { header: "Completed Tasks", key: "completedTasks", width: 20 },
//       { header: "Member since", key: "memberSince", width: 15 },
//       { header: "Duration", key: "duration", width: 30 },
//     ];

//     // Add rows
//     Object.values(userTaskMap).forEach((userData) => {
//       worksheet.addRow(userData);
//     });

//     // Set response headers
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=users_report.xlsx"
//     );

//     // Send Excel file
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error: any) {
//     res.status(500).json({ message: "Error exporting user report", error: error.message });
//   }
// };


import { Request, Response } from "express";
import Task from "../models/Task";
import excelJS from "exceljs";
import moment from 'moment';
import User from "../models/User";


export const exportUserReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userOrganization = req.user?.organization;

    if (!userOrganization) {
      res.status(403).json({ message: "User not part of an organization" });
      return;
    }

    // Get users and tasks for the organization
    const users = await User.find({ organization: userOrganization }).select("name email _id createdAt role status").lean();
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
        memberSince: string;
        duration: string;  
        taskCompletionRate: string;
        taskStatusByUser: {
          pending: number;
          inProgress: number;
          completed: number;
        };
      };
    } = {};

    // Initialize user data
    users.forEach((user) => {
      const memberSinceFormatted = moment(user.createdAt).format("MM/DD/YYYY");
      const duration = moment().diff(moment(user.createdAt), 'years') + " years " +
                       moment().diff(moment(user.createdAt), 'months') % 12 + " months " +
                       moment().diff(moment(user.createdAt), 'days') % 30 + " days";

      userTaskMap[user._id.toString()] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        memberSince: memberSinceFormatted,
        duration: duration,
        taskCompletionRate: '0%', // Initially set to 0%, will calculate later
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

    // Calculate Task Completion Rate for each user
    Object.values(userTaskMap).forEach((userData) => {
      const completionRate = userData.taskCount > 0
        ? ((userData.completedTasks / userData.taskCount) * 100).toFixed(2) + "%"
        : "0%";
      userData.taskCompletionRate = completionRate;
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
      { header: "Member since", key: "memberSince", width: 15 },
      { header: "Duration", key: "duration", width: 30 },
      { header: "Task Completion Rate", key: "taskCompletionRate", width: 25 },
      { header: "Pending", key: "taskStatusByUser_pending", width: 15 },
      { header: "In Progress", key: "taskStatusByUser_inProgress", width: 15 },
      { header: "Completed", key: "taskStatusByUser_completed", width: 15 },
    ];

    // Add rows
    Object.values(userTaskMap).forEach((userData) => {
      worksheet.addRow({
        ...userData,
        taskStatusByUser_pending: userData.taskStatusByUser.pending,
        taskStatusByUser_inProgress: userData.taskStatusByUser.inProgress,
        taskStatusByUser_completed: userData.taskStatusByUser.completed,
      });
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

export const exportTasksReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userOrganization = req.user?.organization;

    if (!userOrganization) {
      res.status(403).json({ message: "User not part of an organization" });
      return;
    }

    // Get tasks for user's organization
    const tasks = await Task.find({ organization: userOrganization }).populate("assignedTo", "name email");

    // Create Excel workbook and worksheet
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    // Define columns
    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Created On", key: "createdOn", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Duration (days)", key: "duration", width: 20 },
      { header: "Assigned To", key: "assignedTo", width: 30 },
      { header: "Overdue", key: "overdue", width: 15 },
    ];

    // Initialize counters for task completion rate and priority distribution
    let totalTasks = tasks.length;
    let completedTasks = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;

    // Add rows to the worksheet
    tasks.forEach((task) => {
      const assignedToArray = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo
        ? [task.assignedTo]
        : [];

      const assignedToStr = assignedToArray
        .map((user: any) => `${user.name} (${user.email})`)
        .join(", ") || "Unassigned";

      // Format dates using Moment.js
      const createdOnStr = task.createdAt ? moment(task.createdAt).format("MM/DD/YYYY") : "";
      const dueDateStr = task.dueDate ? moment(task.dueDate).format("MM/DD/YYYY") : "";

      // Calculate duration
      let duration = "N/A";
      if (task.dueDate && task.createdAt) {
        const diffMs = task.dueDate.getTime() - task.createdAt.getTime();
        duration = (diffMs / (1000 * 60 * 60 * 24)).toFixed(2);
      }

      // Check if the task is overdue
      const overdue = task.dueDate && moment(task.dueDate).isBefore(moment()) && task.status !== "completed" ? "Yes" : "No";

      // Increment task completion and priority counters
      if (task.status === "completed") completedTasks++;
      if (task.priority === "high") highPriority++;
      if (task.priority === "medium") mediumPriority++;
      if (task.priority === "low") lowPriority++;

      worksheet.addRow({
        _id: task._id,
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

    // Task Completion Rate
    const taskCompletionRate = totalTasks > 0
      ? ((completedTasks / totalTasks) * 100).toFixed(2) + "%"
      : "0%";

    // Task Priority Distribution
    const highPriorityPercentage = ((highPriority / totalTasks) * 100).toFixed(2) + "%";
    const mediumPriorityPercentage = ((mediumPriority / totalTasks) * 100).toFixed(2) + "%";
    const lowPriorityPercentage = ((lowPriority / totalTasks) * 100).toFixed(2) + "%";

    // Add task completion and priority distribution summary
    worksheet.addRow({});
    worksheet.addRow({
      title: "Task Completion Rate",
      description: taskCompletionRate,
      assignedTo: "",
    });

    worksheet.addRow({
      title: "Priority Distribution (High)",
      description: highPriorityPercentage,
      assignedTo: "",
    });

    worksheet.addRow({
      title: "Priority Distribution (Medium)",
      description: mediumPriorityPercentage,
      assignedTo: "",
    });

    worksheet.addRow({
      title: "Priority Distribution (Low)",
      description: lowPriorityPercentage,
      assignedTo: "",
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
