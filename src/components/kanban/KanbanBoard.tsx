
import * as React from "react";
import { TaskCard } from "./TaskCard";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanBoardProps, Task as UITask } from "./types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { useQuery } from "@tanstack/react-query";
import { taskApi } from "@/services/api";
import { Task as DBTask } from "@/models/database";

// Mapping function to convert database task to UI task
const mapDatabaseTaskToUITask = (dbTask: DBTask): UITask => {
  // Helper to extract initials
  const getInitials = (name: string) => 
    name.split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  
  // Map database status to UI status
  const mapStatus = (dbStatus: string): "todo" | "inProgress" | "done" => {
    switch(dbStatus) {
      case "backlog":
      case "ready":
        return "todo";
      case "in_progress":
      case "review":
        return "inProgress";
      case "done":
        return "done";
      default:
        return "todo"; // Default case
    }
  };
  
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: mapStatus(dbTask.status), // Fixed: Use dbTask.status instead of undefined dbStatus
    estimation: dbTask.estimation,
    // Safely handle assignee data
    assignee: {
      name: dbTask.assignee_id ? "Assigned User" : "Unassigned", // This would ideally come from actual user data
      initials: dbTask.assignee_id ? "AU" : "UA", // This would ideally be generated from user name
      ...(dbTask.assignee_id && { id: dbTask.assignee_id }),
    },
    // Extract epic ID and title
    epic: dbTask.epic_id || "",
    priority: dbTask.priority || "medium",
  };
};

export function KanbanBoard({ selectedEpic, viewMode = "kanban" }: KanbanBoardProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<UITask | null>(null);

  // Get tasks from API and map them to UI model
  const { data: dbTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { epic: selectedEpic }],
    queryFn: () => taskApi.getAll(), // Removed the argument as the function doesn't expect one
  });

  // Map database tasks to UI tasks and filter by selected epic if needed
  const tasks = React.useMemo(() => {
    // First map the database tasks to UI format
    const mappedTasks = dbTasks.map(mapDatabaseTaskToUITask);
    
    // Then filter by selectedEpic if one is specified
    if (selectedEpic) {
      return mappedTasks.filter(task => task.epic === selectedEpic);
    }
    
    return mappedTasks;
  }, [dbTasks, selectedEpic]);

  const todoTasks = tasks.filter(task => task.status === "todo");
  const inProgressTasks = tasks.filter(task => task.status === "inProgress");
  const doneTasks = tasks.filter(task => task.status === "done");

  const handleEditTask = (task: UITask) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleTaskDialogClose = () => {
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return <div className="py-10 text-center">Loading tasks...</div>;
  }

  if (viewMode === "list") {
    // List view implementation
    return (
      <div className="mt-4">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 pl-4">Title</th>
              <th className="text-left p-2">Assignee</th>
              <th className="text-left p-2">Epic</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Est.</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-muted-foreground">
                  No tasks found. Create your first task!
                </td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr 
                  key={task.id} 
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleEditTask(task)}
                >
                  <td className="p-2 pl-4">{task.title}</td>
                  <td className="p-2">
                    <div className="flex items-center">
                      {task.assignee.avatar ? (
                        <img 
                          src={task.assignee.avatar} 
                          alt={task.assignee.name} 
                          className="w-6 h-6 rounded-full mr-2" 
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs mr-2">
                          {task.assignee.initials}
                        </div>
                      )}
                      <span>{task.assignee.name}</span>
                    </div>
                  </td>
                  <td className="p-2">{task.epic}</td>
                  <td className="p-2">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs
                      ${task.status === "todo" ? "bg-orange-100 text-orange-800" : 
                        task.status === "inProgress" ? "bg-blue-100 text-blue-800" : 
                        "bg-green-100 text-green-800"}
                    `}>
                      {task.status === "inProgress" ? "In Progress" : 
                        task.status === "todo" ? "To Do" : "Done"}
                    </div>
                  </td>
                  <td className="p-2">{task.estimation} days</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Task Edit Dialog */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <TaskSubmissionForm 
              onSuccess={handleTaskDialogClose} 
              onCancel={handleTaskDialogClose} 
              taskValues={editingTask ? {
                title: editingTask.title,
                description: editingTask.description || "",
                epic: editingTask.epic,
                assignee: editingTask.assignee?.id || "",
                estimation: editingTask.estimation,
                priority: editingTask.priority || "medium"
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn 
          title="To Do" 
          tasks={todoTasks}
          onEditTask={handleEditTask}
        />
        <KanbanColumn 
          title="In Progress" 
          tasks={inProgressTasks}
          onEditTask={handleEditTask}
        />
        <KanbanColumn 
          title="Done" 
          tasks={doneTasks}
          onEditTask={handleEditTask}
        />
      </div>

      {/* Task Edit Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <TaskSubmissionForm 
            onSuccess={handleTaskDialogClose} 
            onCancel={handleTaskDialogClose} 
            taskValues={editingTask ? {
              title: editingTask.title,
              description: editingTask.description || "",
              epic: editingTask.epic,
              assignee: editingTask.assignee?.id || "",
              estimation: editingTask.estimation,
              priority: editingTask.priority || "medium"
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
