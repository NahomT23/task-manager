import excelJS from "exceljs";
import moment from "moment";
import { formatDuration } from "../utils/utils";

export const generateTaskExcel = async (tasks: any[]): Promise<Buffer> => {
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

  tasks.forEach((task) => {
    const assignedToArray = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : task.assignedTo ? [task.assignedTo] : [];
    const assignedToStr = assignedToArray
      .map((user: any) => `${user.name} (${user.email})`)
      .join(", ") || "Unassigned";

    const createdOnStr = task.createdAt ? moment(task.createdAt).format("MM/DD/YYYY") : "";
    const dueDateStr = task.dueDate ? moment(task.dueDate).format("MM/DD/YYYY") : "";

    let duration = "N/A";
    if (task.createdAt && task.dueDate) {
      const diffMs = task.dueDate.getTime() - task.createdAt.getTime();
      const durationDays = diffMs / (1000 * 60 * 60 * 24);
      duration = formatDuration(durationDays);
    }

    const overdue = task.dueDate && moment(task.dueDate).isBefore(moment()) && task.status !== "completed" ? "Yes" : "No";

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

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;  // Explicitly cast the buffer type here
};

export const generateUserExcel = async (reportData: any[]): Promise<Buffer> => {
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
    { header: "Tenure", key: "tenure", width: 30 },
    { header: "Completion Rate", key: "taskCompletionRate", width: 25 },
  ];

  reportData.forEach((userData) => {
    worksheet.addRow({
      ...userData,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;  // Explicitly cast the buffer type here
};
