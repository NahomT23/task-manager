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
const mongoose_1 = __importDefault(require("mongoose"));
const generate_1 = require("../services/generate");
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
    assignedTo: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    attachments: [{
            type: String
        }],
    pseudo_attachments: {
        type: [String],
        index: true,
        unique: true
    },
    todoChecklist: [todoSchema],
    progress: {
        type: Number,
        default: 0
    },
    organization: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
}, {
    timestamps: true
});
taskSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('attachments'))
            return next();
        try {
            this.pseudo_attachments = yield Promise.all(this.attachments.map(() => __awaiter(this, void 0, void 0, function* () { return (0, generate_1.generateUniquePseudo)(mongoose_1.default.model('Task'), 'att', 'pseudo_attachments'); })));
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const Task = mongoose_1.default.model('Task', taskSchema);
exports.default = Task;
