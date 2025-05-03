import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { Task } from "@/models/database";

// Define a local TaskView type that extends the database Task type with UI-specific properties
interface TaskView {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "inProgress" | "done";
  estimation: number;
  actual?: number;
  assignee: {
    name: string;
    avatar?: string;
    initials: string;
  };
  epic: string;
}

interface KanbanBoardProps {
  selectedEpic?: string;
  viewMode: "kanban" | "list";
  onEditTask?: (task: Task) => void;  // Using the imported Task type
}

// Convert database Task type to our UI representation
function mapDatabaseTaskToView(task: Task): TaskView {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    // Map database status to our UI status
    status: task.status === 'backlog' ? 'todo' : 
            task.status === 'in_progress' ? 'inProgress' : 
            task.status === 'done' ? 'done' : 'todo',
    estimation: task.estimation,
    // In a real app, you would get the actual time from somewhere
    actual: task.status === 'done' ? task.estimation * 0.8 : undefined,
    assignee: {
      // In a real app, you would get the assignee details from users table
      name: "Team Member",
      initials: "TM"
    },
    epic: task.epic_id || "Unassigned" 
  };
}

const SAMPLE_TASKS: TaskView[] = [
  {
    id: "task-1",
    title: "Set up biometric authentication API",
    description: "Implement the backend API for biometric authentication",
    status: "todo",
    estimation: 3,
    assignee: {
      name: "Alex Johnson",
      initials: "AJ"
    },
    epic: "User Authentication System Overhaul"
  },
  {
    id: "task-2",
    title: "Create mobile UI for biometric prompts",
    description: "Design and implement the UI for fingerprint and face recognition",
    status: "inProgress",
    estimation: 2,
    actual: 1,
    assignee: {
      name: "Maria Garcia",
      initials: "MG"
    },
    epic: "User Authentication System Overhaul"
  },
  {
    id: "task-3",
    title: "Deploy CDN optimization for assets",
    description: "Configure CDN to improve page load times globally",
    status: "done",
    estimation: 1,
    actual: 0.5,
    assignee: {
      name: "Tyler Smith",
      initials: "TS"
    },
    epic: "Performance Optimization Initiative"
  },
  {
    id: "task-4",
    title: "Implement security monitoring for biometric auth",
    description: "Set up monitoring and alerting for biometric authentication",
    status: "todo",
    estimation: 2,
    assignee: {
      name: "Sam Wong",
      initials: "SW"
    },
    epic: "User Authentication System Overhaul"
  },
  {
    id: "task-5",
    title: "Refactor product recommendation algorithm",
    description: "Improve recommendation accuracy by 15%",
    status: "inProgress",
    estimation: 5,
    actual: 3,
    assignee: {
      name: "Jamie Lee",
      initials: "JL"
    },
    epic: "ML-Driven Recommendations"
  },
  {
    id: "task-6",
    title: "Design password-less email flow",
    description: "Create UX designs for the password-less authentication",
    status: "done",
    estimation: 1,
    actual: 1,
    assignee: {
      name: "Robin Chen",
      initials: "RC"
    },
    epic: "User Authentication System Overhaul"
  }
];

