
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { KanbanColumnProps } from "./types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KanbanColumn({ title, tasks, onEditTask }: KanbanColumnProps) {
  return (
    <div className="kanban-column bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="font-medium text-sm">{title}</h3>
          <Badge variant="outline" className="text-xs ml-2">
            {tasks.length}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 border border-dashed rounded-md bg-gray-50 text-muted-foreground text-sm">
            No tasks
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={() => onEditTask(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}
