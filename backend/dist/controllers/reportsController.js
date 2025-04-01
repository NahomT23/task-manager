"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportUserReport = exports.exportTasksReport = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const exceljs_1 = __importDefault(require("exceljs"));
const User_1 = __importDefault(require("../models/User"));
const moment_1 = __importDefault(require("moment"));
const exportTasksReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userOrganization = (_a = req.user) === null || _a === void 0 ? void 0 : _a.organization;
        if (!userOrganization) {
            res.status(403).json({ message: "User not part of an organization" });
            return;
        }
        // Get tasks for user's organization
        const tasks = yield Task_1.default.find({ organization: userOrganization }).populate("assignedTo", "name email");
        // Create Excel workbook and worksheet
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");
        // Define columns, including new columns
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
        ];
        // Add rows to the worksheet
        tasks.forEach((task) => {
            const assignedToArray = Array.isArray(task.assignedTo)
                ? task.assignedTo
                : task.assignedTo
                    ? [task.assignedTo]
                    : [];
            const assignedToStr = assignedToArray
                .map((user) => `${user.name} (${user.email})`)
                .join(", ") || "Unassigned";
            // Format dates using Moment.js
            const createdOnStr = task.createdAt ? (0, moment_1.default)(task.createdAt).format("MM/DD/YYYY") : "";
            const dueDateStr = task.dueDate ? (0, moment_1.default)(task.dueDate).format("MM/DD/YYYY") : "";
            // Calculate duration
            let duration = "N/A";
            if (task.dueDate && task.createdAt) {
                const diffMs = task.dueDate.getTime() - task.createdAt.getTime();
                duration = (diffMs / (1000 * 60 * 60 * 24)).toFixed(2);
            }
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
            });
        });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=tasks_report.xlsx");
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        res.status(500).json({ message: "Error exporting tasks", error: error.message });
    }
});
exports.exportTasksReport = exportTasksReport;
const exportUserReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userOrganization = (_a = req.user) === null || _a === void 0 ? void 0 : _a.organization;
        if (!userOrganization) {
            res.status(403).json({ message: "User not part of an organization" });
            return;
        }
        // Get users and tasks for the organization
        const users = yield User_1.default.find({ organization: userOrganization }).select("name email _id").lean();
        const tasks = yield Task_1.default.find({ organization: userOrganization }).populate("assignedTo", "name email _id");
        // Create user task map
        const userTaskMap = {};
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
            assignedUsers.forEach((assignedUser) => {
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
        const workbook = new exceljs_1.default.Workbook();
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
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=users_report.xlsx");
        // Send Excel file
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        res.status(500).json({ message: "Error exporting user report", error: error.message });
    }
});
exports.exportUserReport = exportUserReport;