function getStatusColor(status: string) {
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

function getStatusLabel(status: string) {
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

// Calculate epic progress based on tasks
function calculateEpicProgress(tasks: TaskView[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === "done").length;
  return Math.round((completedTasks / tasks.length) * 100);
}

export function KanbanBoard({ selectedEpic, viewMode, onEditTask }: KanbanBoardProps) {
  // Set internal state based on prop
  const [selectedEpicState, setSelectedEpicState] = React.useState<string | undefined>(selectedEpic);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedTaskView, setSelectedTaskView] = React.useState<TaskView | null>(null);
  const [selectedDbTask, setSelectedDbTask] = React.useState<Task | null>(null);
  
  // Update internal state when prop changes
  React.useEffect(() => {
    setSelectedEpicState(selectedEpic);
  }, [selectedEpic]);
  
  // Get tasks filtered by selected epic
  const filteredTasks = React.useMemo(() => {
    if (!selectedEpicState) return SAMPLE_TASKS;
    return SAMPLE_TASKS.filter(task => task.epic === selectedEpicState);
  }, [selectedEpicState]);
  
  // Get all unique epics from tasks
  const uniqueEpics = React.useMemo(() => {
    return [...new Set(SAMPLE_TASKS.map(task => task.epic))];
  }, []);
  
  // Calculate progress for selected epic
  const epicProgress = React.useMemo(() => {
    if (!selectedEpicState) return null;
    const epicTasks = SAMPLE_TASKS.filter(task => task.epic === selectedEpicState);
    const progress = calculateEpicProgress(epicTasks);
    const completedCount = epicTasks.filter(task => task.status === "done").length;
    
    return {
      progress,
      completed: completedCount,
      total: epicTasks.length
    };
  }, [selectedEpicState]);

  // When a task is edited, we need to convert our UI task to a database task
  const handleEditTask = (taskView: TaskView) => {
    // If external edit handler is provided, use it
    if (onEditTask) {
      // Convert the UI task to a database task
      // In a real app, you would fetch the full task from the API
      const dbTask: Task = {
        id: taskView.id,
        title: taskView.title,
        description: taskView.description || "",
        epic_id: taskView.epic,
        assignee_id: undefined, // In a real app, you'd map this correctly
        estimation: taskView.estimation,
        priority: "medium", // Default since UI model doesn't have this
        status: taskView.status === "todo" ? "backlog" : 
                taskView.status === "inProgress" ? "in_progress" : "done",
        is_product_idea: false,
        created_by: "", // In a real app, this would be set
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      onEditTask(dbTask);
    } else {
      // Otherwise use internal dialog
      setSelectedTaskView(taskView);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedTaskView(null);
    // In a real app, this would save the updated task to the backend
    // and refresh the task list
  };
  
  return (
    <div className="w-full animate-fade-in rounded-md bg-white/80 p-4 border border-gray-100 shadow-sm">
      <Tabs value={viewMode} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="hidden">
            <TabsList>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex items-center space-x-2">
            {selectedEpicState && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  Epic: {selectedEpicState}
                </Badge>
                {epicProgress && (
                  <div className="flex items-center gap-2 text-xs">
                    <span>{epicProgress.completed} of {epicProgress.total} tasks done</span>
                    <Progress value={epicProgress.progress} className="w-20 h-2" />
                    <span>{epicProgress.progress}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <TabsContent value="kanban" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">TO DO</h3>
                <Badge variant="outline" className="text-xs">
                  {filteredTasks.filter(t => t.status === "todo").length}
                </Badge>
              </div>
              <div className="kanban-column space-y-3">
                {filteredTasks
                  .filter(task => task.status === "todo")
                  .map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={() => handleEditTask(task)}
                    />
                  ))
                }
              </div>
            </div>
            
            {/* In Progress Column */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">IN PROGRESS</h3>
                <Badge variant="outline" className="text-xs">
                  {filteredTasks.filter(t => t.status === "inProgress").length}
                </Badge>
              </div>
              <div className="kanban-column space-y-3">
                {filteredTasks
                  .filter(task => task.status === "inProgress")
                  .map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={() => handleEditTask(task)}
                    />
                  ))
                }
              </div>
            </div>
            
            {/* Done Column */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">DONE</h3>
                <Badge variant="outline" className="text-xs">
                  {filteredTasks.filter(t => t.status === "done").length}
                </Badge>
              </div>
              <div className="kanban-column space-y-3">
                {filteredTasks
                  .filter(task => task.status === "done")
                  .map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={() => handleEditTask(task)}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="block">
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                listView 
                onEdit={() => handleEditTask(task)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Edit Dialog - only show if onEditTask prop is not provided */}
      {!onEditTask && selectedTaskView && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogTitle>Edit Task</DialogTitle>
            <TaskSubmissionForm 
              onSuccess={handleEditSuccess} 
              onCancel={() => setIsEditDialogOpen(false)}
              isProductIdea={false}
              taskValues={{
                title: selectedTaskView.title,
                description: selectedTaskView.description || "",
                epic: selectedTaskView.epic,
                priority: "medium", // Default since our UI model doesn't have this
                estimation: selectedTaskView.estimation
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: TaskView;
  listView?: boolean;
  onEdit?: () => void;
}

function TaskCard({ task, listView, onEdit }: TaskCardProps) {
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
