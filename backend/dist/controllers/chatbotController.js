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
exports.chatbot = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const Task_1 = __importDefault(require("../models/Task"));
const generative_ai_1 = require("@google/generative-ai");
const upstashRedis_1 = __importDefault(require("../config/upstashRedis"));
const dotenv_1 = require("dotenv");
const chatbotService_1 = require("../services/chatbotService");
(0, dotenv_1.configDotenv)();
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
function fetchOrganizationData(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheKey = `orgData:${userId}`;
        // Explicitly annotate cachedData as unknown
        let cachedData = yield upstashRedis_1.default.get(cacheKey);
        if (cachedData) {
            console.log("ORG Data Hit");
            try {
                // Parse if it is a string; assert the type as any for downstream use.
                const parsedData = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
                // Validate essential properties before returning cached data.
                if (!parsedData.admin ||
                    !parsedData.admin.real_data ||
                    !parsedData.organization ||
                    !parsedData.organization.real_data ||
                    !parsedData.organization.pseudo_data) {
                    throw new Error("Cached data incomplete");
                }
                return parsedData;
            }
            catch (err) {
                console.error("Invalid or incomplete cached data; fetching fresh data:", err);
                // Remove invalid cache entry.
                yield upstashRedis_1.default.del(cacheKey);
            }
        }
        console.log("Org data missed, Fetching from DB");
        // Fetch admin user and organization details from the database.
        const adminUser = yield User_1.default.findById(userId)
            .select('role organization pseudo_name pseudo_email name email createdAt')
            .populate('organization', 'name pseudo_name members createdAt invitations');
        if (!(adminUser === null || adminUser === void 0 ? void 0 : adminUser.organization)) {
            throw new Error('Organization not found');
        }
        // Fetch other users in the organization (excluding the admin)
        const users = yield User_1.default.find({
            organization: adminUser.organization._id,
            _id: { $ne: adminUser._id }
        }).select('name email pseudo_name pseudo_email role createdAt');
        // Fetch tasks with populated assignedTo and createdBy fields
        const tasks = yield Task_1.default.find({ organization: adminUser.organization._id })
            .populate('assignedTo', 'name email pseudo_name pseudo_email')
            .populate('createdBy', 'name pseudo_name email pseudo_email')
            .lean();
        // Calculate invitation statistics for the organization.
        const orgInvitations = adminUser.organization.invitations || [];
        const acceptedInvitations = orgInvitations.filter(inv => inv.used && inv.acceptedAt);
        const avgAcceptanceTimeMs = acceptedInvitations.length > 0
            ? acceptedInvitations.reduce((acc, inv) => (acc +
                (new Date(inv.acceptedAt).getTime() - new Date(inv.createdAt).getTime())), 0) / acceptedInvitations.length
            : 0;
        const avgAcceptanceTimeHours = avgAcceptanceTimeMs / (1000 * 60 * 60);
        // Construct the response object.
        const response = {
            admin: {
                real_data: {
                    name: adminUser.name,
                    email: adminUser.email,
                    pseudo_name: adminUser.pseudo_name,
                    pseudo_email: adminUser.pseudo_email,
                    created_at: adminUser.createdAt.toISOString()
                },
                pseudo_data: {
                    pseudo_name: adminUser.pseudo_name,
                    pseudo_email: adminUser.pseudo_email
                }
            },
            organization: {
                real_data: {
                    name: adminUser.organization.name,
                    created_at: adminUser.organization.createdAt.toISOString()
                },
                pseudo_data: {
                    pseudo_name: adminUser.organization.pseudo_name,
                    admin_pseudo: {
                        pseudo_name: adminUser.pseudo_name,
                        pseudo_email: adminUser.pseudo_email
                    }
                },
                stats: {
                    total_members: users.length + 1,
                    total_tasks: tasks.length,
                    invitationsStats: {
                        total_invitations: orgInvitations.length,
                        accepted_invitations: acceptedInvitations.length,
                        avg_acceptance_time_hours: avgAcceptanceTimeHours
                    }
                },
                // Store invitations in pseudo form.
                invitations: orgInvitations.map(inv => ({
                    pseudo_token: inv.pseudo_token,
                    expiresAt: inv.expiresAt,
                    used: inv.used
                }))
            },
            members: users.map(user => ({
                real_data: {
                    name: user.name,
                    email: user.email,
                    created_at: user.createdAt.toISOString()
                },
                pseudo_data: {
                    pseudo_name: user.pseudo_name,
                    pseudo_email: user.pseudo_email
                },
                role: user.role,
                task_stats: {
                    total: tasks.filter(task => task.assignedTo.some((u) => u._id.equals(user._id))).length,
                    pending: tasks.filter(task => task.status === 'pending' &&
                        task.assignedTo.some((u) => u._id.equals(user._id))).length,
                    completed: tasks.filter(task => task.status === 'completed' &&
                        task.assignedTo.some((u) => u._id.equals(user._id))).length
                }
            })),
            tasks: tasks.map(task => ({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                real_data: {
                    created_at: task.createdAt,
                    due_date: task.dueDate,
                    created_by: task.createdBy.name,
                    assigned_to: task.assignedTo.map((u) => ({
                        name: u.name,
                        email: u.email
                    })),
                    attachments: task.attachments,
                    total_todos: task.todoChecklist.length,
                    completed_todos: task.todoChecklist.filter((t) => t.completed).length
                },
                pseudo_data: {
                    created_by: task.createdBy.pseudo_name,
                    assigned_to: task.assignedTo.map((u) => ({
                        pseudo_name: u.pseudo_name,
                        pseudo_email: u.pseudo_email
                    })),
                    attachments: task.pseudo_attachments.map((a, i) => ({
                        pseudo_id: a,
                        real_value: task.attachments[i] || 'unknown'
                    })),
                    todos: task.todoChecklist.map((todo) => ({
                        pseudo_id: `todo_${crypto_1.default.randomBytes(3).toString('hex')}`,
                        text: todo.text,
                        completed: todo.completed
                    }))
                }
            }))
        };
        yield upstashRedis_1.default.set(cacheKey, JSON.stringify(response), { ex: 3600 });
        return response;
    });
}
const chatbot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (typeof req.body.message !== 'string') {
            throw new Error('Invalid input type');
        }
        const data = yield fetchOrganizationData((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const originalMessage = req.body.message || '';
        // Validate and sanitize input
        const safeOriginalMessage = (0, chatbotService_1.validateInput)(originalMessage);
        if (safeOriginalMessage !== originalMessage) {
            throw new Error('Invalid input detected');
        }
        // Handle greetings
        const greetingRegex = /^(hey|hello|hi|good morning|good afternoon)\b/i;
        if (greetingRegex.test(safeOriginalMessage.trim()) || safeOriginalMessage.trim() === '') {
            const greetingResponsePseudo = `Hey ${data.organization.pseudo_data.admin_pseudo.pseudo_name}, how may I assist you today?`;
            const greetingResponseReal = (0, chatbotService_1.replacePseudoWithReal)(greetingResponsePseudo, data);
            res.status(200).json({ response: greetingResponseReal });
            return;
        }
        // Secure and prepare data
        const securedData = (0, chatbotService_1.secureContextData)(data);
        const pseudoMessage = (0, chatbotService_1.replaceRealWithPseudo)(safeOriginalMessage, data);
        // Prepare AI context
        const pseudoData = {
            organization: securedData.organization.pseudo_data,
            members: securedData.members.map((member) => ({
                pseudo_name: member.pseudo_data.pseudo_name,
                pseudo_email: member.pseudo_data.pseudo_email,
                role: member.role,
                task_stats: member.task_stats
            })),
            tasks: securedData.tasks.map((task) => ({
                title: task.title,
                status: task.status,
                priority: task.priority,
                pseudo_created_by: task.pseudo_data.created_by,
                pseudo_assigned_to: task.pseudo_data.assigned_to,
            }))
        };
        // AI instructions with safety rules
        const instructions = `${chatbotService_1.SAFETY_PROMPT}
You are ${securedData.organization.pseudo_data.pseudo_name}'s organizational assistant.
For deletion requests, respond EXACTLY with: [DELETE_USER:{pseudo_email}]`;
        const chatSession = model.startChat({
            history: [{
                    role: 'user',
                    parts: [{ text: `${instructions}\n\nContext:\n${JSON.stringify(pseudoData)}\n\nQuery: ${pseudoMessage}` }]
                }],
            generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 1000,
            },
        });
        // Get AI response
        const result = yield chatSession.sendMessage(pseudoMessage);
        const pseudoResponse = result.response.text();
        // Handle deletion command
        const deleteCommandRegex = /\[DELETE_USER:(.+?)\]/;
        const deleteMatch = pseudoResponse.match(deleteCommandRegex);
        let finalResponse;
        if (deleteMatch) {
            try {
                const pseudoEmail = deleteMatch[1];
                // Verify admin permissions
                const adminUser = yield User_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)
                    .select('role organization');
                if (!adminUser || adminUser.role !== 'admin') {
                    throw new Error('Unauthorized');
                }
                // Find member to delete
                const memberData = data.members.find((m) => m.pseudo_data.pseudo_email === pseudoEmail);
                if (!memberData) {
                    throw new Error('Member not found');
                }
                // Database operations
                const userToDelete = yield User_1.default.findOneAndDelete({
                    email: memberData.real_data.email,
                    organization: adminUser.organization
                });
                if (!userToDelete) {
                    throw new Error('User not found in database');
                }
                // Remove from tasks
                yield Task_1.default.updateMany({ assignedTo: userToDelete._id }, { $pull: { assignedTo: userToDelete._id } });
                yield Promise.all([
                    upstashRedis_1.default.del(`orgData:${(_c = req.user) === null || _c === void 0 ? void 0 : _c.id}`),
                    upstashRedis_1.default.del(`user:${userToDelete._id}`),
                    upstashRedis_1.default.del(`tasks:${adminUser.organization}`),
                    upstashRedis_1.default.del(`users:${adminUser.organization}`)
                ]);
                finalResponse = `User ${memberData.real_data.name} has been successfully deleted.`;
            }
            catch (error) {
                console.error('Deletion error:', error);
                finalResponse = 'Failed to process deletion request. Please verify permissions and try again.';
            }
        }
        else {
            const safePseudoResponse = (0, chatbotService_1.validateInput)(pseudoResponse);
            finalResponse = (0, chatbotService_1.replacePseudoWithReal)(safePseudoResponse, data);
        }
        res.status(200).json({ response: finalResponse });
    }
    catch (error) {
        console.error('Chatbot Error:', error.message);
        res.status(500).json({
            error: error.message.startsWith('Invalid')
                ? 'Invalid request format'
                : 'Internal server error'
        });
    }
});
exports.chatbot = chatbot;
