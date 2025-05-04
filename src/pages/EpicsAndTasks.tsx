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
import { EpicSubmissionWithIdeaLinking } from "@/components/EpicSubmissionWithIdeaLinking";
import { MOCK_EPICS, MOCK_PRODUCT_IDEAS } from "@/services/mockData";
import { productIdeaApi, epicApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const EpicsAndTasks = () => {
  const [selectedIdea, setSelectedIdea] = React.useState<string | undefined>(undefined);
  const [selectedEpic, setSelectedEpic] = React.useState<string | undefined>(undefined);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isEpicDialogOpen, setIsEpicDialogOpen] = React.useState(false);
  const [isEditEpicDialogOpen, setIsEditEpicDialogOpen] = React.useState(false);
  const [selectedEpicToEdit, setSelectedEpicToEdit] = React.useState<any | null>(null);
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");
  
  // Fetch product ideas - Fixed useQuery without the onError in options
  const { data: productIdeasData = MOCK_PRODUCT_IDEAS } = useQuery({
    queryKey: ['productIdeas'],
    queryFn: () => productIdeaApi.getAll(),
    // The onError callback needs to be moved to meta.onError in newer versions of react-query
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load product ideas",
          variant: "destructive",
        });
      }
    }
  });

  // Make sure productIdeas is always an array
  const productIdeas = React.useMemo(() => {
    return Array.isArray(productIdeasData) ? productIdeasData : MOCK_PRODUCT_IDEAS;
  }, [productIdeasData]);

  // Get filtered epics based on selected product idea
  const filteredEpics = React.useMemo(() => {
    if (!selectedIdea) return MOCK_EPICS;
    
    // In a real implementation, we would fetch epics linked to the selected product idea
    // For now, we'll use a simple filtering approach with our mock data
    // This would typically use the productIdeaApi.getLinkedEpics(selectedIdea) function
    const linkedEpicIds = selectedIdea === 'idea-1' ? ['epic-1', 'epic-3'] : 
                        selectedIdea === 'idea-2' ? ['epic-2'] : [];
    
    return MOCK_EPICS.filter(epic => linkedEpicIds.includes(epic.id));
  }, [selectedIdea]);
  
  console.log('EpicsAndTasks - Selected Epic ID:', selectedEpic);
  console.log('EpicsAndTasks - Selected Idea ID:', selectedIdea);
  console.log('EpicsAndTasks - Product Ideas:', productIdeas);
  
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

  // Reset epic selection when product idea changes
  React.useEffect(() => {
    if (selectedIdea) {
      setSelectedEpic(undefined);
    }
  }, [selectedIdea]);

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
        
        {/* Product Ideas Section */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-devops-purple-dark">
                <ListTodo className="h-5 w-5 mr-2" />
                Product Ideas
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(productIdeas) && productIdeas.map((idea) => (
                <Badge 
                  key={idea.id}
                  variant={selectedIdea === idea.id ? "default" : "outline"}
                  className={`text-sm py-2 cursor-pointer hover:bg-devops-purple/10 ${
                    selectedIdea === idea.id ? 'bg-devops-purple border-devops-purple' : ''
                  }`}
                  onClick={() => {
                    console.log('Selecting idea:', idea.id);
                    setSelectedIdea(selectedIdea === idea.id ? undefined : idea.id);
                  }}
                >
                  {idea.title}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedIdea && Array.isArray(productIdeas) ? 
                  `Viewing: ${productIdeas.find(i => i.id === selectedIdea)?.title}` : 
                  'Showing all product ideas'}
              </div>
            </div>
          </CardContent>
        </Card>
        
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
              {filteredEpics.map((epic) => (
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
                {selectedEpic ? `Viewing: ${filteredEpics.find(e => e.id === selectedEpic)?.title}` : 
                 selectedIdea ? `Showing epics for: ${productIdeas.find(i => i.id === selectedIdea)?.title}` : 'Showing all epics'}
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
          <EpicSubmissionWithIdeaLinking
            onSuccess={() => setIsEpicDialogOpen(false)} 
            onCancel={() => setIsEpicDialogOpen(false)} 
            productIdeaId={selectedIdea}
          />
        </DialogContent>
      </Dialog>

      {/* Epic Edit Dialog */}
      <Dialog open={isEditEpicDialogOpen} onOpenChange={setIsEditEpicDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <EpicSubmissionWithIdeaLinking
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
