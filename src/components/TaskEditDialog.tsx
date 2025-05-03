
import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { EpicSubmissionForm } from "@/components/EpicSubmissionForm";
import { Task } from "@/models/database";
import { useToast } from "@/hooks/use-toast";
import { X, Save } from "lucide-react";

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSuccess?: () => void;
}

export function TaskEditDialog({ open, onOpenChange, task, onSuccess }: TaskEditDialogProps) {
  const { toast } = useToast();
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  const [newEpicId, setNewEpicId] = React.useState<string | null>(null);
  
  // Convert task to form values
  const taskValues = task ? {
    title: task.title,
    description: task.description || "",
    epic: task.epic_id,
    assignee: task.assignee_id,
    estimation: task.estimation,
    priority: task.priority,
  } : undefined;
  
  const handleEpicCreationSuccess = (epicId: string) => {
    setNewEpicId(epicId);
    setIsCreatingEpic(false);
    toast({
      title: "Epic created",
      description: "New epic created successfully. You can now link it to this task."
    });
  };
  
  // Handle when task form selects "Create new epic" option
  const handleCreateNewEpic = () => {
    setIsCreatingEpic(true);
  };
  
  const handleTaskSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onOpenChange(false);
  };
  
  return (
    <>
      <Dialog open={open && !isCreatingEpic} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details and epic association
            </DialogDescription>
          </DialogHeader>
          <TaskSubmissionForm 
            onSuccess={handleTaskSuccess} 
            onCancel={() => onOpenChange(false)}
            isProductIdea={false}
            epicId={newEpicId || undefined}
            taskValues={taskValues}
            onCreateNewEpic={handleCreateNewEpic}
          />
        </DialogContent>
      </Dialog>
      
      {/* Epic Creation Dialog */}
      <Dialog open={isCreatingEpic} onOpenChange={setIsCreatingEpic}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Create New Epic</DialogTitle>
            <DialogDescription>
              Create a new epic to link to this task
            </DialogDescription>
          </DialogHeader>
          <EpicSubmissionForm 
            onSuccess={() => handleEpicCreationSuccess("new-epic-id")} 
            onCancel={() => setIsCreatingEpic(false)} 
          />
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreatingEpic(false)}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button 
              className="bg-devops-purple hover:bg-devops-purple-dark"
              onClick={() => handleEpicCreationSuccess("new-epic-id")}
            >
              <Save className="h-4 w-4 mr-1" /> Create Epic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
