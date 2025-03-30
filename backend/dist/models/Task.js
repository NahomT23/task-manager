"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const todoSchema = new mongoose_1.default.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
}, {
    timestamps: true
});
const taskSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['pending', 'inProgress', 'completed'],
        default: 'pending',
    },
    dueDate: { type: Date },
    assignedTo: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    attachments: [{ type: String }],
    todoChecklist: [todoSchema],
    progress: { type: Number, default: 0 },
    organization: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Organization', required: true },
}, {
    timestamps: true
});
const Task = mongoose_1.default.model('Task', taskSchema);
exports.default = Task;
