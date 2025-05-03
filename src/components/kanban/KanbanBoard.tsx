
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
  
  // Add console log to debug task mapping
  console.log('Mapping task:', dbTask.id, dbTask.title, 'Epic ID:', dbTask.epic_id);
  
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
  };
};

export function KanbanBoard({ selectedEpic, viewMode = "kanban" }: KanbanBoardProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingTask, setEditingTask] = React.useState<UITask | null>(null);

  // Add console log to debug selected epic
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
    // Log database tasks for debugging
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

  // Add console logs for filtering by status
  console.log('Total tasks after filtering by epic:', tasks.length);
  const todoTasks = tasks.filter(task => task.status === "todo");
  console.log('Todo tasks count:', todoTasks.length);
  const inProgressTasks = tasks.filter(task => task.status === "inProgress");
  console.log('In progress tasks count:', inProgressTasks.length);
  const doneTasks = tasks.filter(task => task.status === "done");
  console.log('Done tasks count:', doneTasks.length);

  const handleEditTask = (task: UITask) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleTaskDialogClose = () => {
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };

  // Modify loading state to show a more detailed message when there are no tasks
  if (isLoading) {
    return <div className="py-10 text-center">Loading tasks...</div>;
  }

  // Add a message when there are no tasks at all
  if (tasks.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground mb-2">
          {selectedEpic ? 
            `No tasks found for the selected epic.` : 
            `No tasks found. Create your first task!`}
        </p>
      </div>
    );
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
