
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { Task, KanbanBoardProps } from "./types";

// Sample tasks data
const SAMPLE_TASKS: Task[] = [
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

// Calculate epic progress based on tasks
function calculateEpicProgress(tasks: Task[]) {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === "done").length;
  return Math.round((completedTasks / tasks.length) * 100);
}

export function KanbanBoard({ selectedEpic, viewMode }: KanbanBoardProps) {
  // Set internal state based on prop
  const [selectedEpicState, setSelectedEpicState] = React.useState<string | undefined>(selectedEpic);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  
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

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };
  
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedTask(null);
    // In a real app, this would save the updated task to the backend
    // and refresh the task list
  };
  
  // Tasks filtered by status
  const todoTasks = filteredTasks.filter(task => task.status === "todo");
  const inProgressTasks = filteredTasks.filter(task => task.status === "inProgress");
  const doneTasks = filteredTasks.filter(task => task.status === "done");
  
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
            <KanbanColumn 
              title="TO DO" 
              tasks={todoTasks} 
              onEditTask={handleEditTask} 
            />
            <KanbanColumn 
              title="IN PROGRESS" 
              tasks={inProgressTasks} 
              onEditTask={handleEditTask} 
            />
            <KanbanColumn 
              title="DONE" 
              tasks={doneTasks} 
              onEditTask={handleEditTask} 
            />
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

      {/* Task Edit Dialog */}
      {selectedTask && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogTitle>Edit Task</DialogTitle>
            <TaskSubmissionForm 
              onSuccess={handleEditSuccess} 
              onCancel={() => setIsEditDialogOpen(false)}
              isProductIdea={false}
              taskValues={{
                title: selectedTask.title,
                description: selectedTask.description || "",
                epic: selectedTask.epic,
                priority: "medium", // Default since our sample data doesn't have priority
                estimation: selectedTask.estimation
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
