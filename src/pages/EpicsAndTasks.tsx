
import * as React from "react";
import { MainLayout } from "@/components/MainLayout";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ListTodo, SquareKanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { EpicSubmissionForm } from "@/components/EpicSubmissionForm";
import { Separator } from "@/components/ui/separator";

const EpicsAndTasks = () => {
  const [selectedEpic, setSelectedEpic] = React.useState<string | undefined>(undefined);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isEpicDialogOpen, setIsEpicDialogOpen] = React.useState(false);
  
  // Sample epics data
  const epics = [
    "User Authentication System Overhaul",
    "Performance Optimization Initiative",
    "ML-Driven Recommendations"
  ];

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
              {epics.map((epic) => (
                <Badge 
                  key={epic}
                  variant="outline" 
                  className={`text-sm py-2 cursor-pointer hover:bg-devops-purple/10 ${selectedEpic === epic ? 'bg-devops-purple/20 border-devops-purple' : ''}`}
                  onClick={() => setSelectedEpic(epic === selectedEpic ? undefined : epic)}
                >
                  {epic}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedEpic ? `Showing tasks for: ${selectedEpic}` : 'Showing all tasks'}
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
            <Tabs defaultValue="kanban" className="h-8">
              <TabsList className="h-8">
                <TabsTrigger value="kanban" className="text-xs px-3">Kanban</TabsTrigger>
                <TabsTrigger value="list" className="text-xs px-3">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <KanbanBoard selectedEpic={selectedEpic} />
      </div>

      {/* Task Submission Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Create New Task</DialogTitle>
          <TaskSubmissionForm 
            onSuccess={() => setIsTaskDialogOpen(false)} 
            onCancel={() => setIsTaskDialogOpen(false)}
            isProductIdea={false} 
          />
        </DialogContent>
      </Dialog>

      {/* Epic Submission Dialog */}
      <Dialog open={isEpicDialogOpen} onOpenChange={setIsEpicDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Create New Epic</DialogTitle>
          <EpicSubmissionForm 
            onSuccess={() => setIsEpicDialogOpen(false)} 
            onCancel={() => setIsEpicDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default EpicsAndTasks;
