
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";

interface EpicTaskTableProps {
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
  epicId?: string;
}

export function EpicTaskTable({ tasks, epicId }: EpicTaskTableProps) {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Tasks</h4>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 text-xs"
          onClick={() => setIsAddTaskDialogOpen(true)}
        >
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
            {tasks.length > 0 ? (
              tasks.map((task) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  No tasks in this epic yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Task Creation Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Add Task to Epic</DialogTitle>
          <TaskSubmissionForm 
            onSuccess={() => setIsAddTaskDialogOpen(false)} 
            onCancel={() => setIsAddTaskDialogOpen(false)}
            epicId={epicId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
