import { Request, Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import { taskAssignedTemplate, taskCompletedTemplate } from "../templates/emailTemplate";
import { sendEmail } from "../config/mailer";
import { configDotenv } from "dotenv";

configDotenv();


// Returns a summary of tasks for the organization (for admin dashboard)
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organization;
    if (!organizationId) {
      res.status(400).json({ message: "Organization not found." });
      return;
    }

    // Count all tasks within the organization
    const allCount = await Task.countDocuments({ organization: organizationId });

    // Count tasks by status within the organization
    const pendingCount = await Task.countDocuments({ organization: organizationId, status: 'pending' });
    const inProgressCount = await Task.countDocuments({ organization: organizationId, status: 'inProgress' });
    const completedCount = await Task.countDocuments({ organization: organizationId, status: 'completed' });

    // Count tasks by priority within the organization
    const lowCount = await Task.countDocuments({ organization: organizationId, priority: 'low' });
    const mediumCount = await Task.countDocuments({ organization: organizationId, priority: 'medium' });
    const highCount = await Task.countDocuments({ organization: organizationId, priority: 'high' });

    // Retrieve the 5 most recent tasks within the organization
    const recentTasks = await Task.find({ organization: organizationId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id title status priority createdAt');

    res.status(200).json({
      charts: {
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
      },
      recentTasks,
    });
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Returns tasks assigned to the logged-in user
export const getUserDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;

    // Count all tasks assigned to the user
    const allCount = await Task.countDocuments({ assignedTo: userId });

    // Count tasks by status
    const pendingCount = await Task.countDocuments({ assignedTo: userId, status: 'pending' });
    const inProgressCount = await Task.countDocuments({ assignedTo: userId, status: 'inProgress' });
    const completedCount = await Task.countDocuments({ assignedTo: userId, status: 'completed' });

    // Count tasks by priority
    const lowCount = await Task.countDocuments({ assignedTo: userId, priority: 'low' });
    const mediumCount = await Task.countDocuments({ assignedTo: userId, priority: 'medium' });
    const highCount = await Task.countDocuments({ assignedTo: userId, priority: 'high' });

    // Retrieve recent tasks assigned to the user
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id title status priority createdAt');

    res.status(200).json({
      charts: {
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
      },
      recentTasks,
    });
  } catch (error) {
    console.error('Error in getUserDashboardData:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Returns all tasks for the user's organization.
// Admins and members see tasks for their organization.
export const getTasks = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user!.organization;
    const { status } = req.query;

    if (!organizationId) {
      res.status(400).json({ message: "Organization not found." });
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

    // Fetch all tasks assigned to the user
    const tasks = await Task.find(filter).populate("assignedTo createdBy", "-password");

    // Optionally, build a status summary if needed
    const statusSummary = {
      All: tasks.length,
      pending: tasks.filter(task => task.status === "pending").length,
      inProgress: tasks.filter(task => task.status === "inProgress").length,
      completed: tasks.filter(task => task.status === "completed").length,
    };

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
      
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    res.status(200).json({ task });
  } catch (error) {
    console.error("Error in getTasksById:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// // Creates a new task (admin only)
// export const createTask = async (req: Request, res: Response) => {
//   try {

//     const {
//       title,
//       description,
//       priority,
//       status,
//       dueDate,
//       assignedTo,
//       attachments,
//       todoChecklist,
//       progress,
//     } = req.body;


//     const organization = req.user!.organization;
//     if (!organization) {
//       res.status(400).json({ message: "Organization not found." });
//       return;
//     }

//     const assignedArray = Array.isArray(assignedTo) ? 
//     assignedTo : 
//     [assignedTo].filter(Boolean);



//     const newTask = new Task({
//       title,
//       description,
//       priority,
//       status: "pending",
//       dueDate,
//       assignedTo: assignedArray,
//       createdBy: req.user!._id,
//       attachments,
//       todoChecklist,
//       progress,
//       organization,
//     });

//     const savedTask = await newTask.save();



//         // Send assignment emails
//         const assignedUsers = await User.find({ _id: { $in: assignedArray } });
//         const adminEmail = process.env.ADMIN_EMAIL;
    
//         assignedUsers.forEach(async (user) => {
//           const emailHtml = `
//             <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
//               <h2 style="color: #2c3e50;">New Task Assignment</h2>
//               <p>Hello ${user.name},</p>
//               <p>You've been assigned a new task:</p>
//               <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//                 <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Title:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${title}</td></tr>
//                 <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Description:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${description}</td></tr>
//                 <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Due Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${dueDate}</td></tr>
//                 <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Priority:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${priority}</td></tr>
//               </table>
//               <p style="color: #3498db;">View Task: <a href="${process.env.FRONTEND_URL}/task/${savedTask._id}">Task Details</a></p>
//             </div>
//           `;
    
//           try {
//             await sendEmail({
//               to: user.email,
//               subject: `New Task Assigned: ${title}`,
//               html: emailHtml
//             });
//           } catch (emailError) {
//             console.error('Email send failed:', emailError);
//           }
//         });

//     res.status(201).json({ task: savedTask });
//   } catch (error) {
//     console.error("Error in createTask:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

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

    // Compute the new status based on the updated todo checklist
    const completedCount = todoChecklist.filter((todo: { completed: boolean }) => todo.completed).length;
    let newStatus: "pending" | "inProgress" | "completed" = "pending";
    if (completedCount === todoChecklist.length) {
      newStatus = "completed";
    } else if (completedCount > 0) {
      newStatus = "inProgress";
    }

    // Update both the todo checklist and the status together
    const task = await Task.findOneAndUpdate(
      { _id: id, organization: organizationId },
      { todoChecklist, status: newStatus },
      { new: true }
    );

    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    if (newStatus === 'completed') {
      const task = await Task.findById(id).populate('assignedTo'); 
      const adminUsers = await User.find({
        organization: task?.organization, 
        role: 'admin'
      });
  
      const userNames = task?.assignedTo?.filter(user => user !== null).map(user => (user as any).name) || [];
      
      const emailHtml = taskCompletedTemplate(task, userNames, process.env.FRONTEND_URL || '');



      adminUsers.forEach(async (admin) => {
        try {
          await sendEmail({
            to: admin.email,
            subject: `Task Completed: ${task?.title}`,
            html: emailHtml
          });
        } catch (emailError) {
          console.error(`Failed to notify admin ${admin.email}:`, emailError);
        }
      });
    }

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
    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Updates the status of a task
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user!.organization;

    const allowedStatus = ["pending", "inProgress", "completed"];
    if (!allowedStatus.includes(status)) {
      res.status(400).json({ message: "Invalid status value." });
      return;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, organization: organizationId },
      { status },
      { new: true }
    );

    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error("Error in updateTaskStatus:", error);
    res.status(500).json({ message: "Server error." });
  }
};


