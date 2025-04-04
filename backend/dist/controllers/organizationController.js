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
exports.updateOrganizationName = exports.getOrganizationById = exports.joinOrganization = exports.createOrganization = exports.generateInvitationCode = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Organization_1 = __importDefault(require("../models/Organization"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateInvitationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403).json({ message: 'Only admins can generate invitation codes' });
            return;
        }
        const organizationId = req.user.organization;
        if (!organizationId) {
            res.status(400).json({ message: 'User is not associated with any organization' });
            return;
        }
        const generateCode = () => {
            const hexChars = '0123456789abcdef';
            let code = '';
            for (let i = 0; i < 10; i++) {
                code += hexChars.charAt(crypto_1.default.randomInt(hexChars.length));
            }
            return code;
        };
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const organization = yield Organization_1.default.findByIdAndUpdate(organizationId, { $push: { invitations: { token: code, expiresAt } } }, { new: true });
        if (!organization) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }
        res.status(200).json({ invitationToken: code, expiresAt });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.generateInvitationCode = generateInvitationCode;
const createOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== 'idle') {
            res.status(403).json({ message: 'Unauthorized to create organization' });
            return;
        }
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Organization name required' });
            return;
        }
        const existingOrg = yield Organization_1.default.findOne({ admin: req.user.id });
        if (existingOrg) {
            res.status(400).json({ message: 'User is already an admin' });
            return;
        }
        // Create organization
        const organization = new Organization_1.default({
            name,
            admin: req.user.id,
            members: [req.user.id],
            invitations: [],
        });
        yield organization.save();
        // Update user role and organization (remove populate)
        const user = yield User_1.default.findByIdAndUpdate(req.user.id, { role: 'admin', organization: organization._id }, { new: true });
        if (!user) {
            res.status(500).json({ message: 'Failed to update user' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: user.role,
            organization: user.organization
        }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({
            message: `Organization created`,
            organization,
            user,
            token
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createOrganization = createOrganization;
const joinOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== 'idle') {
            res.status(403).json({ message: 'Unauthorized to join organization' });
            return;
        }
        const { invitationToken } = req.body;
        if (!invitationToken) {
            res.status(400).json({ message: 'Invitation token required' });
            return;
        }
        const organization = yield Organization_1.default.findOne({
            "invitations.token": invitationToken,
        });
        if (!organization) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        const invitation = organization.invitations.find((inv) => inv.token === invitationToken && !inv.used && inv.expiresAt > new Date());
        if (!invitation) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        // Check if user is already a member
        if (organization.members.includes(req.user.id)) {
            res.status(400).json({ message: 'User already in organization' });
            return;
        }
        // Update invitation and add user
        invitation.used = true;
        organization.members.push(req.user.id);
        yield organization.save();
        // Update user role and organization
        const user = yield User_1.default.findByIdAndUpdate(req.user.id, { role: 'member', organization: organization._id }, { new: true });
        res.status(200).json({
            message: `Joined ${organization.name} successfully`,
            organization,
            user,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.joinOrganization = joinOrganization;
const getOrganizationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organization = yield Organization_1.default.findById(id);
        if (!organization) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }
        res.status(200).json(organization);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getOrganizationById = getOrganizationById;
const updateOrganizationName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Valid organization name required' });
            return;
        }
        const user = yield User_1.default.findById(userId).populate('organization');
        if (!(user === null || user === void 0 ? void 0 : user.organization)) {
            res.status(400).json({ message: 'User not associated with any organization' });
            return;
        }
        const organization = yield Organization_1.default.findByIdAndUpdate(user.organization._id, { name: name.trim() }, { new: true });
        res.status(200).json({
            message: 'Organization name updated successfully',
            organization
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateOrganizationName = updateOrganizationName;
