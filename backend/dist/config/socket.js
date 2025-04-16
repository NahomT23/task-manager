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
exports.initializeSocket = initializeSocket;
const socket_io_1 = require("socket.io");
const socketMiddleware_1 = require("../middlewares/socketMiddleware");
const Message_1 = __importDefault(require("../models/Message"));
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
        },
    });
    io.use(socketMiddleware_1.authenticateSocket);
    // Listen for client connections
    io.on('connection', (socket) => {
        const user = socket.data.user;
        if (!user) {
            console.error("Socket connected without user data");
            return;
        }
        const orgId = user.organization;
        console.log(`User ${user._id} connected and joining organization ${orgId}`);
        // Join the organization room
        socket.join(orgId);
        // Listen for sendMessage events from the client
        socket.on('sendMessage', (messageText) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Received message from user ${user._id}: ${messageText}`);
            try {
                const message = new Message_1.default({
                    text: messageText,
                    sender: user._id,
                    organization: orgId,
                });
                yield message.save();
                const populatedMessage = yield message.populate({
                    path: 'sender',
                    select: 'name profileImageUrl pseudo_name'
                });
                io.to(orgId).emit('newMessage', populatedMessage);
            }
            catch (error) {
                console.error('Error handling message:', error);
            }
        }));
        // Handle socket disconnection
        socket.on('disconnect', () => {
            console.log(`User ${user._id} disconnected`);
        });
    });
}
