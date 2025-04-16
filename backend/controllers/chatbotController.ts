import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User';
import Task from '../models/Task';
import { GoogleGenerativeAI } from '@google/generative-ai';
import redis from '../config/upstashRedis';
import { configDotenv } from 'dotenv';
import { replacePseudoWithReal, replaceRealWithPseudo, SAFETY_PROMPT, secureContextData, validateInput } from '../services/chatbotService';
configDotenv();


interface PopulatedOrganization {
  createdAt: any;
  _id: mongoose.Types.ObjectId;
  name: string;
  pseudo_name: string;
  members: mongoose.Types.ObjectId[];
  invitations: InvitationItem[];
}
interface InvitationItem {
  token: string;
  pseudo_token: string;
  expiresAt: Date;
  used: boolean;
  acceptedAt?: Date;
  createdAt: Date;
}
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  pseudo_name: string;
  pseudo_email: string;
  role: string;
  createdAt: Date;
  profileImageUrl?: string;
}

interface TodoItem {
  text: string;
  completed: boolean;
  _id?: mongoose.Types.ObjectId;
}

interface PopulatedTask extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date;
  progress: number;
  createdAt: Date;
  assignedTo: PopulatedUser[];
  createdBy: PopulatedUser;
  todoChecklist: TodoItem[];
  attachments: string[];
  pseudo_attachments: string[];
}

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function fetchOrganizationData(userId: string): Promise<any> {
  const cacheKey = `orgData:${userId}`;
  // Explicitly annotate cachedData as unknown
  let cachedData: unknown = await redis.get(cacheKey);

  if (cachedData) {
    console.log("ORG Data Hit");
    try {
      // Parse if it is a string; assert the type as any for downstream use.
      const parsedData = typeof cachedData === "string" ? JSON.parse(cachedData) as any : cachedData as any;
      
      // Validate essential properties before returning cached data.
      if (
        !parsedData.admin ||
        !parsedData.admin.real_data ||
        !parsedData.organization ||
        !parsedData.organization.real_data ||
        !parsedData.organization.pseudo_data
      ) {
        throw new Error("Cached data incomplete");
      }
      return parsedData;
    } catch (err) {
      console.error("Invalid or incomplete cached data; fetching fresh data:", err);
      // Remove invalid cache entry.
      await redis.del(cacheKey);
    }
  }

  console.log("Org data missed, Fetching from DB");

  // Fetch admin user and organization details from the database.
  const adminUser = await User.findById(userId)
    .select('role organization pseudo_name pseudo_email name email createdAt')
    .populate<{ organization: PopulatedOrganization }>(
      'organization',
      'name pseudo_name members createdAt invitations'
    );

  if (!adminUser?.organization) {
    throw new Error('Organization not found');
  }

  // Fetch other users in the organization (excluding the admin)
  const users = await User.find({
    organization: adminUser.organization._id,
    _id: { $ne: adminUser._id }
  }).select('name email pseudo_name pseudo_email role createdAt');

  // Fetch tasks with populated assignedTo and createdBy fields
  const tasks = await Task.find({ organization: adminUser.organization._id })
    .populate<{ assignedTo: any[] }>('assignedTo', 'name email pseudo_name pseudo_email')
    .populate<{ createdBy: any }>('createdBy', 'name pseudo_name email pseudo_email')
    .lean();

  // Calculate invitation statistics for the organization.
  const orgInvitations = adminUser.organization.invitations || [];
  const acceptedInvitations = orgInvitations.filter(inv => inv.used && inv.acceptedAt);
  const avgAcceptanceTimeMs =
    acceptedInvitations.length > 0
      ? acceptedInvitations.reduce((acc, inv) => (
          acc +
          (new Date(inv.acceptedAt!).getTime() - new Date(inv.createdAt).getTime())
        ), 0) / acceptedInvitations.length
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
        total: tasks.filter(task =>
          task.assignedTo.some((u: any) => u._id.equals(user._id))
        ).length,
        pending: tasks.filter(task =>
          task.status === 'pending' &&
          task.assignedTo.some((u: any) => u._id.equals(user._id))
        ).length,
        completed: tasks.filter(task =>
          task.status === 'completed' &&
          task.assignedTo.some((u: any) => u._id.equals(user._id))
        ).length
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
        assigned_to: task.assignedTo.map((u: any) => ({
          name: u.name,
          email: u.email
        })),
        attachments: task.attachments,
        total_todos: task.todoChecklist.length,
        completed_todos: task.todoChecklist.filter((t: any) => t.completed).length
      },
      pseudo_data: {
        created_by: task.createdBy.pseudo_name,
        assigned_to: task.assignedTo.map((u: any) => ({
          pseudo_name: u.pseudo_name,
          pseudo_email: u.pseudo_email
        })),
        attachments: task.pseudo_attachments.map((a: string, i: number) => ({
          pseudo_id: a,
          real_value: task.attachments[i] || 'unknown'
        })),
        todos: task.todoChecklist.map((todo: any) => ({
          pseudo_id: `todo_${crypto.randomBytes(3).toString('hex')}`,
          text: todo.text,
          completed: todo.completed
        }))
      }
    }))
  };


  await redis.set(cacheKey, JSON.stringify(response), { ex: 3600 });
  return response;
}



