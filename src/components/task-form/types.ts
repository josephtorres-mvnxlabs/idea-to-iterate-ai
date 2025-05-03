
import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  epic: z.string().optional(),
  assignee: z.string().optional(),
  estimation: z.coerce.number().min(0).default(1),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["backlog", "ready", "in_progress", "review", "done"]).optional(),
  assigned_date: z.date().optional().nullable(),
  completion_date: z.date().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const defaultFormValues: Partial<TaskFormValues> = {
  priority: "medium",
  estimation: 1,
  status: "backlog",
  assigned_date: null,
  completion_date: null,
};
