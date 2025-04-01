import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Task from '../models/Task';

interface IUserPayload {
  _id: string;
  role: string;
  organization: string;
}


export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.user as unknown as IUserPayload;
    const organizationId = userPayload.organization;


    const users = await User.find({ organization: organizationId })
      .select('-password') // Exclude passwords
      .lean();


    const allTasks = await Task.find({ organization: organizationId });


    const usersWithTasks = users.map(user => {
      const userTasks = allTasks.filter(task => 
        task.assignedTo.includes(user._id)
      );


      return {
        ...user,
        pendingTasks: userTasks.filter(t => t.status === 'pending').length,
        inProgressTasks: userTasks.filter(t => t.status === 'inProgress').length,
        completedTasks: userTasks.filter(t => t.status === 'completed').length
      };
    });

    res.status(200).json(usersWithTasks);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.user as unknown as IUserPayload;
    const organizationId = userPayload.organization;
    const userId = req.params.id;

    // 1. Find the user in the organization
    const user = await User.findOne({
      _id: userId,
      organization: organizationId
    }).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found in your organization' });
      return;
    }

    // 2. Find all tasks assigned to this user with full details
    const tasks = await Task.find({
      assignedTo: user._id,
      organization: organizationId
    })
    .populate('assignedTo createdBy', 'name email profileImageUrl')
    .sort({ dueDate: 1 })

    // 3. Count tasks by status
    const taskCounts = {
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'inProgress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };


    const response = {
      user: user.toObject(),
      taskStats: taskCounts,
      tasks: tasks.map(task => ({
        _id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        progress: task.progress,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        attachments: task.attachments,
        todoChecklist: task.todoChecklist,
        createdAt: task.createdAt
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE A USER FROM MY ORGANIZATION
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.user as unknown as IUserPayload;
    const organizationId = userPayload.organization;
    const userId = req.params.id;
    

    const user = await User.findOne({ _id: userId, organization: organizationId });
    if (!user) {
      res.status(404).json({ message: 'User not found in your organization' });
      return;
    }
    
    await user. deleteOne();
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
