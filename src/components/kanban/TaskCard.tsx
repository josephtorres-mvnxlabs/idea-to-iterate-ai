
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskCardProps } from "./types";

export function TaskCard({ task, onEdit }: TaskCardProps) {
  // Handle drag start event to set the task ID as data
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.currentTarget.classList.add("opacity-50");
  };
  
  // Handle drag end event to reset styling
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("opacity-50");
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div 
      className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow border cursor-pointer"
      onClick={onEdit}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
        <Badge className={`ml-1 ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </Badge>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center">
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/10 text-xs">
                {task.assignee.initials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <div className="text-xs text-gray-400">
          {task.estimation} days
        </div>
      </div>
    </div>
  );
}
