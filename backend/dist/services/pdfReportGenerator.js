"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserPdf = exports.generateTaskPdf = void 0;
const pdfmake_1 = __importDefault(require("pdfmake/build/pdfmake"));
const vfs_fonts_1 = __importDefault(require("pdfmake/build/vfs_fonts"));
const moment_1 = __importDefault(require("moment"));
pdfmake_1.default.vfs = vfs_fonts_1.default.vfs;
const generateTaskPdf = (tasks) => {
    return new Promise((resolve, reject) => {
        const tableBody = [
            ["Title", "Description", "Priority", "Status", "Created On", "Due Date", "Assigned To", "Overdue"]
        ];
        tasks.forEach((task) => {
            var _a, _b;
            const assignedToArray = Array.isArray(task.assignedTo)
                ? task.assignedTo
                : task.assignedTo ? [task.assignedTo] : [];
            const assignedToStr = assignedToArray
                .map((user) => `${user.name} (${user.email})`)
                .join(", ") || "Unassigned";
            const createdOnStr = task.createdAt ? (0, moment_1.default)(task.createdAt).format("MM/DD/YYYY") : "";
            const dueDateStr = task.dueDate ? (0, moment_1.default)(task.dueDate).format("MM/DD/YYYY") : "";
            const overdue = task.dueDate && (0, moment_1.default)(task.dueDate).isBefore((0, moment_1.default)()) && task.status !== "completed" ? "Yes" : "No";
            tableBody.push([
                task.title || "No Title",
                task.description || "No Description",
                (_a = task.priority) !== null && _a !== void 0 ? _a : "N/A",
                (_b = task.status) !== null && _b !== void 0 ? _b : "N/A",
                createdOnStr,
                dueDateStr,
                assignedToStr,
                overdue,
            ]);
        });
        const docDefinition = {
            pageOrientation: "landscape",
            content: [
                { text: "Tasks Report", style: "header" },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "auto", "auto", "auto", "auto", "*", 60],
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
        const pdfDoc = pdfmake_1.default.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => {
            resolve(Buffer.from(buffer));
        });
    });
};
exports.generateTaskPdf = generateTaskPdf;
const generateUserPdf = (reportData) => {
    return new Promise((resolve, reject) => {
        const docDefinition = {
            pageOrientation: "landscape",
            content: [
                { text: "User Report", style: "header" },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "auto", "auto", "auto", "auto", "auto", 80, 50],
                        body: [
                            [
                                "Name",
                                "Email",
                                "Total Tasks",
                                "Pending Tasks",
                                "In Progress Tasks",
                                "Completed Tasks",
                                "Member Since",
                                "Tenure",
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
                                { text: user.tenure, noWrap: false },
                                { text: user.taskCompletionRate, noWrap: false },
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
        const pdfDoc = pdfmake_1.default.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => {
            resolve(Buffer.from(buffer));
        });
    });
};
exports.generateUserPdf = generateUserPdf;
