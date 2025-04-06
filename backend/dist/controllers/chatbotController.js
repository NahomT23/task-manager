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
const dotenv_1 = require("dotenv");
const chatbotService_1 = require("../services/chatbotService");
(0, dotenv_1.configDotenv)();
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
function fetchOrganizationData(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const adminUser = yield User_1.default.findById(userId)
            .select('role organization pseudo_name pseudo_email name email createdAt')
            .populate('organization', 'name pseudo_name members createdAt invitations');
        if (!(adminUser === null || adminUser === void 0 ? void 0 : adminUser.organization)) {
            throw new Error('Organization not found');
        }
        const users = yield User_1.default.find({
            organization: adminUser.organization._id,
            _id: { $ne: adminUser._id }
        }).select('name email pseudo_name pseudo_email role createdAt');
        const tasks = yield Task_1.default.find({ organization: adminUser.organization._id })
            .populate('assignedTo', 'name email pseudo_name pseudo_email')
            .populate('createdBy', 'name pseudo_name email pseudo_email')
            .lean();
        // Calculate invitation statistics
        const orgInvitations = adminUser.organization.invitations || [];
        const acceptedInvitations = orgInvitations.filter(inv => inv.used && inv.acceptedAt);
        const avgAcceptanceTimeMs = acceptedInvitations.length > 0
            ? acceptedInvitations.reduce((acc, inv) => {
                return (acc +
                    (new Date(inv.acceptedAt).getTime() - new Date(inv.createdAt).getTime()));
            }, 0) / acceptedInvitations.length
            : 0;
        const avgAcceptanceTimeHours = avgAcceptanceTimeMs / (1000 * 60 * 60);
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
                // Include invitations array in pseudo form
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
        return response;
    });
}
const chatbot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = yield fetchOrganizationData((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const originalMessage = req.body.message || '';
        const greetingRegex = /^(hey|hello|hi|good morning|good afternoon)\b/i;
        if (greetingRegex.test(originalMessage.trim()) || originalMessage.trim() === '') {
            const greetingResponsePseudo = `Hey ${data.organization.pseudo_data.admin_pseudo.pseudo_name}, how may I assist you today?`;
            const greetingResponseReal = (0, chatbotService_1.replacePseudoWithReal)(greetingResponsePseudo, data);
            res.status(200).json({ response: greetingResponseReal });
            return;
        }
        // Convert the real message into a pseudo context.
        const pseudoMessage = (0, chatbotService_1.replaceRealWithPseudo)(originalMessage, data);
        // Build the pseudo data context for the AI.
        const pseudoData = {
            organization: data.organization.pseudo_data,
            members: data.members.map((member) => ({
                pseudo_name: member.pseudo_data.pseudo_name,
                pseudo_email: member.pseudo_data.pseudo_email,
                role: member.role,
                task_stats: member.task_stats
            })),
            tasks: data.tasks.map((task) => ({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                pseudo_created_by: task.pseudo_data.created_by,
                pseudo_assigned_to: task.pseudo_data.assigned_to,
                pseudo_attachments: task.pseudo_data.attachments,
                pseudo_todos: task.pseudo_data.todos,
                created_at: task.real_data.created_at,
                due_date: task.real_data.due_date,
                total_todos: task.real_data.total_todos,
                completed_todos: task.real_data.completed_todos
            })),
            invitations: data.organization.invitations
        };
        const instructions = `You are ${data.organization.pseudo_data.pseudo_name}'s personal AI assistant.
  If a user asks about any topic outside ${data.organization.pseudo_data.pseudo_name}, respond with:
  "I am ${data.organization.pseudo_data.pseudo_name}'s personal AI assistant and I can’t answer anything outside ${data.organization.pseudo_data.pseudo_name}."`;
        const fullMessage = `${instructions}
  Data Context:
  ${JSON.stringify(pseudoData, null, 2)}
  User Query:
  ${pseudoMessage}`;
        const chatSession = model.startChat({
            history: [{
                    role: 'user',
                    parts: [{ text: fullMessage }]
                }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });
        const result = yield chatSession.sendMessage(fullMessage);
        const pseudoResponse = result.response.text();
        // Convert the AI's pseudo response back into real values.
        console.log(pseudoResponse);
        const finalResponse = (0, chatbotService_1.replacePseudoWithReal)(pseudoResponse, data);
        res.status(200).json({ response: finalResponse });
    }
    catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});
exports.chatbot = chatbot;
