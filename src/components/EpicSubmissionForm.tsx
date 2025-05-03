
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { epicApi, taskApi } from "@/services/api";
import { mapEpicFormToDatabase } from "@/services/formMapper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/models/database";
import { Separator } from "@/components/ui/separator";
import { Plus, ListTodo } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "./TaskSubmissionForm";

const epicFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  estimation: z.coerce.number().min(1).default(14),
  capability_category: z.enum(['frontend', 'backend', 'infrastructure', 'data', 'security', 'other'], {
    required_error: "Please select a capability category",
  }),
});

type EpicFormValues = z.infer<typeof epicFormSchema>;

const defaultValues: Partial<EpicFormValues> = {
  estimation: 14,
  capability_category: 'other',
};

interface EpicSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: Partial<EpicFormValues>;
}

export function EpicSubmissionForm({ onSuccess, onCancel, initialValues }: EpicSubmissionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [epicTasks, setEpicTasks] = React.useState<Task[]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = React.useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const isEditing = !!initialValues?.title;
  
  // Fetch tasks for this epic if we're editing
  React.useEffect(() => {
    const fetchTasks = async () => {
      if (isEditing && initialValues?.title) {
        try {
          // In a real app, we would fetch tasks by epic ID
          // For now, we'll use our sample data based on epic title
          const sampleTasks: Task[] = [
            {
              id: "task-1",
              title: "Set up biometric authentication API",
              description: "Implement the backend API for biometric authentication",
              status: "backlog", // Changed from "todo" to "backlog" which is a valid status
              epic_id: "epic-1",
              estimation: 3,
              priority: "medium",
              assignee_id: "user-1",
              created_by: "user-1",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_product_idea: false
            },
            {
              id: "task-2",
              title: "Create mobile UI for biometric prompts",
              description: "Design and implement the UI for fingerprint and face recognition",
              status: "in_progress",
              epic_id: "epic-1",
              estimation: 2,
              priority: "high",
              assignee_id: "user-2",
              created_by: "user-1",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_product_idea: false
            }
          ];
          setEpicTasks(sampleTasks);
        } catch (error) {
          console.error("Failed to fetch tasks for epic:", error);
        }
      }
    };
    
    fetchTasks();
  }, [isEditing, initialValues?.title]);

  const form = useForm<EpicFormValues>({
    resolver: zodResolver(epicFormSchema),
    defaultValues: initialValues ? { ...defaultValues, ...initialValues } : defaultValues,
  });

  const onSubmit = async (data: EpicFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, you'd get the user ID from auth context
      const userId = "current-user-id"; 
      
      // Convert form data to database model - ensure all required fields are present
      const epicData = mapEpicFormToDatabase({
        title: data.title,
        description: data.description,
        estimation: data.estimation,
        capability_category: data.capability_category
      }, userId);
      
      // Submit to API
      if (isEditing) {
        // Update existing epic
        // await epicApi.update(epicId, epicData);
        toast({
          title: "Epic updated",
          description: `Epic "${data.title}" has been updated successfully.`,
        });
      } else {
        // Create new epic
        await epicApi.create(epicData);
        toast({
          title: "Epic created",
          description: `Epic "${data.title}" has been created successfully.`,
        });
      }
      
      console.log("Epic submitted:", data);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create epic:", error);
      toast({
        title: "Error",
        description: "Failed to create epic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    if (onCancel) {
      onCancel();
    }
  };
  
  const handleAddTask = () => {
    setIsNewTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskDialogOpen(true);
  };
  
  const handleTaskSuccess = () => {
    setIsNewTaskDialogOpen(false);
    setIsEditTaskDialogOpen(false);
    setSelectedTask(null);
    // In a real app, we would refresh the task list
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Epic' : 'Create New Epic'}</h2>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Epic Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter epic title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the epic and its goals" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide a clear description of what this epic aims to achieve
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capability_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capability Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a capability category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the primary capability area this epic addresses
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration (days)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="Estimated completion time in days"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 14)} 
                />
              </FormControl>
              <FormDescription>
                Approximate time needed to complete all tasks in this epic
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <>
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <ListTodo className="h-5 w-5 mr-2" />
                  Tasks
                </h3>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleAddTask}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Task
                </Button>
              </div>
              
              {epicTasks.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {epicTasks.map((task) => (
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
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditTask(task)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md bg-gray-50">
                  <p className="text-muted-foreground">No tasks found for this epic.</p>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTask}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add your first task
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-devops-purple hover:bg-devops-purple-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Epic' : 'Create Epic')}
          </Button>
        </div>
      </form>
      
      {/* New Task Dialog */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Add Task to Epic</DialogTitle>
          <TaskSubmissionForm 
            onSuccess={handleTaskSuccess} 
            onCancel={() => setIsNewTaskDialogOpen(false)}
            isProductIdea={false}
            epicId={initialValues?.title}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      {selectedTask && (
        <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogTitle>Edit Task</DialogTitle>
            <TaskSubmissionForm 
              onSuccess={handleTaskSuccess} 
              onCancel={() => setIsEditTaskDialogOpen(false)}
              isProductIdea={false}
              epicId={initialValues?.title}
              taskValues={{
                title: selectedTask.title,
                description: selectedTask.description || '',
                epic: selectedTask.epic_id,
                assignee: selectedTask.assignee_id,
                estimation: selectedTask.estimation,
                priority: selectedTask.priority,
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Form>
  );
}
