import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User';
import Task from '../models/Task';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { configDotenv } from 'dotenv';
import { replacePseudoWithReal, replaceRealWithPseudo } from '../services/chatbotService';
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


async function fetchOrganizationData(userId: string) {
    const adminUser = await User.findById(userId)
      .select('role organization pseudo_name pseudo_email name email createdAt')
      .populate<{ organization: PopulatedOrganization }>(
        'organization',
        'name pseudo_name members createdAt invitations'
      );
  
    if (!adminUser?.organization) {
      throw new Error('Organization not found');
    }
  
    const users = await User.find({
      organization: adminUser.organization._id,
      _id: { $ne: adminUser._id }
    }).select('name email pseudo_name pseudo_email role createdAt');
  
    const tasks = await Task.find({ organization: adminUser.organization._id })
      .populate<{ assignedTo: any[] }>('assignedTo', 'name email pseudo_name pseudo_email')
      .populate<{ createdBy: any }>('createdBy', 'name pseudo_name email pseudo_email')
      .lean();
  
    // Calculate invitation statistics
    const orgInvitations = adminUser.organization.invitations || [];
    const acceptedInvitations = orgInvitations.filter(inv => inv.used && inv.acceptedAt);
    const avgAcceptanceTimeMs =
      acceptedInvitations.length > 0
        ? acceptedInvitations.reduce((acc, inv) => {
            return (
              acc +
              (new Date(inv.acceptedAt!).getTime() - new Date(inv.createdAt).getTime())
            );
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
  
    return response;
}
 
export const chatbot = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await fetchOrganizationData(req.user?.id as string);
      const originalMessage = req.body.message || '';
  

      const greetingRegex = /^(hey|hello|hi|good morning|good afternoon)\b/i;
      if (greetingRegex.test(originalMessage.trim()) || originalMessage.trim() === '') {
        const greetingResponsePseudo = `Hey ${data.organization.pseudo_data.admin_pseudo.pseudo_name}, how may I assist you today?`;
        const greetingResponseReal = replacePseudoWithReal(greetingResponsePseudo, data);
        res.status(200).json({ response: greetingResponseReal });
        return;
      }
      // Convert the real message into a pseudo context.
      const pseudoMessage = replaceRealWithPseudo(originalMessage, data);
  
      // Build the pseudo data context for the AI.
      const pseudoData = {
        organization: data.organization.pseudo_data,
        members: data.members.map((member: any) => ({
          pseudo_name: member.pseudo_data.pseudo_name,
          pseudo_email: member.pseudo_data.pseudo_email,
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
  
      const result = await chatSession.sendMessage(fullMessage);
      const pseudoResponse = result.response.text();
      
      // Convert the AI's pseudo response back into real values.
      console.log(pseudoResponse)
      const finalResponse = replacePseudoWithReal(pseudoResponse, data);
      res.status(200).json({ response: finalResponse });
    } catch (error: any) {
      console.error('API Error:', error.message);
      res.status(500).json({ error: 'Failed to generate response' });
    }
};
  

