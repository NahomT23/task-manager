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
exports.generateUserExcel = exports.generateTaskExcel = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const moment_1 = __importDefault(require("moment"));
const utils_1 = require("../utils/utils");
const generateTaskExcel = (tasks) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
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
            .map((user) => `${user.name} (${user.email})`)
            .join(", ") || "Unassigned";
        const createdOnStr = task.createdAt ? (0, moment_1.default)(task.createdAt).format("MM/DD/YYYY") : "";
        const dueDateStr = task.dueDate ? (0, moment_1.default)(task.dueDate).format("MM/DD/YYYY") : "";
        let duration = "N/A";
        if (task.createdAt && task.dueDate) {
            const diffMs = task.dueDate.getTime() - task.createdAt.getTime();
            const durationDays = diffMs / (1000 * 60 * 60 * 24);
            duration = (0, utils_1.formatDuration)(durationDays);
        }
        const overdue = task.dueDate && (0, moment_1.default)(task.dueDate).isBefore((0, moment_1.default)()) && task.status !== "completed" ? "Yes" : "No";
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
    const buffer = yield workbook.xlsx.writeBuffer();
    return buffer; // Explicitly cast the buffer type here
});
exports.generateTaskExcel = generateTaskExcel;
const generateUserExcel = (reportData) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
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
        worksheet.addRow(Object.assign({}, userData));
    });
    const buffer = yield workbook.xlsx.writeBuffer();
    return buffer; // Explicitly cast the buffer type here
});
exports.generateUserExcel = generateUserExcel;
