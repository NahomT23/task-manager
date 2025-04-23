import { Request, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import redis from '../config/upstashRedis';


interface IUserPayload {
  _id: string;
  role: string;
  organization: string;
}


export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.user as unknown as IUserPayload;
    const organizationId = userPayload.organization;


    const cacheKey = `users:${organizationId}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log('USERS data hit');
      if (typeof cachedData === 'string') {
        const parsedData = JSON.parse(cachedData) as { usersWithTasks: any };
        res.status(200).json(parsedData.usersWithTasks);
      } else {

        const data = cachedData as { usersWithTasks: any };
        res.status(200).json(data.usersWithTasks);
      }
      return;
    } else {
      console.log("cache on USERS missed");
    }
    
    
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

    await redis.set(cacheKey, JSON.stringify({ usersWithTasks}), { ex: 3600 })

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
    

    await Promise.all([
      redis.del(`users:${organizationId}`),
    ])

    const tasks = await Task.find({ assignedTo: userId });
    tasks.forEach(async (task) => {
      await redis.del(`task:${organizationId}:${task._id}`);
    });

    await user. deleteOne();
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
