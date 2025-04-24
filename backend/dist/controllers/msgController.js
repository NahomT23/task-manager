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
exports.clearMessages = exports.saveMessage = exports.createMessage = exports.getMessages = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const Organization_1 = __importDefault(require("../models/Organization"));
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orgName = req.query.org;
        // Use cached organization ID if possible
        const organization = yield Organization_1.default.findOne({ name: orgName });
        if (!organization) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }
        const messages = yield Message_1.default.find({ organization: organization._id })
            .populate('sender', 'name profileImageUrl')
            .sort({ timestamp: -1 })
            .limit(100);
        res.status(200).json(messages.reverse()); // Reverse for correct order
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMessages = getMessages;
const createMessage = (messageText, senderId, orgId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = new Message_1.default({
            text: messageText,
            sender: senderId,
            organization: orgId,
        });
        yield message.save();
        const populatedMessage = yield message.populate({
            path: 'sender',
            select: 'name profileImageUrl name'
        });
        return populatedMessage;
    }
    catch (error) {
        console.error('Error creating message:', error);
        throw error;
    }
});
exports.createMessage = createMessage;
const saveMessage = (text, userId, orgId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = new Message_1.default({
            text,
            sender: userId,
            organization: orgId,
        });
        yield message.save();
        const populatedMessage = yield message.populate({
            path: 'sender',
            select: 'name profileImageUrl name',
        });
        return populatedMessage;
    }
    catch (error) {
        console.error('Error saving message:', error);
        throw new Error('Error saving message');
    }
});
exports.saveMessage = saveMessage;
const clearMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const organizationId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.organization;
        if (!organizationId) {
            res.status(403).json({ message: 'Not authorized to clear messages' });
            return;
        }
        yield Message_1.default.deleteMany({ organization: organizationId });
        res.status(200).json({ message: 'Chat history cleared successfully' });
    }
    catch (error) {
        console.error('Error clearing messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.clearMessages = clearMessages;
