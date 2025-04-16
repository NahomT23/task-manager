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
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Message_1 = __importDefault(require("../models/Message"));
const Organization_1 = __importDefault(require("../models/Organization"));
const msgRoute = (0, express_1.Router)();
// Get messages for organization
msgRoute.get('/', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orgName = req.query.org;
        // Find organization by name
        const organization = yield Organization_1.default.findOne({ name: orgName });
        if (!organization) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }
        // Find messages for this organization
        const messages = yield Message_1.default.find({ organization: organization._id })
            .populate('sender', 'name profileImageUrl pseudo_name')
            .sort({ timestamp: 1 });
        res.json(messages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = msgRoute;
