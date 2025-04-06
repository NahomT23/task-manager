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
const InvitationSchema = new mongoose_1.default.Schema({
    token: { type: String, required: true },
    pseudo_token: { type: String, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    acceptedAt: { type: Date }
}, {
    timestamps: true,
});
InvitationSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isNew)
            return next();
        this.pseudo_token = yield (0, generate_1.generateUniquePseudo)(mongoose_1.default.model('Organization'), 'inv', 'pseudo_token');
        next();
    });
});
const OrganizationSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    pseudo_name: { type: String, required: true, unique: true },
    admin: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    invitations: [InvitationSchema],
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true,
});
OrganizationSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isNew)
            return next();
        this.pseudo_name = yield (0, generate_1.generateUniquePseudo)(Organization, 'org', 'pseudo_name');
        next();
    });
});
const Organization = mongoose_1.default.model('Organization', OrganizationSchema);
exports.default = Organization;
