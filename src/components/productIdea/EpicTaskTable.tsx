
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, differenceInDays } from "date-fns";

interface EpicTaskTableProps {
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    assigned_date?: string;
    completion_date?: string;
    estimation?: number;
  }[];
  epicId?: string;
}

export function EpicTaskTable({ tasks, epicId }: EpicTaskTableProps) {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  
  // Function to calculate days difference between assigned and completion dates
  const calculateActualDays = (assignedDate?: string, completionDate?: string): number | null => {
    if (!assignedDate || !completionDate) return null;
    
    const start = new Date(assignedDate);
    const end = new Date(completionDate);
    
    // Add 1 to include both start and end days
    return differenceInDays(end, start) + 1;
  };
  
  // Function to format dates for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "—";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Sort the tasks by status priority: in_progress > backlog/ready > done
  const sortedTasks = React.useMemo(() => {
    const getStatusPriority = (status: string): number => {
      if (status === 'in_progress') return 1;
      if (status === 'backlog' || status === 'ready') return 2;
      if (status === 'review') return 3;
      if (status === 'done') return 4;
      return 5; // Default for any other status
    };

    return [...tasks].sort((a, b) => {
      return getStatusPriority(a.status) - getStatusPriority(b.status);
    });
  }, [tasks]);
  
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
              <TableHead>Dates</TableHead>
              <TableHead>Est/Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => {
                const actualDays = calculateActualDays(task.assigned_date, task.completion_date);
                const isOverEstimated = actualDays !== null && task.estimation !== undefined && actualDays > task.estimation;
                
                return (
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
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {task.assigned_date && formatDate(task.assigned_date)}
                              {task.assigned_date && task.completion_date && " → "}
                              {task.completion_date && formatDate(task.completion_date)}
                              {!task.assigned_date && !task.completion_date && "—"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              {task.assigned_date ? (
                                <p>Assigned: {formatDate(task.assigned_date)}</p>
                              ) : (
                                <p>Not assigned yet</p>
                              )}
                              {task.completion_date ? (
                                <p>Completed: {formatDate(task.completion_date)}</p>
                              ) : (
                                <p>Not completed yet</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className={`text-xs ${isOverEstimated ? 'text-red-600 font-medium' : ''}`}>
                        {task.estimation || '—'}/{actualDays || '—'} days
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
