
import * as React from "react";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { EpicAccordionItem } from "./EpicAccordionItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EpicSubmissionForm } from "@/components/EpicSubmissionForm";
import { Plus } from "lucide-react";

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

interface LinkedEpicsSectionProps {
  linkedEpicsData: EpicWithTasks[];
  onNewEpicCreated?: (epicTitle: string) => void;
}

export function LinkedEpicsSection({ linkedEpicsData, onNewEpicCreated }: LinkedEpicsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const handleEpicCreationSuccess = () => {
    setIsDialogOpen(false);
    
    // In a real app, the form would return the created epic data
    // For this demo, we'll simulate it with a timeout
    setTimeout(() => {
      if (onNewEpicCreated) {
        // For the mock implementation, we're creating a new mock epic with a generic title
        // In a real app, this would come from the form submission response
        onNewEpicCreated("New Epic");
      }
    }, 500);
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
            <EpicAccordionItem key={epic.id} epic={epic} />
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
          <EpicSubmissionForm
            onSuccess={handleEpicCreationSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
