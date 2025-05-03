
import * as React from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Filter, LayoutGrid, LayoutList, Kanban, ArrowUpZA, ArrowDownAZ } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { Progress } from "@/components/ui/progress";
import { ProductIdea, User } from "@/models/database";
import { ProductIdeaBoard } from "@/components/ProductIdeaBoard";
import { ProductIdeaDetail } from "@/components/ProductIdeaDetail";
import { toast } from "sonner";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MOCK_USERS } from "@/services/mockData";

// Enhanced mock ideas with completed vs total tasks
const mockIdeas: (ProductIdea & { 
  linkedEpics: string[], 
  progress: number,
  completedTasks: number,
  totalTasks: number 
})[] = [
  {
    id: '1',
    title: 'AI-Assisted Code Refactoring',
    description: 'Use machine learning to suggest code improvements and automate refactoring tasks.',
    estimation: 30,
    priority: 'high',
    status: 'under_review',
    created_by: 'user1',
    owner_id: 'user-1',
    team_members: ['user-2', 'user-3'],
    created_at: '2023-05-15T10:30:00Z',
    updated_at: '2023-05-15T10:30:00Z',
    linkedEpics: ['ML-Driven Recommendations', 'Performance Optimization Initiative'],
    progress: 35,
    completedTasks: 7,
    totalTasks: 20
  },
  {
    id: '2',
    title: 'DevOps Pipeline Automation',
    description: 'Automated CI/CD pipeline with integrated security testing and deployment verification.',
    estimation: 45,
    priority: 'medium',
    status: 'approved',
    created_by: 'user2',
    owner_id: 'user-2',
    team_members: ['user-1'],
    created_at: '2023-06-02T14:45:00Z',
    updated_at: '2023-06-10T09:15:00Z',
    linkedEpics: ['Performance Optimization Initiative'],
    progress: 10,
    completedTasks: 2,
    totalTasks: 15
  },
  {
    id: '3',
    title: 'Real-time Collaboration Editor',
    description: 'Add real-time collaborative editing features with presence awareness for team members.',
    estimation: 60,
    priority: 'high',
    status: 'proposed',
    created_by: 'user3',
    owner_id: 'user-3',
    team_members: [],
    created_at: '2023-07-10T11:20:00Z',
    updated_at: '2023-07-10T11:20:00Z',
    linkedEpics: [],
    progress: 0,
    completedTasks: 0,
    totalTasks: 0
  },
];

