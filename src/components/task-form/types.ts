
import { z } from "zod";

// Define separate types for task and product idea statuses
const taskStatusSchema = z.enum(["backlog", "ready", "in_progress", "review", "done", "archived"]);
const productIdeaStatusSchema = z.enum(["proposed", "under_review", "approved", "rejected", "implemented", "archived"]);

// Combined schema that allows either task or product idea statuses
const combinedStatusSchema = z.union([taskStatusSchema, productIdeaStatusSchema]);

export const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  epic: z.string().optional(),
  assignee: z.string().optional(),
  assignee_type: z.enum(["developer", "product", "scrum", "other"]).optional(),
  estimation: z.coerce.number().min(0).default(1),
  priority: z.enum(["low", "medium", "high"]),
  status: combinedStatusSchema.optional(),
  assigned_date: z.date().optional().nullable(),
  completion_date: z.date().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type ProductIdeaStatus = z.infer<typeof productIdeaStatusSchema>;

export const defaultFormValues: Partial<TaskFormValues> = {
  priority: "medium",
  estimation: 1,
  status: "backlog",
  assigned_date: null,
  completion_date: null,
  assignee_type: "developer", // Set default assignee type
};
