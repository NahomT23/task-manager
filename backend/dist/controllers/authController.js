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
exports.updateUserProfile = exports.getUserProfile = exports.signin = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const generate_1 = require("../services/generate");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { name, email, password, invitationCode } = req.body;
    try {
        // Check if user already exists
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Process profile image
        const profileImageUrl = req.file
            ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
            : '';
        // Process invitation code
        let organizationId = null;
        let assignedRole = 'idle';
        if (invitationCode) {
            const organization = yield Organization_1.default.findOne({ "invitations.token": invitationCode });
            if (!organization) {
                res.status(400).json({ message: 'Invalid invitation token' });
                return;
            }
            const invitation = organization.invitations.find(inv => inv.token === invitationCode);
            if (!invitation || invitation.used || invitation.expiresAt < new Date()) {
                res.status(400).json({ message: 'Invalid or expired token' });
                return;
            }
            invitation.used = true;
            yield organization.save();
            organizationId = organization._id;
            assignedRole = 'member';
        }
        const pseudo_name = yield (0, generate_1.generateUniquePseudo)(User_1.default, 'name', 'pseudo_name');
        const pseudo_email = yield (0, generate_1.generateUniquePseudo)(User_1.default, 'email', 'pseudo_email');
        // Create new user
        const newUser = new User_1.default({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role: assignedRole,
            organization: organizationId,
            pseudo_name,
            pseudo_email
        });
        yield newUser.save();
        // Update organization if invited
        if (invitationCode && organizationId) {
            yield Organization_1.default.findByIdAndUpdate(organizationId, {
                $push: { members: newUser._id },
            });
        }
        // Generate JWT token
        const token = (0, generate_1.generateToken)(newUser._id.toString());
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                profileImageUrl: newUser.profileImageUrl,
                organization: newUser.organization,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.signup = signup;
// SIGN IN 
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = (0, generate_1.generateToken)(user._id.toString());
        res.status(200).json({
            message: 'User signed in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl,
                organization: user.organization,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.signin = signin;
// GET USER PROFILE 
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            organization: user.organization,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserProfile = getUserProfile;
// UPDATE USER PROFILE  (only the name, password and profile)
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, password } = req.body;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (name) {
            user.name = name;
        }
        if (password) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            user.password = yield bcryptjs_1.default.hash(password, salt);
        }
        if (req.file) {
            user.profileImageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }
        yield user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl,
                organization: user.organization,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateUserProfile = updateUserProfile;