const ProductIdeas = () => {
  const [isIdeaDialogOpen, setIsIdeaDialogOpen] = React.useState(false);
  const [activeView, setActiveView] = React.useState("board");
  const [selectedIdea, setSelectedIdea] = React.useState<(typeof mockIdeas)[0] | null>(null);
  const [ideas, setIdeas] = React.useState(mockIdeas);
  const [sortConfig, setSortConfig] = React.useState<{
    key: 'status' | 'priority' | null,
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  });
  
  const handleIdeaClick = (idea: (typeof ideas)[0]) => {
    setSelectedIdea(idea);
  };

  const handleCloseDetail = () => {
    setSelectedIdea(null);
  };
  
  const handleIdeaUpdate = (updatedIdea: (typeof ideas)[0]) => {
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea.id === updatedIdea.id ? updatedIdea : idea
      )
    );
    
    toast.success("Product idea updated successfully");
  };
  
  const requestSort = (key: 'status' | 'priority') => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };
  
  const getSortedIdeas = () => {
    if (!sortConfig.key) return ideas;
    
    return [...ideas].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  const sortedIdeas = getSortedIdeas();
  
  const getSortIcon = (key: 'status' | 'priority') => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ArrowDownAZ className="h-3 w-3 ml-1" /> 
      : <ArrowUpZA className="h-3 w-3 ml-1" />;
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Product Ideas</h1>
            <p className="text-muted-foreground">
              Manage, prioritize, and track product innovation ideas
            </p>
          </div>
          <Button 
            className="bg-devops-purple hover:bg-devops-purple-dark"
            onClick={() => setIsIdeaDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Product Idea
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Product Ideas Dashboard</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {ideas.length} product ideas
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">View:</span>
                <Tabs 
                  value={activeView} 
                  onValueChange={setActiveView} 
                  defaultValue="board"  // Changed default value from "cards" to "board"
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="cards" className="text-xs px-3 flex items-center">
                      <LayoutGrid className="h-3 w-3 mr-1" /> Cards
                    </TabsTrigger>
                    <TabsTrigger value="list" className="text-xs px-3 flex items-center">
                      <LayoutList className="h-3 w-3 mr-1" /> List
                    </TabsTrigger>
                    <TabsTrigger value="board" className="text-xs px-3 flex items-center">
                      <Kanban className="h-3 w-3 mr-1" /> Board
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs value={activeView} className="w-full">
          <TabsContent value="cards" className="animate-fade-in mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea) => (
                <Card 
                  key={idea.id} 
                  className="hover-scale cursor-pointer"
                  onClick={() => handleIdeaClick(idea)}
                >
                  <CardHeader>
                    <div className="flex justify-between">
                      <Badge className={
                        idea.status === 'proposed' ? 'bg-blue-100 text-blue-800' :
                        idea.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                        idea.status === 'approved' ? 'bg-green-100 text-green-800' :
                        idea.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }>
                        {idea.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="ml-2">{idea.priority}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{idea.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{idea.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Implementation Progress</span>
                        <span className="font-medium">
                          {idea.progress}% ({idea.completedTasks} of {idea.totalTasks} tasks)
                        </span>
                      </div>
                      <Progress value={idea.progress} />
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Linked Epics</p>
                        {idea.linkedEpics.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {idea.linkedEpics.map(epic => (
                              <Badge key={epic} variant="secondary" className="text-xs">
                                {epic}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No epics linked yet</p>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-sm mt-4">
                        <span>Estimation</span>
                        <span className="font-medium">{idea.estimation} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="animate-fade-in mt-0">
            <Card>
              <CardContent className="pt-6">
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center focus:outline-none">
                              Status {getSortIcon('status')}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => requestSort('status')}>
                                Sort {sortConfig.key === 'status' && sortConfig.direction === 'asc' ? 'Descending' : 'Ascending'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                        <TableHead>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center focus:outline-none">
                              Priority {getSortIcon('priority')}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => requestSort('priority')}>
                                Sort {sortConfig.key === 'priority' && sortConfig.direction === 'asc' ? 'Descending' : 'Ascending'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                        <TableHead>Linked Epics</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Estimation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedIdeas.map((idea) => (
                        <TableRow 
                          key={idea.id} 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleIdeaClick(idea)}
                        >
                          <TableCell className="font-medium">{idea.title}</TableCell>
                          <TableCell>
                            <Badge className={
                              idea.status === 'proposed' ? 'bg-blue-100 text-blue-800' :
                              idea.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                              idea.status === 'approved' ? 'bg-green-100 text-green-800' :
                              idea.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }>
                              {idea.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{idea.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {idea.linkedEpics.length > 0 ? 
                                idea.linkedEpics.map(epic => (
                                  <Badge key={epic} variant="secondary" className="text-xs">
                                    {epic}
                                  </Badge>
                                ))
                                : 
                                <span className="text-xs text-muted-foreground">None</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell className="w-40">
                            <div className="flex items-center gap-2">
                              <Progress value={idea.progress} className="h-2" />
                              <span className="text-xs">{idea.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">{idea.completedTasks}/{idea.totalTasks}</span>
                          </TableCell>
                          <TableCell>{idea.estimation} days</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="board" className="animate-fade-in mt-0">
            <ProductIdeaBoard 
              ideas={ideas}
              onIdeaClick={handleIdeaClick}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Idea Submission Dialog */}
      <Dialog open={isIdeaDialogOpen} onOpenChange={setIsIdeaDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Create New Product Idea</DialogTitle>
          <TaskSubmissionForm 
            onSuccess={() => setIsIdeaDialogOpen(false)} 
            onCancel={() => setIsIdeaDialogOpen(false)}
            isProductIdea={true} 
          />
        </DialogContent>
      </Dialog>

      {/* Product Idea Detail Modal */}
      {selectedIdea && (
        <ProductIdeaDetail 
          idea={selectedIdea} 
          onClose={handleCloseDetail} 
          onUpdate={handleIdeaUpdate}
        />
      )}
    </MainLayout>
  );
};

export default ProductIdeas;
