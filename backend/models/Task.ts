import mongoose from 'mongoose';
import { generateUniquePseudo } from '../services/generate';

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
}, {
    timestamps: true
});

const taskSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
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
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization', 
        required: true 
    },
}, {
    timestamps: true
});

taskSchema.pre('save', async function (next) {
    if (!this.isModified('attachments')) return next();
    
    try {
        this.pseudo_attachments = await Promise.all(
            this.attachments.map(async () => 
                generateUniquePseudo(mongoose.model('Task'), 'att', 'pseudo_attachments')
            )
        );
        next();
    } catch (error) {
        next(error as Error);
    }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;