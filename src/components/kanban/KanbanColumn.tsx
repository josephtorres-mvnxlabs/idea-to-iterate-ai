
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { KanbanColumnProps } from "./types";

export function KanbanColumn({ title, tasks, onEditTask }: KanbanColumnProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="outline" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div className="kanban-column space-y-3">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={() => onEditTask(task)}
          />
        ))}
      </div>
    </div>
  );
}
