import React, { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { EpicSubmissionForm } from "@/components/EpicSubmissionForm";

const EpicsAndTasks = () => {
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openEpicDialog, setOpenEpicDialog] = useState(false);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Epics & Tasks</h1>
        <div className="flex gap-2">
          <Dialog open={openEpicDialog} onOpenChange={setOpenEpicDialog}>
            <DialogTrigger asChild>
              <Button className="bg-devops-purple hover:bg-devops-purple-dark">
                <Plus className="h-4 w-4 mr-1" />
                New Epic
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <EpicSubmissionForm 
                onSuccess={() => setOpenEpicDialog(false)} 
                onCancel={() => setOpenEpicDialog(false)} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <TaskSubmissionForm 
                onSuccess={() => setOpenTaskDialog(false)} 
                onCancel={() => setOpenTaskDialog(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Epic and task content would go here */}
    </MainLayout>
  );
};

export default EpicsAndTasks;
