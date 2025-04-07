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
exports.updateTaskStatus = exports.deleteTask = exports.updateTask = exports.updateTaskCheckList = exports.createTask = exports.getTasksById = exports.getMyTasks = exports.getTasks = exports.getUserDashboardData = exports.getDashboardData = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = __importDefault(require("../models/User"));
const emailTemplate_1 = require("../templates/emailTemplate");
const mailer_1 = require("../config/mailer");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
// Returns a summary of tasks for the organization (for admin dashboard)
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const organizationId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.organization;
        if (!organizationId) {
            res.status(400).json({ message: "Organization not found." });
            return;
        }
        // Count all tasks within the organization
        const allCount = yield Task_1.default.countDocuments({ organization: organizationId });
        // Count tasks by status within the organization
        const pendingCount = yield Task_1.default.countDocuments({ organization: organizationId, status: 'pending' });
        const inProgressCount = yield Task_1.default.countDocuments({ organization: organizationId, status: 'inProgress' });
        const completedCount = yield Task_1.default.countDocuments({ organization: organizationId, status: 'completed' });
        // Count tasks by priority within the organization
        const lowCount = yield Task_1.default.countDocuments({ organization: organizationId, priority: 'low' });
        const mediumCount = yield Task_1.default.countDocuments({ organization: organizationId, priority: 'medium' });
        const highCount = yield Task_1.default.countDocuments({ organization: organizationId, priority: 'high' });
        // Retrieve the 5 most recent tasks within the organization
        const recentTasks = yield Task_1.default.find({ organization: organizationId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id title status priority createdAt');
        res.status(200).json({
            charts: {
                taskDistribution: {
                    All: allCount,
                    Pending: pendingCount,
                    InProgress: inProgressCount,
                    Completed: completedCount,
                },
                taskPriorityLevels: {
                    Low: lowCount,
                    Medium: mediumCount,
                    High: highCount,
                },
            },
            recentTasks,
        });
    }
    catch (error) {
        console.error('Error in getDashboardData:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.getDashboardData = getDashboardData;
// Returns tasks assigned to the logged-in user
const getUserDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        // Count all tasks assigned to the user
        const allCount = yield Task_1.default.countDocuments({ assignedTo: userId });
        // Count tasks by status
        const pendingCount = yield Task_1.default.countDocuments({ assignedTo: userId, status: 'pending' });
        const inProgressCount = yield Task_1.default.countDocuments({ assignedTo: userId, status: 'inProgress' });
        const completedCount = yield Task_1.default.countDocuments({ assignedTo: userId, status: 'completed' });
        // Count tasks by priority
        const lowCount = yield Task_1.default.countDocuments({ assignedTo: userId, priority: 'low' });
        const mediumCount = yield Task_1.default.countDocuments({ assignedTo: userId, priority: 'medium' });
        const highCount = yield Task_1.default.countDocuments({ assignedTo: userId, priority: 'high' });
        // Retrieve recent tasks assigned to the user
        const recentTasks = yield Task_1.default.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id title status priority createdAt');
        res.status(200).json({
            charts: {
                taskDistribution: {
                    All: allCount,
                    Pending: pendingCount,
                    InProgress: inProgressCount,
                    Completed: completedCount,
                },
                taskPriorityLevels: {
                    Low: lowCount,
                    Medium: mediumCount,
                    High: highCount,
                },
            },
            recentTasks,
        });
    }
    catch (error) {
        console.error('Error in getUserDashboardData:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.getUserDashboardData = getUserDashboardData;
// Returns all tasks for the user's organization.
// Admins and members see tasks for their organization.
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const organizationId = req.user.organization;
        const { status } = req.query;
        if (!organizationId) {
            res.status(400).json({ message: "Organization not found." });
            return;
        }
        const filter = { organization: organizationId };
        if (status && status !== "All") {
            filter.status = status;
        }
        // Get tasks with status count summary
        const [tasks, statusSummary] = yield Promise.all([
            Task_1.default.find(filter).populate("assignedTo createdBy", "-password"),
            Task_1.default.aggregate([
                { $match: { organization: organizationId } },
                {
                    $facet: {
                        all: [{ $count: "count" }],
                        pending: [{ $match: { status: "pending" } }, { $count: "count" }],
                        inProgress: [{ $match: { status: "inProgress" } }, { $count: "count" }],
                        completed: [{ $match: { status: "completed" } }, { $count: "count" }]
                    }
                }
            ])
        ]);
        // Process status summary
        const summary = statusSummary[0];
        const statusCounts = {
            All: ((_a = summary.all[0]) === null || _a === void 0 ? void 0 : _a.count) || 0,
            pending: ((_b = summary.pending[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
            inProgress: ((_c = summary.inProgress[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
            completed: ((_d = summary.completed[0]) === null || _d === void 0 ? void 0 : _d.count) || 0
        };
        res.status(200).json({
            tasks,
            statusSummary: statusCounts
        });
    }
    catch (error) {
        console.error("Error in getTasks:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getTasks = getTasks;
// for user to get his tasks
const getMyTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { status } = req.query;
        const filter = { assignedTo: userId };
        if (status && status !== "All") {
            filter.status = status;
        }
        // Fetch all tasks assigned to the user
        const tasks = yield Task_1.default.find(filter).populate("assignedTo createdBy", "-password");
        // Optionally, build a status summary if needed
        const statusSummary = {
            All: tasks.length,
            pending: tasks.filter(task => task.status === "pending").length,
            inProgress: tasks.filter(task => task.status === "inProgress").length,
            completed: tasks.filter(task => task.status === "completed").length,
        };
        res.status(200).json({ tasks, statusSummary });
    }
    catch (error) {
        console.error("Error in getMyTasks:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getMyTasks = getMyTasks;
// get single task
const getTasksById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organizationId = req.user.organization;
        const task = yield Task_1.default.findOne({ _id: id, organization: organizationId })
            .populate("assignedTo createdBy", "-password")
            .populate("attachments");
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("Error in getTasksById:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getTasksById = getTasksById;
// // Creates a new task (admin only)
// export const createTask = async (req: Request, res: Response) => {
//   try {
//     const {
//       title,
//       description,
//       priority,
//       status,
//       dueDate,
//       assignedTo,
//       attachments,
//       todoChecklist,
//       progress,
//     } = req.body;
//     const organization = req.user!.organization;
//     if (!organization) {
//       res.status(400).json({ message: "Organization not found." });
//       return;
//     }
//     const assignedArray = Array.isArray(assignedTo) ? 
//     assignedTo : 
//     [assignedTo].filter(Boolean);
//     const newTask = new Task({
//       title,
//       description,
//       priority,
//       status: "pending",
//       dueDate,
//       assignedTo: assignedArray,
//       createdBy: req.user!._id,
//       attachments,
//       todoChecklist,
//       progress,
//       organization,
//     });
//     const savedTask = await newTask.save();
//         // Send assignment emails
//         const assignedUsers = await User.find({ _id: { $in: assignedArray } });
//         const adminEmail = process.env.ADMIN_EMAIL;
//         assignedUsers.forEach(async (user) => {
//           const emailHtml = `
//             <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
//               <h2 style="color: #2c3e50;">New Task Assignment</h2>
//               <p>Hello ${user.name},</p>
//               <p>You've been assigned a new task:</p>
//               <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//                 <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Title:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${title}</td></tr>
//                 <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${description}</td></tr>
//                 <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Due Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${dueDate}</td></tr>
//                 <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Priority:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${priority}</td></tr>
//               </table>
//               <p style="color: #3498db;">View Task: <a href="${process.env.FRONTEND_URL}/task/${savedTask._id}">Task Details</a></p>
//             </div>
//           `;
//           try {
//             await sendEmail({
//               to: user.email,
//               subject: `New Task Assigned: ${title}`,
//               html: emailHtml
//             });
//           } catch (emailError) {
//             console.error('Email send failed:', emailError);
//           }
//         });
//     res.status(201).json({ task: savedTask });
//   } catch (error) {
//     console.error("Error in createTask:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, priority, status, dueDate, assignedTo, attachments, todoChecklist, progress, } = req.body;
        const organization = req.user.organization;
        if (!organization) {
            res.status(400).json({ message: "Organization not found." });
            return;
        }
        const assignedArray = Array.isArray(assignedTo) ?
            assignedTo :
            [assignedTo].filter(Boolean);
        const newTask = new Task_1.default({
            title,
            description,
            priority,
            status: "pending",
            dueDate,
            assignedTo: assignedArray,
            createdBy: req.user._id,
            attachments,
            todoChecklist,
            progress,
            organization,
        });
        const savedTask = yield newTask.save();
        // Send assignment emails
        const assignedUsers = yield User_1.default.find({ _id: { $in: assignedArray } });
        assignedUsers.forEach((user) => __awaiter(void 0, void 0, void 0, function* () {
            const emailHtml = (0, emailTemplate_1.taskAssignedTemplate)(savedTask, user.name, process.env.FRONTEND_URL || '');
            try {
                yield (0, mailer_1.sendEmail)({
                    to: user.email,
                    subject: `New Task Assigned: ${title}`,
                    html: emailHtml
                });
            }
            catch (emailError) {
                console.error('Email send failed:', emailError);
            }
        }));
        res.status(201).json({ task: savedTask });
    }
    catch (error) {
        console.error("Error in createTask:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.createTask = createTask;
// update task cehcklist
const updateTaskCheckList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { todoChecklist } = req.body;
        const organizationId = req.user.organization;
        // Compute the new status based on the updated todo checklist
        const completedCount = todoChecklist.filter((todo) => todo.completed).length;
        let newStatus = "pending";
        if (completedCount === todoChecklist.length) {
            newStatus = "completed";
        }
        else if (completedCount > 0) {
            newStatus = "inProgress";
        }
        // Update both the todo checklist and the status together
        const task = yield Task_1.default.findOneAndUpdate({ _id: id, organization: organizationId }, { todoChecklist, status: newStatus }, { new: true });
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        if (newStatus === 'completed') {
            const task = yield Task_1.default.findById(id).populate('assignedTo');
            const adminUsers = yield User_1.default.find({
                organization: task === null || task === void 0 ? void 0 : task.organization,
                role: 'admin'
            });
            const userNames = ((_a = task === null || task === void 0 ? void 0 : task.assignedTo) === null || _a === void 0 ? void 0 : _a.filter(user => user !== null).map(user => user.name)) || [];
            const emailHtml = (0, emailTemplate_1.taskCompletedTemplate)(task, userNames, process.env.FRONTEND_URL || '');
            adminUsers.forEach((admin) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield (0, mailer_1.sendEmail)({
                        to: admin.email,
                        subject: `Task Completed: ${task === null || task === void 0 ? void 0 : task.title}`,
                        html: emailHtml
                    });
                }
                catch (emailError) {
                    console.error(`Failed to notify admin ${admin.email}:`, emailError);
                }
            }));
        }
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("Error in updateTaskCheckList:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.updateTaskCheckList = updateTaskCheckList;
// Updates task details
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organizationId = req.user.organization;
        const task = yield Task_1.default.findOne({ _id: id, organization: organizationId });
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        const updates = req.body;
        const updatedTask = yield Task_1.default.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json({ task: updatedTask });
    }
    catch (error) {
        console.error("Error in updateTask:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.updateTask = updateTask;
// Deletes a task by its ID
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organizationId = req.user.organization;
        const task = yield Task_1.default.findOne({ _id: id, organization: organizationId });
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        yield task.deleteOne();
        res.status(200).json({ message: "Task deleted successfully." });
    }
    catch (error) {
        console.error("Error in deleteTask:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.deleteTask = deleteTask;
// Updates the status of a task
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const organizationId = req.user.organization;
        const allowedStatus = ["pending", "inProgress", "completed"];
        if (!allowedStatus.includes(status)) {
            res.status(400).json({ message: "Invalid status value." });
            return;
        }
        const task = yield Task_1.default.findOneAndUpdate({ _id: id, organization: organizationId }, { status }, { new: true });
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("Error in updateTaskStatus:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.updateTaskStatus = updateTaskStatus;
