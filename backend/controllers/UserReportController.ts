import { Request, Response } from "express";
import Task from "../models/Task";
import excelJS from "exceljs";
import moment from "moment";
import pdfMake from "pdfmake/build/pdfmake";
import User from "../models/User";
import pdfFonts from "pdfmake/build/vfs_fonts";


pdfMake.vfs = pdfFonts.vfs;

interface UserReportData {
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
      .select("name email _id createdAt role status")
      .lean();
    const tasks = await Task.find({ organization: userOrganization }).populate("assignedTo", "name email _id");

    // Create user task map
    const userTaskMap: { [key: string]: UserReportData } = {};

    // Initialize user data
    users.forEach((user) => {
      const memberSinceFormatted = moment(user.createdAt).format("MM/DD/YYYY");
      const duration =
        moment().diff(moment(user.createdAt), "years") +
        " years " +
        (moment().diff(moment(user.createdAt), "months") % 12) +
        " months " +
        (moment().diff(moment(user.createdAt), "days") % 30) +
        " days";

      userTaskMap[user._id.toString()] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        memberSince: memberSinceFormatted,
        duration: duration,
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
       
        
        const docDefinition: any = {
            pageOrientation: "landscape", // Set the PDF to landscape mode
            content: [
              { text: "User Report", style: "header" },
              {
                table: {
                  headerRows: 1,
                  widths: [
                    "*", 
                    "*", 
                    "auto", 
                    "auto", 
                    "auto", 
                    "auto", 
                    "auto", 
                    150,    
                    "auto", 
                  ],
                  body: [
                    [
                      "Name",
                      "Email",
                      "Total Tasks",
                      "Pending Tasks",
                      "In Progress Tasks",
                      "Completed Tasks",
                      "Member Since",
                      "Duration",
                      "Completion Rate",
                    ],
                    ...reportData.map((user) => [
                      user.name,
                      user.email,
                      user.taskCount,
                      user.pendingTasks,
                      user.inProgressTasks,
                      user.completedTasks,
                      user.memberSince,
                      { text: user.duration, noWrap: false }, 
                      user.taskCompletionRate,

                    ])
                  ]
                }
              }
            ],
            styles: {
              header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
              }
            },
            defaultStyle: {
              font: "Roboto"
            }
          };
          
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer: ArrayBuffer) => {
            const pdfBuffer = Buffer.from(buffer);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=user_report.pdf");
            res.send(pdfBuffer);
          });
      }
          else {
      // Excel Generation
      // const workbook = new excelJS.Workbook();
      // const worksheet = workbook.addWorksheet("User Tasks Report");

      const workbook = new excelJS.Workbook();
const worksheet = workbook.addWorksheet("User Tasks Report");

      worksheet.columns = [
        { header: "User Name", key: "name", width: 30 },
        { header: "Email", key: "email", width: 40 },
        { header: "Total Tasks", key: "taskCount", width: 20 },
        { header: "Pending", key: "pendingTasks", width: 20 },
        { header: "In Progress", key: "inProgressTasks", width: 20 },
        { header: "Completed", key: "completedTasks", width: 20 },
        { header: "Member Since", key: "memberSince", width: 15 },
        { header: "Duration", key: "duration", width: 30 },
        { header: "Completion Rate", key: "taskCompletionRate", width: 25 },
      ];

      reportData.forEach((userData) => {
        worksheet.addRow({
          ...userData,
          taskStatusByUser_pending: userData.taskStatusByUser.pending,
          taskStatusByUser_inProgress: userData.taskStatusByUser.inProgress,
          taskStatusByUser_completed: userData.taskStatusByUser.completed
        });
      });

      
res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
res.setHeader(
  "Content-Disposition",
  "attachment; filename=user_report.xlsx"
);

await workbook.xlsx.write(res);

    }
  } catch (error: any) {
    res.status(500).json({ message: "Error exporting report", error: error.message });
  }
};
