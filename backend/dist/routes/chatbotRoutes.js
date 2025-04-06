"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const chatbotController_1 = require("../controllers/chatbotController");
const chatbotRoute = (0, express_1.Router)();
chatbotRoute.post('/chat', authMiddleware_1.protect, authMiddleware_1.adminOnly, chatbotController_1.chatbot);
exports.default = chatbotRoute;
