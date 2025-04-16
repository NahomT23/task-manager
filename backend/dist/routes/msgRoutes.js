"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const msgController_1 = require("../controllers/msgController");
const msgRoute = (0, express_1.Router)();
msgRoute.get('/', authMiddleware_1.protect, msgController_1.getMessages);
exports.default = msgRoute;
