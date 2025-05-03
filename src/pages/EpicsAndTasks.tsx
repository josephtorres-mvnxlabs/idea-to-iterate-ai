
import * as React from "react";
import { MainLayout } from "@/components/MainLayout";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ListTodo, SquareKanban, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { EpicSubmissionForm } from "@/components/EpicSubmissionForm";
import { MOCK_EPICS } from "@/services/mockData";

const EpicsAndTasks = () => {
  const [selectedEpic, setSelectedEpic] = React.useState<string | undefined>(undefined);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isEpicDialogOpen, setIsEpicDialogOpen] = React.useState(false);
  const [isEditEpicDialogOpen, setIsEditEpicDialogOpen] = React.useState(false);
  const [selectedEpicToEdit, setSelectedEpicToEdit] = React.useState<any | null>(null);
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");
  
  console.log('EpicsAndTasks - Selected Epic ID:', selectedEpic);
  
  const handleEditEpic = (epicId: string) => {
    const epic = MOCK_EPICS.find(e => e.id === epicId);
    if (epic) {
      setSelectedEpicToEdit(epic);
      setIsEditEpicDialogOpen(true);
    }
  };

  const handleSaveEpic = () => {
    setIsEditEpicDialogOpen(false);
    setSelectedEpicToEdit(null);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Work Management</h1>
            <p className="text-muted-foreground">
              Organize and track development initiatives
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              className="bg-devops-purple hover:bg-devops-purple-dark"
              onClick={() => setIsEpicDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Epic
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsTaskDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Task
            </Button>
          </div>
        </div>
        
        {/* Epics Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-devops-purple-dark">
                <SquareKanban className="h-5 w-5 mr-2" />
                Epics
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MOCK_EPICS.map((epic) => (
                <Badge 
                  key={epic.id}
                  variant={selectedEpic === epic.id ? "default" : "outline"}
                  className={`text-sm py-2 cursor-pointer hover:bg-devops-purple/10 group relative ${
                    selectedEpic === epic.id ? 'bg-devops-purple border-devops-purple' : ''
                  }`}
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
                {selectedEpic ? `Viewing: ${MOCK_EPICS.find(e => e.id === selectedEpic)?.title}` : 'Showing all tasks'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks Section */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold flex items-center text-devops-gray-dark">
            <ListTodo className="h-5 w-5 mr-2" />
            Tasks
          </h2>
          <Tabs 
            defaultValue={viewMode} 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as "kanban" | "list")} 
            className="h-8"
          >
            <TabsList className="h-8">
              <TabsTrigger value="kanban" className="text-xs px-3 flex items-center">
                <SquareKanban className="h-3 w-3 mr-1" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-3 flex items-center">
                <ListTodo className="h-3 w-3 mr-1" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <KanbanBoard selectedEpic={selectedEpic} viewMode={viewMode} />
      </div>

      {/* Task Submission Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
          <EpicSubmissionForm 
            onSuccess={() => setIsEpicDialogOpen(false)} 
            onCancel={() => setIsEpicDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Epic Edit Dialog */}
      <Dialog open={isEditEpicDialogOpen} onOpenChange={setIsEditEpicDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
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
