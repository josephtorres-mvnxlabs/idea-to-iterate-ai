
import * as React from "react";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { EpicAccordionItem } from "./EpicAccordionItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productIdeaApi } from "@/services/api";
import { EpicSubmissionWithIdeaLinking } from "@/components/EpicSubmissionWithIdeaLinking";

interface EpicWithTasks {
  id: string;
  title: string;
  description: string;
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    assigned_date?: string;
    completion_date?: string;
    estimation?: number;
  }[];
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

interface LinkedEpicsSectionProps {
  ideaId?: string;
  linkedEpicsData: EpicWithTasks[];
  onNewEpicCreated?: (epicTitle: string) => void;
  onEpicLinked?: (epicId: string) => void;
  onEpicUnlinked?: (epicId: string) => void;
  allowUnlink?: boolean;
}

export function LinkedEpicsSection({ 
  ideaId,
  linkedEpicsData, 
  onNewEpicCreated,
  onEpicLinked,
  onEpicUnlinked,
  allowUnlink = true
}: LinkedEpicsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();
  
  const handleEpicCreationSuccess = () => {
    setIsDialogOpen(false);
    
    // The linking is now handled by the EpicSubmissionWithIdeaLinking component
    toast({
      title: "Epic created",
      description: "New epic has been created and linked to this product idea.",
    });
  };
  
  const handleUnlinkEpic = async (epicId: string, epicTitle: string) => {
    if (!ideaId) return;
    
    try {
      await productIdeaApi.unlinkFromEpic(ideaId, epicId);
      toast({
        title: "Epic unlinked",
        description: `Epic "${epicTitle}" has been unlinked from this product idea.`,
      });
      
      if (onEpicUnlinked) {
        onEpicUnlinked(epicId);
      }
    } catch (error) {
      console.error("Error unlinking epic:", error);
      toast({
        title: "Error",
        description: "Failed to unlink epic. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Linked Epics</h3>
        <Button 
          size="sm" 
          onClick={() => setIsDialogOpen(true)}
          className="bg-devops-purple hover:bg-devops-purple-dark"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Epic
        </Button>
      </div>
      
      {linkedEpicsData.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {linkedEpicsData.map((epic) => (
            <EpicAccordionItem 
              key={epic.id} 
              epic={epic} 
              onUnlink={allowUnlink ? () => handleUnlinkEpic(epic.id, epic.title) : undefined}
            />
          ))}
        </Accordion>
      ) : (
        <Card className="bg-muted/40">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">No epics linked to this product idea yet</p>
          </CardContent>
        </Card>
      )}
      
      {/* Epic Creation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Create New Epic</DialogTitle>
          <EpicSubmissionWithIdeaLinking
            onSuccess={handleEpicCreationSuccess}
            onCancel={() => setIsDialogOpen(false)}
            productIdeaId={ideaId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
