"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const db_1 = __importDefault(require("./config/db"));
const helmet_1 = __importDefault(require("helmet"));
;
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const organizationRoutes_1 = __importDefault(require("./routes/organizationRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const reportsRoutes_1 = __importDefault(require("./routes/reportsRoutes"));
const rateLimitMiddleware_1 = require("./middlewares/rateLimitMiddleware");
const chatbotRoutes_1 = __importDefault(require("./routes/chatbotRoutes"));
(0, dotenv_1.configDotenv)();
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
// REMOVE THIS AND TEST AGAIN
app.set('trust proxy', 1);
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.options('*', (0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use((0, express_mongo_sanitize_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/uploads', rateLimitMiddleware_1.uploadLimiter, express_1.default.static('uploads'));
app.use((0, helmet_1.default)());
app.use('/api/auth', rateLimitMiddleware_1.authLimiter, authRoutes_1.default);
app.use('/api/org', rateLimitMiddleware_1.apiLimiter, organizationRoutes_1.default);
app.use('/api/users', rateLimitMiddleware_1.apiLimiter, userRoutes_1.default);
app.use('/api/tasks', rateLimitMiddleware_1.apiLimiter, taskRoutes_1.default);
app.use('/api/reports', rateLimitMiddleware_1.apiLimiter, reportsRoutes_1.default);
app.use('/api/bot', chatbotRoutes_1.default);
app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
    (0, db_1.default)();
});
