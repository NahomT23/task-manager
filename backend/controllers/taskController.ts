import { Request, Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import { taskAssignedTemplate, taskCompletedTemplate } from "../templates/emailTemplate";
import { sendEmail } from "../config/mailer";
import { configDotenv } from "dotenv";
import redisClient from '../config/upstashRedis'
configDotenv();

// Returns a summary of tasks for the organization (for admin dashboard)
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organization;
    if (!organizationId) {
      res.status(400).json({ message: "Organization not found." });
      return;
    }

    const cacheKey = `adminData:${organizationId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("✅ Redis HIT ON ADMIN DASHBOARD DATA - data found in cache");
      res.status(200).json({
        message: "Dashboard data retrieved from cache",
        ...cachedData,
      });
      return;
    }


    const [allCount, pendingCount, inProgressCount, completedCount] = await Promise.all([
      Task.countDocuments({ organization: organizationId }),
      Task.countDocuments({ organization: organizationId, status: "pending" }),
      Task.countDocuments({ organization: organizationId, status: "inProgress" }),
      Task.countDocuments({ organization: organizationId, status: "completed" }),
    ]);

    const [lowCount, mediumCount, highCount] = await Promise.all([
      Task.countDocuments({ organization: organizationId, priority: "low" }),
      Task.countDocuments({ organization: organizationId, priority: "medium" }),
      Task.countDocuments({ organization: organizationId, priority: "high" }),
    ]);

    const recentTasks = await Task.find({ organization: organizationId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id title status priority createdAt");

    const charts = {
      taskDistribution: {
        All: allCount,
        Pending: pendingCount,
        InProgress: inProgressCount,
        Completed: completedCount,
      },
      taskPriorityLevels: {
        Low: lowCount,
        Medium: mediumCount,
        High: highCount,
      },
    };

    await redisClient.set(cacheKey, { charts, recentTasks }, { ex: 3600 });

    res.status(200).json({ charts, recentTasks });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Returns tasks assigned to the logged-in user
export const getUserDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;

    const cacheKey = `memberData:${userId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("✅ Redis HIT ON MEMBER DASHBOARD DATA - data found in cache");
      res.status(200).json({
        message: "Dashboard data retrieved from cache",
        ...cachedData,
      });
      return;
    }

    console.log("❌ Redis MISS ON MEMBER DASHBOARD DATA - computing fresh");

    // Count tasks by status
    const [allCount, pendingCount, inProgressCount, completedCount] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'pending' }),
      Task.countDocuments({ assignedTo: userId, status: 'inProgress' }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' }),
    ]);

    // Count tasks by priority
    const [lowCount, mediumCount, highCount] = await Promise.all([
      Task.countDocuments({ assignedTo: userId, priority: 'low' }),
      Task.countDocuments({ assignedTo: userId, priority: 'medium' }),
      Task.countDocuments({ assignedTo: userId, priority: 'high' }),
    ]);

    // Recent tasks
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id title status priority createdAt');

    const charts = {
      taskDistribution: {
        All: allCount,
        Pending: pendingCount,
        InProgress: inProgressCount,
        Completed: completedCount,
      },
      taskPriorityLevels: {
        Low: lowCount,
        Medium: mediumCount,
        High: highCount,
      },
    };


    await redisClient.set(cacheKey, { charts, recentTasks }, { ex: 3600 });

    res.status(200).json({ charts, recentTasks });
    return;
  } catch (error) {
    console.error('Error in getUserDashboardData:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admins get all the tasks in his organization.
export const getTasks = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user!.organization;
    const { status } = req.query;


    if (!organizationId) {
      res.status(400).json({ message: "Organization not found." });
      return;
    }

    const cacheKey = `allTaskData:${organizationId}`
    
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      console.log("✅ Redis HIT ON TASKS - data found in cache");
      res.status(200).json({
        message: "Task data retrieved from cache",
        ...cachedData,
      });
      return;
    }


    const filter: any = { organization: organizationId };
    
    if (status && status !== "All") {
      filter.status = status;
    }

    // Get tasks with status count summary
    const [tasks, statusSummary] = await Promise.all([
      Task.find(filter).populate("assignedTo createdBy", "-password"),
      Task.aggregate([
        { $match: { organization: organizationId } },
        {
          $facet: {
            all: [{ $count: "count" }],
            pending: [{ $match: { status: "pending" } }, { $count: "count" }],
            inProgress: [{ $match: { status: "inProgress" } }, { $count: "count" }],
            completed: [{ $match: { status: "completed" } }, { $count: "count" }]
          }
        }
      ])
    ]);

    // Process status summary
    const summary = statusSummary[0];
    const statusCounts = {
      All: summary.all[0]?.count || 0,
      pending: summary.pending[0]?.count || 0,
      inProgress: summary.inProgress[0]?.count || 0,
      completed: summary.completed[0]?.count || 0
    };

    await redisClient.set(cacheKey, { tasks, statusSummary: statusCounts }, { ex: 3600 } )

    res.status(200).json({ 
      tasks,
      statusSummary: statusCounts
    });
    
  } catch (error) {
    console.error("Error in getTasks:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// for user to get his tasks
export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const { status } = req.query;

    const filter: any = { assignedTo: userId };
    if (status && status !== "All") {
      filter.status = status;
    }


    const cacheKey = `myTasks:${userId}:${status || "All"}`
    
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      console.log("✅ Redis HIT ON MY TASKS - data found in cache");
      res.status(200).json({
        message: "My Task data retrieved from cache",
        ...cachedData,
      });
      return;
    }

    

    // Fetch all tasks assigned to the user
    const tasks = await Task.find(filter).populate("assignedTo createdBy", "-password");

    // Optionally, build a status summary if needed
    const statusSummary = {
      All: tasks.length,
      pending: tasks.filter(task => task.status === "pending").length,
      inProgress: tasks.filter(task => task.status === "inProgress").length,
      completed: tasks.filter(task => task.status === "completed").length,
    };



    await redisClient.set(cacheKey, { tasks, statusSummary }, { ex: 3600 })

    res.status(200).json({ tasks, statusSummary });
  } catch (error) {
    console.error("Error in getMyTasks:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// get single task
export const getTasksById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organization;
    const task = await Task.findOne({ _id: id, organization: organizationId })
      .populate("assignedTo createdBy", "-password")
      .populate("attachments");

      const cacheKey = `task:${organizationId}:${id}`;

      const cachedData = await redisClient.get<{ task: any }>(cacheKey);
      if (cachedData) {
        console.log("✅ Redis HIT ON SINGLE TASKS - data found in cache");
        res.status(200).json({
          message: "Single Task data retrieved from cache",
          task: cachedData.task,
        });
        return;
      }

      console.log("❌ Redis MISS ON SINGLE TASK - fetching from DB");
      
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    await redisClient.set(cacheKey, { task }, { ex: 3600 })

    res.status(200).json({ task });
  } catch (error) {
    console.error("Error in getTasksById:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      progress,
    } = req.body;

    const organization = req.user!.organization;
    if (!organization) {
      res.status(400).json({ message: "Organization not found." });
      return;
    }

    const assignedArray = Array.isArray(assignedTo) ? 
      assignedTo : 
      [assignedTo].filter(Boolean);

    const newTask = new Task({
      title,
      description,
      priority,
      status: "pending",
      dueDate,
      assignedTo: assignedArray,
      createdBy: req.user!._id,
      attachments,
      todoChecklist,
      progress,
      organization,
    });

    const savedTask = await newTask.save();

    // Send assignment emails
    const assignedUsers = await User.find({ _id: { $in: assignedArray } });

    assignedUsers.forEach(async (user) => {
      const emailHtml = taskAssignedTemplate(savedTask, user.name, process.env.FRONTEND_URL || '');

      try {
        await sendEmail({
          to: user.email,
          subject: `New Task Assigned: ${title}`,
          html: emailHtml
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    });

    const statusVariants = ["All", "pending", "inProgress", "completed"];
    
await Promise.all([
  // clear single‐task caches
  redisClient.del(`task:${organization}`),
  redisClient.del(`task:${organization}:${savedTask._id}`),

  // clear admin caches
  redisClient.del(`adminData:${organization}`),
  redisClient.del(`allTaskData:${organization}`),

  // clear every variant of myTasks for each assigned user
  ...assignedArray.flatMap(uid =>
    statusVariants.map(status =>
      redisClient.del(`myTasks:${uid}:${status}`)
    )
  ),

  // clear the member dashboard cache too:
  ...assignedArray.map(uid =>
    redisClient.del(`memberData:${uid}`)
  ),
]);

    

    res.status(201).json({ task: savedTask });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// update task cehcklist
export const updateTaskCheckList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { todoChecklist } = req.body;
    const organizationId = req.user!.organization;

    // Calculate progress and status
    const totalTodos = todoChecklist.length;
    const completedCount = todoChecklist.filter((todo: { completed: boolean }) => todo.completed).length;
    const newProgress = totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;
    
    let newStatus: "pending" | "inProgress" | "completed" = "pending";
    if (completedCount === totalTodos) {
      newStatus = "completed";
    } else if (completedCount > 0) {
      newStatus = "inProgress";
    }

    // Update task with both progress and status
    const task = await Task.findOneAndUpdate(
      { _id: id, organization: organizationId },
      { 
        todoChecklist, 
        status: newStatus,
        progress: newProgress // Add progress update here
      },
      { new: true }
    );


    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    // If task is now completed, notify organization admins
    if (newStatus === 'completed') {
      // Use a distinct variable name to avoid shadowing
      const taskWithAssigned = await Task.findById(id).populate('assignedTo'); 
      
      // Get all admins for the task's organization
      let adminUsers = await User.find({
        organization: taskWithAssigned?.organization, 
        role: 'admin'
      });

      // Filter out the email account used for sending emails if it exists in adminUsers
      adminUsers = adminUsers.filter(admin => admin.email !== process.env.GMAIL_USER);

      // Extract names from the assigned users list (if any)
      const userNames = taskWithAssigned?.assignedTo
        ?.filter(user => user !== null)
        .map(user => (user as any).name) || [];
      
      const emailHtml = taskCompletedTemplate(
        taskWithAssigned,
        userNames,
        process.env.FRONTEND_URL || ''
      );

      // Correctly use a template literal for the subject line
      adminUsers.forEach(async (admin) => {
        try {
          await sendEmail({
            to: admin.email,
            subject: `Task Completed: ${taskWithAssigned?.title}`,
            html: emailHtml
          });
        } catch (emailError) {
          console.error(`Failed to notify admin ${admin.email}:`, emailError);
        }
      });
    }

    // Invalidate related Redis cache keys
    const statusVariants = ["All", "pending", "inProgress", "completed"];
    await Promise.all([
      redisClient.del(`task:${organizationId}`),
      redisClient.del(`task:${organizationId}:${id}`),
      redisClient.del(`adminData:${organizationId}`),
      redisClient.del(`allTaskData:${organizationId}`),
      ...(task.assignedTo || []).flatMap(uid =>
        statusVariants.map(status => redisClient.del(`myTasks:${uid.toString()}:${status}`))
      )
    ]);

    const userId  = req.user?._id

    await Promise.all([
      redisClient.del(`myTasks:${userId}:All`),
      redisClient.del(`myTasks:${userId}:pending`),
      redisClient.del(`myTasks:${userId}:inProgress`),
      redisClient.del(`myTasks:${userId}:completed`),
      redisClient.del(`memberData:${userId}`),
    ]);
    res.status(200).json({ task });
  } catch (error) {
    console.error("Error in updateTaskCheckList:", error);
    res.status(500).json({ message: "Server error." });
  }
};


// Updates task details
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organization;

    const task = await Task.findOne({ _id: id, organization: organizationId });
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    
    const updates = req.body;
    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });

    await Promise.all([
      redisClient.del(`task:${organizationId}`),
      redisClient.del(`task:${organizationId}:${id}`),
      redisClient.del(`adminData:${organizationId}`),
      redisClient.del(`allTaskData:${organizationId}`),
      ...(task?.assignedTo || []).map(uid =>
        redisClient.del(`myTasks:${uid.toString()}:All`)
      )
    ]);
    


    res.status(200).json({ task: updatedTask });
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Deletes a task by its ID
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organization;

    const task = await Task.findOne({ _id: id, organization: organizationId });
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    await task.deleteOne();

    const statusVariants = ["All", "pending", "inProgress", "completed"];
    const assignedUserIds = (task.assignedTo || []).map(user => user.toString());

    await Promise.all([
      redisClient.del(`task:${organizationId}`),
      redisClient.del(`task:${organizationId}:${id}`),
      redisClient.del(`adminData:${organizationId}`),
      redisClient.del(`allTaskData:${organizationId}`),
      ...assignedUserIds.flatMap(uid =>
        statusVariants.map(status => redisClient.del(`myTasks:${uid}:${status}`))
      )
    ]);
    

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user!.organization;


    const allowedStatus = ["pending", "inProgress", "completed"] as const;
    if (!allowedStatus.includes(status as typeof allowedStatus[number])) {
      res.status(400).json({ message: "Invalid status value." });
      return;
    }

    // update the task
    const task = await Task.findOneAndUpdate(
      { _id: id, organization: organizationId },
      { status },
      { new: true }
    ).lean();
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    const statusVariants = ["All", "pending", "inProgress", "completed"];
    const assignedUserIds = (task.assignedTo || []).map(u => u.toString());

    await Promise.all([
      redisClient.del(`task:${organizationId}`),
      redisClient.del(`task:${organizationId}:${id}`),

      redisClient.del(`adminData:${organizationId}`),
      redisClient.del(`allTaskData:${organizationId}`),

      ...assignedUserIds.flatMap(uid =>
        statusVariants.map(variant =>
          redisClient.del(`myTasks:${uid}:${variant}`)
        )
      ),
      ...assignedUserIds.map(uid =>
        redisClient.del(`memberData:${uid}`)
      ),
    ]);

 
    res.status(200).json({ task });
    return;
  } catch (error) {
    console.error("Error in updateTaskStatus:", error);
    res.status(500).json({ message: "Server error." });
    return;
  }
};



