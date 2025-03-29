
import { Request, Response } from "express";
import Task from "../models/Task";

// Returns a summary of tasks for the organization (for admin dashboard)
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // Assuming req.user.organization is set by your auth middleware
    const organizationId = req.user!.organization;
    if (!organizationId) {
      res.status(400).json({ message: "Organization not found." });
      return;
    }
    
    // Aggregate tasks by status within the organization
    const summary = await Task.aggregate([
      { $match: { organization: organizationId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    
    res.status(200).json({ summary });
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
    if (!organizationId) {
      res.status(400).json({ message: "Organization not found." });
      return;
    }
    const tasks = await Task.find({ organization: organizationId }).populate("assignedTo createdBy", "-password");
    res.status(200).json({ tasks });
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
    const task = await Task.findOne({ _id: id, organization: organizationId }).populate("assignedTo createdBy", "-password");
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
    // Expect task details in req.body
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

    // Use the organization from the logged-in admin user
    const organization = req.user!.organization;
    if (!organization) {
      res.status(400).json({ message: "Organization not found." });
      return;
    }

    const newTask = new Task({
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
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
