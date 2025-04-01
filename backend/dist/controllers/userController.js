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
exports.deleteUser = exports.getUserById = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Task_1 = __importDefault(require("../models/Task"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userPayload = req.user;
        const organizationId = userPayload.organization;
        const users = yield User_1.default.find({ organization: organizationId })
            .select('-password') // Exclude passwords
            .lean();
        const allTasks = yield Task_1.default.find({ organization: organizationId });
        const usersWithTasks = users.map(user => {
            const userTasks = allTasks.filter(task => task.assignedTo.includes(user._id));
            return Object.assign(Object.assign({}, user), { pendingTasks: userTasks.filter(t => t.status === 'pending').length, inProgressTasks: userTasks.filter(t => t.status === 'inProgress').length, completedTasks: userTasks.filter(t => t.status === 'completed').length });
        });
        res.status(200).json(usersWithTasks);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userPayload = req.user;
        const organizationId = userPayload.organization;
        const userId = req.params.id;
        // 1. Find the user in the organization
        const user = yield User_1.default.findOne({
            _id: userId,
            organization: organizationId
        }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found in your organization' });
            return;
        }
        // 2. Find all tasks assigned to this user with full details
        const tasks = yield Task_1.default.find({
            assignedTo: user._id,
            organization: organizationId
        })
            .populate('assignedTo createdBy', 'name email profileImageUrl')
            .sort({ dueDate: 1 });
        // 3. Count tasks by status
        const taskCounts = {
            pending: tasks.filter(t => t.status === 'pending').length,
            inProgress: tasks.filter(t => t.status === 'inProgress').length,
            completed: tasks.filter(t => t.status === 'completed').length
        };
        const response = {
            user: user.toObject(),
            taskStats: taskCounts,
            tasks: tasks.map(task => ({
                _id: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                progress: task.progress,
                assignedTo: task.assignedTo,
                createdBy: task.createdBy,
                attachments: task.attachments,
                todoChecklist: task.todoChecklist,
                createdAt: task.createdAt
            }))
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching user by id:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserById = getUserById;
// DELETE A USER FROM MY ORGANIZATION
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userPayload = req.user;
        const organizationId = userPayload.organization;
        const userId = req.params.id;
        const user = yield User_1.default.findOne({ _id: userId, organization: organizationId });
        if (!user) {
            res.status(404).json({ message: 'User not found in your organization' });
            return;
        }
        yield user.deleteOne();
        res.status(200).json({ message: 'User removed successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteUser = deleteUser;
