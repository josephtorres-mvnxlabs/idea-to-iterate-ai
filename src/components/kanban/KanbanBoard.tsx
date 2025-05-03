
import * as React from "react";
import { ListTodo, Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanBoardProps, Task as UITask } from "./types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  
  // Debug logging
  console.log('Mapping task:', dbTask.id, dbTask.title, 'Epic ID:', dbTask.epic_id, 'Status:', dbTask.status);
  
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: mapStatus(dbTask.status),
    estimation: dbTask.estimation,
    // Safely handle assignee data
    assignee: {
      name: dbTask.assignee_id ? "Assigned User" : "Unassigned",
      initials: dbTask.assignee_id ? "AU" : "UA",
      ...(dbTask.assignee_id && { id: dbTask.assignee_id }),
    },
    // Extract epic ID and title - ensure we're using epic_id for filtering
    epic: dbTask.epic_id || "",
    priority: dbTask.priority || "medium",
    assigned_date: dbTask.assigned_date,
    completion_date: dbTask.completion_date,
  };
};

export function KanbanBoard({ selectedEpic, viewMode = "kanban" }: KanbanBoardProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingTask, setEditingTask] = React.useState<UITask | null>(null);

  console.log('KanbanBoard - Selected Epic:', selectedEpic);

  // Get tasks from API and map them to UI model
  const { data: dbTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', { epic: selectedEpic }],
    queryFn: () => {
      console.log('Fetching tasks for epic:', selectedEpic || 'all tasks');
      return taskApi.getAll();
    },
  });

  // Set loading state based on query loading state
  React.useEffect(() => {
    setIsLoading(isLoadingTasks);
  }, [isLoadingTasks]);

  // Map database tasks to UI tasks and filter by selected epic if needed
  const tasks = React.useMemo(() => {
    console.log('Database tasks received:', dbTasks.length, dbTasks);
    
    // First map the database tasks to UI format
    const mappedTasks = dbTasks.map(mapDatabaseTaskToUITask);
    console.log('Mapped tasks:', mappedTasks.length, mappedTasks);
    
    // Then filter by selectedEpic if one is specified
    if (selectedEpic) {
      console.log('Filtering by epic:', selectedEpic);
      const filteredTasks = mappedTasks.filter(task => {
        console.log('Task epic check:', task.id, task.title, 'Epic:', task.epic, 'Match:', task.epic === selectedEpic);
        return task.epic === selectedEpic;
      });
      console.log('Filtered tasks count:', filteredTasks.length);
      return filteredTasks;
    }
    
    return mappedTasks;
  }, [dbTasks, selectedEpic]);

  // Filter by status
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
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
          <ListTodo className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-2">
          {selectedEpic ? 
            `No tasks found for the selected epic` : 
            `No tasks found yet`}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsTaskDialogOpen(true)}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="mt-4 bg-white rounded-lg border overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 pl-4 text-xs uppercase tracking-wider text-gray-500 font-medium">Title</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-gray-500 font-medium">Assignee</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-gray-500 font-medium">Status</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-gray-500 font-medium">Est.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(task => (
              <tr 
                key={task.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleEditTask(task)}
              >
                <td className="p-3 pl-4">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description || "No description"}</p>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-devops-purple/10 flex items-center justify-center text-xs">
                      {task.assignee.initials}
                    </div>
                    <span className="ml-2 text-sm">{task.assignee.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                    ${task.status === "todo" ? "bg-orange-100 text-orange-800" : 
                      task.status === "inProgress" ? "bg-blue-100 text-blue-800" : 
                      "bg-green-100 text-green-800"}
                  `}>
                    {task.status === "inProgress" ? "In Progress" : 
                      task.status === "todo" ? "To Do" : "Done"}
                  </div>
                </td>
                <td className="p-3 text-sm">{task.estimation} days</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Task Edit Dialog - Shared between views */}
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
                priority: editingTask.priority || "medium",
                assigned_date: editingTask.assigned_date ? new Date(editingTask.assigned_date) : undefined,
                completion_date: editingTask.completion_date ? new Date(editingTask.completion_date) : undefined
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
              priority: editingTask.priority || "medium",
              assigned_date: editingTask.assigned_date ? new Date(editingTask.assigned_date) : undefined,
              completion_date: editingTask.completion_date ? new Date(editingTask.completion_date) : undefined
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
