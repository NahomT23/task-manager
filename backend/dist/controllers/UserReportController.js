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
const User_1 = __importDefault(require("../models/User"));
const Task_1 = __importDefault(require("../models/Task"));
const moment_1 = __importDefault(require("moment"));
const pdfReportGenerator_1 = require("../services/pdfReportGenerator");
const excelReportGenerator_1 = require("../services/excelReportGenerator");
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
            .select("name email _id createdAt")
            .lean();
        const tasks = yield Task_1.default.find({ organization: userOrganization }).populate("assignedTo", "name email _id");
        // Create user task map
        const userTaskMap = {};
        users.forEach((user) => {
            const memberSinceFormatted = (0, moment_1.default)(user.createdAt).format("MM/DD/YYYY");
            // Calculate tenure
            const years = (0, moment_1.default)().diff((0, moment_1.default)(user.createdAt), "years");
            const months = (0, moment_1.default)().diff((0, moment_1.default)(user.createdAt), "months") % 12;
            const days = (0, moment_1.default)().diff((0, moment_1.default)(user.createdAt), "days") % 30;
            const tenureParts = [];
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
            const pdfBuffer = yield (0, pdfReportGenerator_1.generateUserPdf)(reportData);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=user_report.pdf");
            res.send(pdfBuffer);
        }
        else {
            const excelBuffer = yield (0, excelReportGenerator_1.generateUserExcel)(reportData);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=user_report.xlsx");
            res.send(excelBuffer);
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error exporting report", error: error.message });
    }
});
exports.exportUserReport = exportUserReport;
