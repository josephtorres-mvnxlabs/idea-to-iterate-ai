
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductIdea } from "@/models/database";
import { EditProductIdeaForm } from "./EditProductIdeaForm";
import { ProductIdeaHeader } from "./productIdea/ProductIdeaHeader";
import { ProgressSection } from "./productIdea/ProgressSection";
import { LinkedEpicsSection } from "./productIdea/LinkedEpicsSection";
import { ProductIdeaFooter } from "./productIdea/ProductIdeaFooter";
import { useToast } from "@/hooks/use-toast";

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
  },
  "New Epic": {
    id: "epic3",
    title: "New Epic",
    description: "A newly created epic from the product idea detail",
    tasks: [
      { id: "task11", title: "Initial planning", status: "backlog", priority: "high" },
      { id: "task12", title: "Technical design", status: "backlog", priority: "high" }
    ],
    progress: 0,
    completedTasks: 0,
    totalTasks: 2
  }
};

export function ProductIdeaDetail({ idea, onClose, onUpdate }: ProductIdeaDetailProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentIdea, setCurrentIdea] = React.useState(idea);
  const { toast } = useToast();
  
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
  
  const handleNewEpicCreated = (epicTitle: string) => {
    // Check if the epic already exists in the idea
    if (currentIdea.linkedEpics.includes(epicTitle)) {
      toast({
        title: "Epic already linked",
        description: `Epic "${epicTitle}" is already linked to this product idea.`,
      });
      return;
    }
    
    // Create updated idea with the new epic linked
    const updatedIdea = {
      ...currentIdea,
      linkedEpics: [...currentIdea.linkedEpics, epicTitle],
      updated_at: new Date().toISOString()
    };
    
    // Update local state
    setCurrentIdea(updatedIdea);
    
    // In a real app, this would update the database as well
    if (onUpdate) {
      onUpdate(updatedIdea);
    }
    
    // Show success message
    toast({
      title: "Epic created and linked",
      description: `Epic "${epicTitle}" has been created and linked to this product idea.`,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {!isEditing ? (
          <>
            <CardHeader className="relative border-b">
              <ProductIdeaHeader
                title={currentIdea.title}
                description={currentIdea.description}
                status={currentIdea.status}
                priority={currentIdea.priority}
                onClose={onClose}
              />
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto py-6">
              <div className="space-y-6">
                {/* Overall Progress */}
                <ProgressSection 
                  progress={currentIdea.progress}
                  completedTasks={currentIdea.completedTasks}
                  totalTasks={currentIdea.totalTasks}
                />
                
                {/* Linked Epics */}
                <LinkedEpicsSection 
                  linkedEpicsData={linkedEpicsData} 
                  onNewEpicCreated={handleNewEpicCreated}
                />
              </div>
            </CardContent>
            
            <CardContent className="border-t pt-4">
              <ProductIdeaFooter
                createdAt={currentIdea.created_at}
                updatedAt={currentIdea.updated_at}
                onClose={onClose}
                onEdit={() => setIsEditing(true)}
              />
            </CardContent>
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
