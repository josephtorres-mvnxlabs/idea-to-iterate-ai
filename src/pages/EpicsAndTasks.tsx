
import * as React from "react";
import { MainLayout } from "@/components/MainLayout";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ListTodo, SquareKanban, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { EpicSubmissionForm } from "@/components/EpicSubmissionForm";
import { Separator } from "@/components/ui/separator";

// Sample epics data structure with more complete information
const SAMPLE_EPICS = [
  {
    id: "epic-1",
    title: "User Authentication System Overhaul",
    description: "Revamp the existing authentication system to include biometric options and improve security",
    estimation: 14,
    capability_category: "security"
  },
  {
    id: "epic-2",
    title: "Performance Optimization Initiative",
    description: "Identify and resolve performance bottlenecks across the platform",
    estimation: 21,
    capability_category: "infrastructure"
  },
  {
    id: "epic-3",
    title: "ML-Driven Recommendations",
    description: "Implement machine learning algorithms to provide personalized product recommendations",
    estimation: 30,
    capability_category: "data"
  }
];

const EpicsAndTasks = () => {
  // Modified to store the epic ID instead of the title
  const [selectedEpic, setSelectedEpic] = React.useState<string | undefined>(undefined);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isEpicDialogOpen, setIsEpicDialogOpen] = React.useState(false);
  const [isEditEpicDialogOpen, setIsEditEpicDialogOpen] = React.useState(false);
  const [selectedEpicToEdit, setSelectedEpicToEdit] = React.useState<any | null>(null);
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");
  
  // Debug console logs
  console.log('EpicsAndTasks - Selected Epic ID:', selectedEpic);
  
  const handleEditEpic = (epicId: string) => {
    const epic = SAMPLE_EPICS.find(e => e.id === epicId);
    if (epic) {
      setSelectedEpicToEdit(epic);
      setIsEditEpicDialogOpen(true);
    }
  };

  const handleSaveEpic = () => {
    // In a real app, this would save the epic to the database
    setIsEditEpicDialogOpen(false);
    setSelectedEpicToEdit(null);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Epics & Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track all development initiatives and tasks
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              className="bg-devops-purple hover:bg-devops-purple-dark"
              onClick={() => setIsEpicDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Epic
            </Button>
            <Button 
              className="bg-devops-purple-dark hover:bg-devops-purple"
              onClick={() => setIsTaskDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </div>
        </div>
        
        {/* Epics Section with visual distinction */}
        <div className="bg-gradient-to-r from-devops-purple/5 to-transparent p-1 rounded-t-lg border-b-2 border-devops-purple/30">
          <h2 className="text-lg font-semibold flex items-center ml-2 mb-1 text-devops-purple-dark">
            <SquareKanban className="h-5 w-5 mr-2" />
            Epics
          </h2>
        </div>
        <Card className="mb-6 rounded-t-none bg-devops-purple/5">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Active Epics</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_EPICS.map((epic) => (
                <Badge 
                  key={epic.id}
                  variant="outline" 
                  className={`text-sm py-2 cursor-pointer hover:bg-devops-purple/10 ${selectedEpic === epic.id ? 'bg-devops-purple/20 border-devops-purple' : ''} group relative`}
                  onClick={() => {
                    console.log('Selecting epic:', epic.id);
                    setSelectedEpic(selectedEpic === epic.id ? undefined : epic.id);
                  }}
                >
                  {epic.title}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEpic(epic.id);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    <span className="sr-only">Edit epic</span>
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedEpic ? `Showing tasks for: ${SAMPLE_EPICS.find(e => e.id === selectedEpic)?.title || selectedEpic}` : 'Showing all tasks'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks Section with visual distinction */}
        <div className="bg-gradient-to-r from-devops-gray/20 to-transparent p-1 rounded-t-lg border-b-2 border-devops-gray/30 mt-8">
          <h2 className="text-lg font-semibold flex items-center ml-2 mb-1 text-devops-gray-dark">
            <ListTodo className="h-5 w-5 mr-2" />
            Tasks
          </h2>
          <div className="flex justify-end pr-2">
            <Tabs 
              defaultValue={viewMode} 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value as "kanban" | "list")} 
              className="h-8"
            >
              <TabsList className="h-8">
                <TabsTrigger value="kanban" className="text-xs px-3 flex items-center">
                  <SquareKanban className="h-3 w-3 mr-1" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="list" className="text-xs px-3 flex items-center">
                  <ListTodo className="h-3 w-3 mr-1" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <KanbanBoard selectedEpic={selectedEpic} viewMode={viewMode} />
      </div>

      {/* Task Submission Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to an epic
            </DialogDescription>
          </DialogHeader>
          <TaskSubmissionForm 
            onSuccess={() => setIsTaskDialogOpen(false)} 
            onCancel={() => setIsTaskDialogOpen(false)}
            isProductIdea={false} 
            epicId={selectedEpic}
          />
        </DialogContent>
      </Dialog>

      {/* Epic Submission Dialog */}
      <Dialog open={isEpicDialogOpen} onOpenChange={setIsEpicDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Create New Epic</DialogTitle>
            <DialogDescription>
              Create a new epic to organize related tasks
            </DialogDescription>
          </DialogHeader>
          <EpicSubmissionForm 
            onSuccess={() => setIsEpicDialogOpen(false)} 
            onCancel={() => setIsEpicDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Epic Edit Dialog */}
      <Dialog open={isEditEpicDialogOpen} onOpenChange={setIsEditEpicDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Epic</DialogTitle>
            <DialogDescription>
              Edit epic details and manage associated tasks
            </DialogDescription>
          </DialogHeader>
          <EpicSubmissionForm 
            onSuccess={handleSaveEpic} 
            onCancel={() => setIsEditEpicDialogOpen(false)} 
            initialValues={selectedEpicToEdit ? {
              title: selectedEpicToEdit.title,
              description: selectedEpicToEdit.description,
              estimation: selectedEpicToEdit.estimation,
              capability_category: selectedEpicToEdit.capability_category
            } : undefined}
            epicId={selectedEpicToEdit?.id}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default EpicsAndTasks;
