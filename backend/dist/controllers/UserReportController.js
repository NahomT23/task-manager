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
exports.exportUserReport = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const exceljs_1 = __importDefault(require("exceljs"));
const moment_1 = __importDefault(require("moment"));
const pdfmake_1 = __importDefault(require("pdfmake/build/pdfmake"));
const User_1 = __importDefault(require("../models/User"));
const vfs_fonts_1 = __importDefault(require("pdfmake/build/vfs_fonts"));
pdfmake_1.default.vfs = vfs_fonts_1.default.vfs;
const exportUserReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userOrganization = (_a = req.user) === null || _a === void 0 ? void 0 : _a.organization;
        const exportType = req.query.type || "excel";
        if (!userOrganization) {
            res.status(403).json({ message: "User not part of an organization" });
            return;
        }
        // Get users and tasks for the organization
        const users = yield User_1.default.find({ organization: userOrganization })
            .select("name email _id createdAt role status")
            .lean();
        const tasks = yield Task_1.default.find({ organization: userOrganization }).populate("assignedTo", "name email _id");
        // Create user task map
        const userTaskMap = {};
        // Initialize user data
        users.forEach((user) => {
            const memberSinceFormatted = (0, moment_1.default)(user.createdAt).format("MM/DD/YYYY");
            const duration = (0, moment_1.default)().diff((0, moment_1.default)(user.createdAt), "years") +
                " years " +
                ((0, moment_1.default)().diff((0, moment_1.default)(user.createdAt), "months") % 12) +
                " months " +
                ((0, moment_1.default)().diff((0, moment_1.default)(user.createdAt), "days") % 30) +
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
            assignedUsers.forEach((assignedUser) => {
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
            const completionRate = userData.taskCount > 0
                ? ((userData.completedTasks / userData.taskCount) * 100).toFixed(2) + "%"
                : "0%";
            userData.taskCompletionRate = completionRate;
        });
        const reportData = Object.values(userTaskMap);
        if (exportType === "pdf") {
            const docDefinition = {
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
            const pdfDoc = pdfmake_1.default.createPdf(docDefinition);
            pdfDoc.getBuffer((buffer) => {
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
                { header: "Duration", key: "duration", width: 30 },
                { header: "Completion Rate", key: "taskCompletionRate", width: 25 },
            ];
            reportData.forEach((userData) => {
                worksheet.addRow(Object.assign(Object.assign({}, userData), { taskStatusByUser_pending: userData.taskStatusByUser.pending, taskStatusByUser_inProgress: userData.taskStatusByUser.inProgress, taskStatusByUser_completed: userData.taskStatusByUser.completed }));
            });
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=user_report.xlsx");
            yield workbook.xlsx.write(res);
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error exporting report", error: error.message });
    }
});
exports.exportUserReport = exportUserReport;
