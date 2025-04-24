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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const socket_io_1 = require("socket.io");
const socketMiddleware_1 = require("../middlewares/socketMiddleware");
const msgController_1 = require("../controllers/msgController");
const onlineUsers = {};
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
        },
    });
    io.use(socketMiddleware_1.authenticateSocket);
    io.on('connection', (socket) => {
        const user = socket.data.user;
        if (!user) {
            console.error("Socket connected without user data");
            return;
        }
        const orgId = user.organization.toString();
        console.log(`User ${user._id} joining room ${orgId}`);
        socket.join(orgId);
        onlineUsers[user._id] = (onlineUsers[user._id] || 0) + 1;
        io.to(orgId).emit('updateOnlineStatus', onlineUsers);
        socket.on('sendMessage', (messageText) => __awaiter(this, void 0, void 0, function* () {
            try {
                const populatedMessage = yield (0, msgController_1.saveMessage)(messageText, user._id, orgId);
                io.to(orgId).emit('newMessage', populatedMessage);
            }
            catch (error) {
                console.error('Error handling message:', error);
            }
        }));
        socket.on('disconnect', () => {
            onlineUsers[user._id] = (onlineUsers[user._id] || 1) - 1;
            if (onlineUsers[user._id] <= 0)
                delete onlineUsers[user._id];
            io.to(orgId).emit('updateOnlineStatus', onlineUsers);
        });
    });
}
