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
exports.updateTaskCheckList = exports.updateTaskStatus = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasksById = exports.getTasks = exports.getUserDashboardData = exports.getDashboardData = void 0;
const Task_1 = __importDefault(require("../models/Task"));
// Returns a summary of tasks for the organization (for admin dashboard)
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assuming req.user.organization is set by your auth middleware
        const organizationId = req.user.organization;
        if (!organizationId) {
            res.status(400).json({ message: "Organization not found." });
            return;
        }
        // Aggregate tasks by status within the organization
        const summary = yield Task_1.default.aggregate([
            { $match: { organization: organizationId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json({ summary });
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
        const tasks = yield Task_1.default.find({ assignedTo: userId });
        res.status(200).json({ tasks });
    }
    catch (error) {
        console.error("Error in getUserDashboardData:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getUserDashboardData = getUserDashboardData;
// Returns all tasks for the user's organization.
// Admins and members see tasks for their organization.
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizationId = req.user.organization;
        if (!organizationId) {
            res.status(400).json({ message: "Organization not found." });
            return;
        }
        const tasks = yield Task_1.default.find({ organization: organizationId }).populate("assignedTo createdBy", "-password");
        res.status(200).json({ tasks });
    }
    catch (error) {
        console.error("Error in getTasks:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getTasks = getTasks;
// get single task
const getTasksById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organizationId = req.user.organization;
        const task = yield Task_1.default.findOne({ _id: id, organization: organizationId }).populate("assignedTo createdBy", "-password");
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
// Creates a new task (admin only)
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Expect task details in req.body
        const { title, description, priority, status, dueDate, assignedTo, attachments, todoChecklist, progress, } = req.body;
        // Use the organization from the logged-in admin user
        const organization = req.user.organization;
        if (!organization) {
            res.status(400).json({ message: "Organization not found." });
            return;
        }
        const newTask = new Task_1.default({
            title,
            description,
            priority,
            status,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            attachments,
            todoChecklist,
            progress,
            organization,
        });
        const savedTask = yield newTask.save();
        res.status(201).json({ task: savedTask });
    }
    catch (error) {
        console.error("Error in createTask:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.createTask = createTask;
// Updates task details
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organizationId = req.user.organization;
        // Ensure task belongs to the same organization
        const task = yield Task_1.default.findOne({ _id: id, organization: organizationId });
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        // Update allowed fields
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
        // Ensure task belongs to the organization
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
        const { status } = req.body; // new status value
        const organizationId = req.user.organization;
        // Validate allowed status values if needed
        const allowedStatus = ["pending", "in progress", "completed"];
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
// Updates the todo checklist of a task
const updateTaskCheckList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { todoChecklist } = req.body; // expected to be an array of checklist items
        const organizationId = req.user.organization;
        const task = yield Task_1.default.findOneAndUpdate({ _id: id, organization: organizationId }, { todoChecklist }, { new: true });
        if (!task) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("Error in updateTaskCheckList:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.updateTaskCheckList = updateTaskCheckList;
