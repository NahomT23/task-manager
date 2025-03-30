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
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const organizationRoutes_1 = __importDefault(require("./routes/organizationRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const reportsRoutes_1 = __importDefault(require("./routes/reportsRoutes"));
(0, dotenv_1.configDotenv)();
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.options('*', (0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use((0, express_mongo_sanitize_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Before helmet, this is for the profile images
app.use('/uploads', express_1.default.static('uploads'));
app.use((0, helmet_1.default)());
// ROUTES
app.use('/api/auth', authRoutes_1.default);
app.use('/api/org', organizationRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/reports', reportsRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Hello wworld');
});
app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
    (0, db_1.default)();
});
