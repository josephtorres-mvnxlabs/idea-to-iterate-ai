
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
      return "bg-devops-gray/20";
    case "inProgress":
      return "bg-devops-yellow/20 border-devops-yellow";
    case "done":
      return "bg-devops-green/20 border-devops-green";
    default:
      return "bg-devops-gray/20";
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
  return (
    <Card className={`task-card relative group ${listView ? 'flex justify-between items-center p-3' : 'p-4'}`}>
      <div className="w-full">
        <div className={`flex ${listView ? 'items-center' : 'flex-col space-y-2'}`}>
          <div className={`${listView ? 'flex-1' : 'w-full'}`}>
            <h4 className="font-medium">{task.title}</h4>
            {(!listView || task.description) && (
              <p className={`text-xs text-muted-foreground ${listView ? 'hidden sm:inline ml-2' : 'mt-1'}`}>
                {task.description || "No description"}
              </p>
            )}
          </div>
          
          <div className={`flex ${listView ? 'items-center space-x-4 ml-2' : 'justify-between mt-3'}`}>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={task.status === "done" ? "outline" : "outline"} 
                className={`text-xs ${task.status === "done" ? "bg-devops-green/20 text-devops-green border-devops-green" : ""}`}
              >
                {getStatusLabel(task.status)}
              </Badge>
              {task.status === "done" && task.actual !== undefined && (
                <span className={`text-xs ${task.actual <= task.estimation ? 'text-devops-green' : 'text-devops-red'}`}>
                  {task.actual} / {task.estimation} days
                </span>
              )}
              {task.status !== "done" && (
                <span className="text-xs text-muted-foreground">
                  Est: {task.estimation} days
                </span>
              )}
            </div>
            
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-devops-purple-light text-white">
                {task.assignee.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      
      {/* Edit button - made more visible */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          if (onEdit) onEdit();
        }}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit task</span>
      </Button>
    </Card>
  );
}
