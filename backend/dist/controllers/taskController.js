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
const upstashRedis_1 = __importDefault(require("../config/upstashRedis"));
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
        const cacheKey = `adminData:${organizationId}`;
        const cachedData = yield upstashRedis_1.default.get(cacheKey);
        if (cachedData) {
            console.log("✅ Redis HIT ON ADMIN DASHBOARD DATA - data found in cache");
            res.status(200).json(Object.assign({ message: "Dashboard data retrieved from cache" }, cachedData));
            return;
        }
        const [allCount, pendingCount, inProgressCount, completedCount] = yield Promise.all([
            Task_1.default.countDocuments({ organization: organizationId }),
            Task_1.default.countDocuments({ organization: organizationId, status: "pending" }),
            Task_1.default.countDocuments({ organization: organizationId, status: "inProgress" }),
            Task_1.default.countDocuments({ organization: organizationId, status: "completed" }),
        ]);
        const [lowCount, mediumCount, highCount] = yield Promise.all([
            Task_1.default.countDocuments({ organization: organizationId, priority: "low" }),
            Task_1.default.countDocuments({ organization: organizationId, priority: "medium" }),
            Task_1.default.countDocuments({ organization: organizationId, priority: "high" }),
        ]);
        const recentTasks = yield Task_1.default.find({ organization: organizationId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("_id title status priority createdAt");
        const charts = {
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
        };
        yield upstashRedis_1.default.set(cacheKey, { charts, recentTasks }, { ex: 3600 });
        res.status(200).json({ charts, recentTasks });
    }
    catch (error) {
        console.error("Error in getDashboardData:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getDashboardData = getDashboardData;
// Returns tasks assigned to the logged-in user
const getUserDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const cacheKey = `memberData:${userId}`;
        const cachedData = yield upstashRedis_1.default.get(cacheKey);
        if (cachedData) {
            console.log("✅ Redis HIT ON MEMBER DASHBOARD DATA - data found in cache");
            res.status(200).json(Object.assign({ message: "Dashboard data retrieved from cache" }, cachedData));
            return;
        }
        console.log("❌ Redis MISS ON MEMBER DASHBOARD DATA - computing fresh");
        // Count tasks by status
        const [allCount, pendingCount, inProgressCount, completedCount] = yield Promise.all([
            Task_1.default.countDocuments({ assignedTo: userId }),
            Task_1.default.countDocuments({ assignedTo: userId, status: 'pending' }),
            Task_1.default.countDocuments({ assignedTo: userId, status: 'inProgress' }),
            Task_1.default.countDocuments({ assignedTo: userId, status: 'completed' }),
        ]);
        // Count tasks by priority
        const [lowCount, mediumCount, highCount] = yield Promise.all([
            Task_1.default.countDocuments({ assignedTo: userId, priority: 'low' }),
            Task_1.default.countDocuments({ assignedTo: userId, priority: 'medium' }),
            Task_1.default.countDocuments({ assignedTo: userId, priority: 'high' }),
        ]);
        // Recent tasks
        const recentTasks = yield Task_1.default.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id title status priority createdAt');
        const charts = {
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
        };
        yield upstashRedis_1.default.set(cacheKey, { charts, recentTasks }, { ex: 3600 });
        res.status(200).json({ charts, recentTasks });
        return;
    }
    catch (error) {
        console.error('Error in getUserDashboardData:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.getUserDashboardData = getUserDashboardData;
// Admins get all the tasks in his organization.
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const organizationId = req.user.organization;
        const { status } = req.query;
        if (!organizationId) {
            res.status(400).json({ message: "Organization not found." });
            return;
        }
        const cacheKey = `allTaskData:${organizationId}`;
        const cachedData = yield upstashRedis_1.default.get(cacheKey);
        if (cachedData) {
            console.log("✅ Redis HIT ON TASKS - data found in cache");
            res.status(200).json(Object.assign({ message: "Task data retrieved from cache" }, cachedData));
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
        yield upstashRedis_1.default.set(cacheKey, { tasks, statusSummary: statusCounts }, { ex: 3600 });
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
        const cacheKey = `myTasks:${userId}:${status || "All"}`;
        const cachedData = yield upstashRedis_1.default.get(cacheKey);
        if (cachedData) {
            console.log("✅ Redis HIT ON MY TASKS - data found in cache");
            res.status(200).json(Object.assign({ message: "My Task data retrieved from cache" }, cachedData));
            return;
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
        yield upstashRedis_1.default.set(cacheKey, { tasks, statusSummary }, { ex: 3600 });
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
        const cacheKey = `task:${organizationId}:${id}`;
        const cachedData = yield upstashRedis_1.default.get(cacheKey);
        if (cachedData) {
            console.log("✅ Redis HIT ON SINGLE TASKS - data found in cache");
            res.status(200).json({
                message: "Single Task data retrieved from cache",
                task: cachedData.task,
            });
            return;
        }
        console.log("❌ Redis MISS ON SINGLE TASK - fetching from DB");
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        yield upstashRedis_1.default.set(cacheKey, { task }, { ex: 3600 });
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("Error in getTasksById:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getTasksById = getTasksById;
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
        const statusVariants = ["All", "pending", "inProgress", "completed"];
        yield Promise.all([
            // clear single‐task caches
            upstashRedis_1.default.del(`task:${organization}`),
            upstashRedis_1.default.del(`task:${organization}:${savedTask._id}`),
            // clear admin caches
            upstashRedis_1.default.del(`adminData:${organization}`),
            upstashRedis_1.default.del(`allTaskData:${organization}`),
            // clear every variant of myTasks for each assigned user
            ...assignedArray.flatMap(uid => statusVariants.map(status => upstashRedis_1.default.del(`myTasks:${uid}:${status}`))),
            // clear the member dashboard cache too:
            ...assignedArray.map(uid => upstashRedis_1.default.del(`memberData:${uid}`)),
        ]);
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
    var _a, _b;
    try {
        const { id } = req.params;
        const { todoChecklist } = req.body;
        const organizationId = req.user.organization;
        // Calculate progress and status
        const totalTodos = todoChecklist.length;
        const completedCount = todoChecklist.filter((todo) => todo.completed).length;
        const newProgress = totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;
        let newStatus = "pending";
        if (completedCount === totalTodos) {
            newStatus = "completed";
        }
        else if (completedCount > 0) {
            newStatus = "inProgress";
        }
        // Update task with both progress and status
        const task = yield Task_1.default.findOneAndUpdate({ _id: id, organization: organizationId }, {
            todoChecklist,
            status: newStatus,
            progress: newProgress // Add progress update here
        }, { new: true });
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        // If task is now completed, notify organization admins
        if (newStatus === 'completed') {
            // Use a distinct variable name to avoid shadowing
            const taskWithAssigned = yield Task_1.default.findById(id).populate('assignedTo');
            // Get all admins for the task's organization
            let adminUsers = yield User_1.default.find({
                organization: taskWithAssigned === null || taskWithAssigned === void 0 ? void 0 : taskWithAssigned.organization,
                role: 'admin'
            });
            // Filter out the email account used for sending emails if it exists in adminUsers
            adminUsers = adminUsers.filter(admin => admin.email !== process.env.GMAIL_USER);
            // Extract names from the assigned users list (if any)
            const userNames = ((_a = taskWithAssigned === null || taskWithAssigned === void 0 ? void 0 : taskWithAssigned.assignedTo) === null || _a === void 0 ? void 0 : _a.filter(user => user !== null).map(user => user.name)) || [];
            const emailHtml = (0, emailTemplate_1.taskCompletedTemplate)(taskWithAssigned, userNames, process.env.FRONTEND_URL || '');
            // Correctly use a template literal for the subject line
            adminUsers.forEach((admin) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield (0, mailer_1.sendEmail)({
                        to: admin.email,
                        subject: `Task Completed: ${taskWithAssigned === null || taskWithAssigned === void 0 ? void 0 : taskWithAssigned.title}`,
                        html: emailHtml
                    });
                }
                catch (emailError) {
                    console.error(`Failed to notify admin ${admin.email}:`, emailError);
                }
            }));
        }
        // Invalidate related Redis cache keys
        const statusVariants = ["All", "pending", "inProgress", "completed"];
        yield Promise.all([
            upstashRedis_1.default.del(`task:${organizationId}`),
            upstashRedis_1.default.del(`task:${organizationId}:${id}`),
            upstashRedis_1.default.del(`adminData:${organizationId}`),
            upstashRedis_1.default.del(`allTaskData:${organizationId}`),
            ...(task.assignedTo || []).flatMap(uid => statusVariants.map(status => upstashRedis_1.default.del(`myTasks:${uid.toString()}:${status}`)))
        ]);
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        yield Promise.all([
            upstashRedis_1.default.del(`myTasks:${userId}:All`),
            upstashRedis_1.default.del(`myTasks:${userId}:pending`),
            upstashRedis_1.default.del(`myTasks:${userId}:inProgress`),
            upstashRedis_1.default.del(`myTasks:${userId}:completed`),
            upstashRedis_1.default.del(`memberData:${userId}`),
        ]);
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
        yield Promise.all([
            upstashRedis_1.default.del(`task:${organizationId}`),
            upstashRedis_1.default.del(`task:${organizationId}:${id}`),
            upstashRedis_1.default.del(`adminData:${organizationId}`),
            upstashRedis_1.default.del(`allTaskData:${organizationId}`),
            ...((task === null || task === void 0 ? void 0 : task.assignedTo) || []).map(uid => upstashRedis_1.default.del(`myTasks:${uid.toString()}:All`))
        ]);
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
        const statusVariants = ["All", "pending", "inProgress", "completed"];
        const assignedUserIds = (task.assignedTo || []).map(user => user.toString());
        yield Promise.all([
            upstashRedis_1.default.del(`task:${organizationId}`),
            upstashRedis_1.default.del(`task:${organizationId}:${id}`),
            upstashRedis_1.default.del(`adminData:${organizationId}`),
            upstashRedis_1.default.del(`allTaskData:${organizationId}`),
            ...assignedUserIds.flatMap(uid => statusVariants.map(status => upstashRedis_1.default.del(`myTasks:${uid}:${status}`)))
        ]);
        res.status(200).json({ message: "Task deleted successfully." });
    }
    catch (error) {
        console.error("Error in deleteTask:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.deleteTask = deleteTask;
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
        // update the task
        const task = yield Task_1.default.findOneAndUpdate({ _id: id, organization: organizationId }, { status }, { new: true }).lean();
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        const statusVariants = ["All", "pending", "inProgress", "completed"];
        const assignedUserIds = (task.assignedTo || []).map(u => u.toString());
        yield Promise.all([
            upstashRedis_1.default.del(`task:${organizationId}`),
            upstashRedis_1.default.del(`task:${organizationId}:${id}`),
            upstashRedis_1.default.del(`adminData:${organizationId}`),
            upstashRedis_1.default.del(`allTaskData:${organizationId}`),
            ...assignedUserIds.flatMap(uid => statusVariants.map(variant => upstashRedis_1.default.del(`myTasks:${uid}:${variant}`))),
            ...assignedUserIds.map(uid => upstashRedis_1.default.del(`memberData:${uid}`)),
        ]);
        res.status(200).json({ task });
        return;
    }
    catch (error) {
        console.error("Error in updateTaskStatus:", error);
        res.status(500).json({ message: "Server error." });
        return;
    }
});
exports.updateTaskStatus = updateTaskStatus;
