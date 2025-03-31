import { z } from "zod";

const priorityEnum = ["low", "medium", "high"] as const;

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(priorityEnum).default("low"),
  status: z.enum(["pending", "inProgress", "completed"]).default("pending"),
  dueDate: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date()).optional(),
  
  assignedTo: z.array(z.string()).min(1, "At least one assignee is required"),
  todoChecklist: z.array(z.object({
    text: z.string().min(1, "Checklist item cannot be empty"),
    completed: z.boolean().default(false)
  })).min(1, "At least one checklist item is required"),
  attachments: z.array(z.string().url("Invalid URL")).default([]),
  progress: z.number().min(0).max(100)
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

