
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProductIdea } from "@/models/database";
import { X, Edit, Plus, CheckCircle } from "lucide-react";
import { EditProductIdeaForm } from "./EditProductIdeaForm";

interface EpicWithTasks {
  id: string;
  title: string;
  description: string;
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

interface ProductIdeaDetailProps {
  idea: ProductIdea & {
    linkedEpics: string[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
  };
  onClose: () => void;
  onUpdate?: (updatedIdea: ProductIdea & {
    linkedEpics: string[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
  }) => void;
}

// Mock epics data for the demo
const mockEpicsWithTasks: Record<string, EpicWithTasks> = {
  "ML-Driven Recommendations": {
    id: "epic1",
    title: "ML-Driven Recommendations",
    description: "Implement machine learning recommendations across the platform",
    tasks: [
      { id: "task1", title: "Research ML algorithms", status: "done", priority: "high" },
      { id: "task2", title: "Design recommendation system", status: "done", priority: "high" },
      { id: "task3", title: "Implement basic ML pipeline", status: "in_progress", priority: "high" },
      { id: "task4", title: "Test recommendation accuracy", status: "backlog", priority: "medium" },
      { id: "task5", title: "Deploy to production", status: "backlog", priority: "medium" }
    ],
    progress: 40,
    completedTasks: 2,
    totalTasks: 5
  },
  "Performance Optimization Initiative": {
    id: "epic2",
    title: "Performance Optimization Initiative",
    description: "Improve overall application performance and response times",
    tasks: [
      { id: "task6", title: "Audit current performance", status: "done", priority: "high" },
      { id: "task7", title: "Optimize database queries", status: "done", priority: "high" },
      { id: "task8", title: "Implement caching layer", status: "done", priority: "medium" },
      { id: "task9", title: "Optimize frontend bundle size", status: "done", priority: "medium" },
      { id: "task10", title: "Measure and document improvements", status: "in_progress", priority: "low" }
    ],
    progress: 90,
    completedTasks: 4,
    totalTasks: 5
  }
};

export function ProductIdeaDetail({ idea, onClose, onUpdate }: ProductIdeaDetailProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentIdea, setCurrentIdea] = React.useState(idea);
  
  // Get epics data that match the linkedEpics array in the idea
  const linkedEpicsData = React.useMemo(() => {
    return currentIdea.linkedEpics
      .map(epicTitle => mockEpicsWithTasks[epicTitle])
      .filter(Boolean);
  }, [currentIdea.linkedEpics]);
  
  const handleSaveEdit = (updatedData: Partial<ProductIdea> & { linkedEpics?: string[] }) => {
    const updatedIdea = {
      ...currentIdea,
      ...updatedData,
      linkedEpics: updatedData.linkedEpics || currentIdea.linkedEpics,
      updated_at: new Date().toISOString()
    };
    
    setCurrentIdea(updatedIdea);
    setIsEditing(false);
    
    // Notify parent component if provided
    if (onUpdate) {
      onUpdate(updatedIdea);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {!isEditing ? (
          <>
            <CardHeader className="relative border-b">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-2 mb-2">
                    <Badge className={
                      currentIdea.status === 'proposed' ? 'bg-blue-100 text-blue-800' :
                      currentIdea.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                      currentIdea.status === 'approved' ? 'bg-green-100 text-green-800' :
                      currentIdea.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }>
                      {currentIdea.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{currentIdea.priority} priority</Badge>
                  </div>
                  <CardTitle className="text-2xl">{currentIdea.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">{currentIdea.description}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  className="absolute right-4 top-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto py-6">
              <div className="space-y-6">
                {/* Overall Progress */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Implementation Progress</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall completion</span>
                    <span className="font-medium">
                      {currentIdea.progress}% ({currentIdea.completedTasks} of {currentIdea.totalTasks} tasks)
                    </span>
                  </div>
                  <Progress value={currentIdea.progress} className="h-2" />
                </div>
                
                {/* Linked Epics */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Linked Epics</h3>
                  
                  {linkedEpicsData.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {linkedEpicsData.map((epic) => (
                        <AccordionItem key={epic.id} value={epic.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex flex-col items-start text-left">
                              <div className="font-medium">{epic.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {epic.completedTasks} of {epic.totalTasks} tasks completed ({epic.progress}%)
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-2 pb-4">
                              <p className="text-sm text-muted-foreground mb-4">
                                {epic.description}
                              </p>
                              
                              <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Epic progress</span>
                                  <span>{epic.progress}%</span>
                                </div>
                                <Progress value={epic.progress} className="h-1.5" />
                              </div>
                              
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium">Tasks</h4>
                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                  <Plus className="h-3 w-3 mr-1" /> Add Task
                                </Button>
                              </div>
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Task</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Priority</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {epic.tasks.map((task) => (
                                      <TableRow key={task.id}>
                                        <TableCell>{task.title}</TableCell>
                                        <TableCell>
                                          <Badge variant="secondary" className={
                                            task.status === 'done' ? 'bg-green-100 text-green-800' :
                                            task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                                            'bg-gray-100 text-gray-800'
                                          }>
                                            {task.status.replace('_', ' ')}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{task.priority}</Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <Card className="bg-muted/40">
                      <CardContent className="py-6 text-center">
                        <p className="text-muted-foreground">No epics linked to this product idea yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 justify-between">
              <div className="text-sm text-muted-foreground">
                <span>Created: {new Date(currentIdea.created_at).toLocaleDateString()}</span>
                {currentIdea.created_at !== currentIdea.updated_at && (
                  <span className="ml-4">Updated: {new Date(currentIdea.updated_at).toLocaleDateString()}</span>
                )}
              </div>
              <div>
                <Button variant="outline" onClick={onClose} className="mr-2">
                  Close
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Idea
                </Button>
              </div>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Edit Product Idea</CardTitle>
            </CardHeader>
            <CardContent>
              <EditProductIdeaForm
                idea={currentIdea}
                onSave={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
              />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
