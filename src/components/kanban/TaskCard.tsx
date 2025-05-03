
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { TaskCardProps } from "./types";

// Helper function for status color and label
export function getStatusColor(status: string) {
  switch (status) {
    case "todo":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "inProgress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "done":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case "todo":
      return "To Do";
    case "inProgress":
      return "In Progress";
    case "done":
      return "Done";
    default:
      return status;
  }
}

export function TaskCard({ task, listView, onEdit }: TaskCardProps) {
  const statusColor = getStatusColor(task.status);
  
  return (
    <Card className="task-card relative group hover:shadow-md transition-all border-l-4 border-l-devops-purple">
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit();
            }}
          >
            <Pencil className="h-3 w-3" />
            <span className="sr-only">Edit</span>
          </Button>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <Badge variant="outline" className={`text-xs ${statusColor}`}>
            {getStatusLabel(task.status)}
          </Badge>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{task.estimation}d</span>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-devops-purple/80 text-white">
                {task.assignee.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </Card>
  );
}
