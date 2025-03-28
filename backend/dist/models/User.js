"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageUrl: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['idle', 'admin', 'member'],
        default: 'idle',
    },
    organization: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organization',
    },
}, {
    timestamps: true,
});
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