export const chatbot = async (req: Request, res: Response): Promise<void> => {
  try {

    if (typeof req.body.message !== 'string') {
      throw new Error('Invalid input type');
    }

    const data = await fetchOrganizationData(req.user?.id as string);
    const originalMessage = req.body.message || '';

    // Validate and sanitize the original user input
    const safeOriginalMessage = validateInput(originalMessage);
    // Reject the request if sanitization altered the message (indicating a possible injection attempt)
    if (safeOriginalMessage !== originalMessage) {
      throw new Error('Invalid input detected');
    }

    const greetingRegex = /^(hey|hello|hi|good morning|good afternoon)\b/i;
    if (greetingRegex.test(safeOriginalMessage.trim()) || safeOriginalMessage.trim() === '') {
      const greetingResponsePseudo = `Hey ${data.organization.pseudo_data.admin_pseudo.pseudo_name}, how may I assist you today?`;
      const greetingResponseReal = replacePseudoWithReal(greetingResponsePseudo, data);
      res.status(200).json({ response: greetingResponseReal });
      return;
    }

    const securedData = secureContextData(data);
    // Convert the real message into a pseudo context.
    const pseudoMessage = replaceRealWithPseudo(safeOriginalMessage, data);

    // Build the pseudo data context for the AI.
    const pseudoData = {
      organization: data.organization.pseudo_data,
      members: data.members.map((member: any) => ({
        pseudo_name: member.pseudo_data.pseudo_name,
        pseudo_email: member.pseudo_data.pseudo_email,
        created_at: member.real_data.created_at,
        role: member.role,
        task_stats: member.task_stats
      })),
      tasks: data.tasks.map((task: any) => ({
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

    // Include the safety prompt in the system instructions.
    const instructions = `${SAFETY_PROMPT}
You are ${securedData.organization.pseudo_data.pseudo_name}'s personal AI assistant.
If a user asks about any topic outside ${securedData.organization.pseudo_data.pseudo_name}, respond with:
"I am ${securedData.organization.pseudo_data.pseudo_name}'s personal AI assistant and I can’t answer anything outside ${securedData.organization.pseudo_data.pseudo_name}."`;

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

    const result = await chatSession.sendMessage(fullMessage);
    const pseudoResponse = result.response.text();
    console.log(pseudoResponse)

    // Validate and sanitize the AI's pseudo response before converting back to real values.
    const safePseudoResponse = validateInput(pseudoResponse);
   
    const finalResponse = replacePseudoWithReal(safePseudoResponse, data);
    res.status(200).json({ response: finalResponse });
  } catch (error: any) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};