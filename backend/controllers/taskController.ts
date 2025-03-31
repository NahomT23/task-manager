
import { Request, Response } from "express";
import Task from "../models/Task";


// Returns a summary of tasks for the organization (for admin dashboard)
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // Ensure the organization exists from the authenticated user
    const organizationId = req.user!.organization;
    if (!organizationId) {
      res.status(400).json({ message: "Organization not found." });
      return;
    }

    // Aggregate tasks by status within the organization
    const statusAggregation = await Task.aggregate([
      { $match: { organization: organizationId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Prepare status counts
    let allCount = 0;
    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    statusAggregation.forEach((item) => {
      allCount += item.count;
      const status = item._id.toString().toLowerCase();
      if (status === "pending") {
        pendingCount = item.count;
      } else if (status === "in progress" || status === "inprogress") {
        inProgressCount = item.count;
      } else if (status === "completed") {
        completedCount = item.count;
      }
    });

    // Aggregate tasks by priority within the organization
    const priorityAggregation = await Task.aggregate([
      { $match: { organization: organizationId } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Prepare priority counts
    let lowCount = 0;
    let mediumCount = 0;
    let highCount = 0;

    priorityAggregation.forEach((item) => {
      const priority = item._id.toString().toLowerCase();
      if (priority === "low") {
        lowCount = item.count;
      } else if (priority === "medium") {
        mediumCount = item.count;
      } else if (priority === "high") {
        highCount = item.count;
      }
    });

    // Retrieve recent tasks (e.g., the 5 most recent tasks)
    const recentTasks = await Task.find({ organization: organizationId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id title status priority createdAt");

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
    console.error("Error in getDashboardData:", error);
    res.status(500).json({ message: "Server error." });
  }
};


// Returns tasks assigned to the logged-in user
export const getUserDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const tasks = await Task.find({ assignedTo: userId });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error in getUserDashboardData:", error);
    res.status(500).json({ message: "Server error." });
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
// Creates a new task (admin only)
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
    res.status(201).json({ task: savedTask });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: "Server error." });
  }
};



// Updates task details
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organization;
    // Ensure task belongs to the same organization
    const task = await Task.findOne({ _id: id, organization: organizationId });
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    
    // Update allowed fields
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
    // Ensure task belongs to the organization
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
    const { status } = req.body; // new status value
    const organizationId = req.user!.organization;

    // Validate allowed status values if needed
    const allowedStatus = ["pending", "in progress", "completed"];
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

// Updates the todo checklist of a task
export const updateTaskCheckList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { todoChecklist } = req.body; // expected to be an array of checklist items
    const organizationId = req.user!.organization;

    const task = await Task.findOneAndUpdate(
      { _id: id, organization: organizationId },
      { todoChecklist },
      { new: true }
    );

    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error("Error in updateTaskCheckList:", error);
    res.status(500).json({ message: "Server error." });
  }
};
