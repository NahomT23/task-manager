"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middlewares/uploadMiddleware"));
const authRoutes = (0, express_1.Router)();
authRoutes.post("/sign-up", uploadMiddleware_1.default.single("image"), authController_1.signup);
authRoutes.post("/sign-in", authController_1.signin);
authRoutes.get("/profile", authMiddleware_1.protect, authController_1.getUserProfile);
authRoutes.put("/profile", authMiddleware_1.protect, authController_1.updateUserProfile);
exports.default = authRoutes;
