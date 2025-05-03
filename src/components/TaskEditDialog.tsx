
import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { EpicSubmissionForm } from "@/components/EpicSubmissionForm";
import { Task } from "@/models/database";
import { useToast } from "@/hooks/use-toast";
import { epicApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

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
  
  // Fetch the epic data to ensure we have the correct information
  const { data: epics } = useQuery({
    queryKey: ['epics'],
    queryFn: epicApi.getAll,
    enabled: open && !!task,
  });
  
  // Convert task to form values, ensuring the epic field is correctly set
  const taskValues = React.useMemo(() => {
    if (!task) return undefined;
    
    return {
      title: task.title,
      description: task.description || "",
      epic: task.epic_id,  // Pass the epic_id directly
      assignee: task.assignee_id,
      estimation: task.estimation,
      priority: task.priority,
    };
  }, [task]);
  
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
            // Only pass newEpicId if it's set, otherwise use task's existing epic
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
            onSuccess={(epicId) => handleEpicCreationSuccess(epicId)}
            onCancel={() => setIsCreatingEpic(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
