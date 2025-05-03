
import { ReactNode } from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "inProgress" | "done";
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
