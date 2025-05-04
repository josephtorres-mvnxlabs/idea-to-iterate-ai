
import { ReactNode } from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "inProgress" | "done" | "archived";
  estimation: number;
  actual?: number;
  assignee: {
    id?: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  epic: string;
  priority?: "low" | "medium" | "high";
  assigned_date?: string;
  completion_date?: string;
  team_members?: string[]; // Added team_members property
}

export interface TaskCardProps {
  task: Task;
  listView?: boolean;
  onEdit?: () => void;
}

export interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDrop?: (taskId: string, newStatus: "todo" | "inProgress" | "done") => void;
  status?: "todo" | "inProgress" | "done";
}

export interface KanbanBoardProps {
  selectedEpic?: string;
  viewMode: "kanban" | "list";
}

export interface EpicProgress {
  progress: number;
  completed: number;
  total: number;
}
