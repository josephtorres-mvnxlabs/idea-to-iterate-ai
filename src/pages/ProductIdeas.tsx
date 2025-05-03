import * as React from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Lightbulb, LayoutGrid, LayoutList, Kanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { Progress } from "@/components/ui/progress";
import { ProductIdea } from "@/models/database";
import { ProductIdeaBoard } from "@/components/ProductIdeaBoard";

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
                {mockIdeas.length} product ideas
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">View:</span>
                <Tabs defaultValue="cards">
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
        
        <Tabs defaultValue="cards" className="w-full">
          <TabsContent value="cards" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockIdeas.map((idea) => (
                <Card key={idea.id} className="hover-scale">
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
          
          <TabsContent value="list" className="animate-fade-in">
            <Card>
              <CardContent className="pt-6">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-10 px-2 text-left font-medium">Title</th>
                        <th className="h-10 px-2 text-left font-medium">Status</th>
                        <th className="h-10 px-2 text-left font-medium">Priority</th>
                        <th className="h-10 px-2 text-left font-medium">Linked Epics</th>
                        <th className="h-10 px-2 text-left font-medium">Progress</th>
                        <th className="h-10 px-2 text-left font-medium">Tasks</th>
                        <th className="h-10 px-2 text-left font-medium">Estimation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockIdeas.map((idea) => (
                        <tr key={idea.id} className="border-b hover:bg-muted/50 cursor-pointer">
                          <td className="p-2 align-middle font-medium">{idea.title}</td>
                          <td className="p-2 align-middle">
                            <Badge className={
                              idea.status === 'proposed' ? 'bg-blue-100 text-blue-800' :
                              idea.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                              idea.status === 'approved' ? 'bg-green-100 text-green-800' :
                              idea.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }>
                              {idea.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-2 align-middle">
                            <Badge variant="outline">{idea.priority}</Badge>
                          </td>
                          <td className="p-2 align-middle">
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
                          </td>
                          <td className="p-2 align-middle w-40">
                            <div className="flex items-center gap-2">
                              <Progress value={idea.progress} className="h-2" />
                              <span className="text-xs">{idea.progress}%</span>
                            </div>
                          </td>
                          <td className="p-2 align-middle">
                            <span className="text-xs">{idea.completedTasks}/{idea.totalTasks}</span>
                          </td>
                          <td className="p-2 align-middle">{idea.estimation} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="board" className="animate-fade-in">
            <ProductIdeaBoard ideas={mockIdeas} />
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
    </MainLayout>
  );
};

export default ProductIdeas;
