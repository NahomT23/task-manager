"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const InvitationSchema = new mongoose_1.default.Schema({
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
});
const OrganizationSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    admin: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    invitations: [InvitationSchema],
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true,
});
const Organization = mongoose_1.default.model('Organization', OrganizationSchema);
exports.default = Organization;
