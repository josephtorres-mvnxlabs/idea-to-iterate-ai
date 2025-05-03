
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
import { Plus, ListTodo, Save, X, Pencil, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { TaskSubmissionForm } from "./TaskSubmissionForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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
  onSuccess?: (epicId: string) => void;
  onCancel?: () => void;
  initialValues?: Partial<EpicFormValues>;
  useSheet?: boolean;
  epicId?: string;
}

// Sample tasks data for demo purposes
const SAMPLE_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Set up biometric authentication API",
    description: "Implement the backend API for biometric authentication",
    status: "backlog",
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
  },
  {
    id: "task-3",
    title: "Optimize CDN performance",
    description: "Configure and optimize CDN for faster asset delivery",
    status: "backlog",
    epic_id: "epic-2",
    estimation: 2,
    priority: "medium",
    assignee_id: "user-3",
    created_by: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_product_idea: false
  },
  {
    id: "task-4",
    title: "Implement recommendation engine",
    description: "Build ML-based recommendation engine for product suggestions",
    status: "in_progress",
    epic_id: "epic-3",
    estimation: 5,
    priority: "high",
    assignee_id: "user-2",
    created_by: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_product_idea: false
  }
];

export function EpicSubmissionForm({ onSuccess, onCancel, initialValues, useSheet = false, epicId }: EpicSubmissionFormProps) {
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
      if (isEditing && epicId) {
        try {
          // In a real app, we would fetch tasks by epic ID from API
          const filteredTasks = SAMPLE_TASKS.filter(task => task.epic_id === epicId);
          setEpicTasks(filteredTasks);
        } catch (error) {
          console.error("Failed to fetch tasks for epic:", error);
        }
      }
    };
    
    fetchTasks();
  }, [isEditing, epicId]);

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
      let createdEpicId = "";
      
      if (isEditing) {
        // Update existing epic
        toast({
          title: "Epic updated",
          description: `Epic "${data.title}" has been updated successfully.`,
        });
        
        // In a real app, we would get the ID from the update response
        createdEpicId = epicId || "updated-epic-id";
      } else {
        // Create new epic
        // In a real app, the create method would return the new epic ID
        const result = await epicApi.create(epicData);
        createdEpicId = result?.id || "new-epic-id";
        
        toast({
          title: "Epic created",
          description: `Epic "${data.title}" has been created successfully.`,
        });
      }
      
      console.log("Epic submitted:", data);
      form.reset();
      
      if (onSuccess) {
        onSuccess(createdEpicId);
      }
    } catch (error) {
      console.error("Failed to create/update epic:", error);
      toast({
        title: "Error",
        description: "Failed to save epic. Please try again.",
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
  
  const handleTaskSuccess = (isNew: boolean = true) => {
    if (isNew) {
      setIsNewTaskDialogOpen(false);
    } else {
      setIsEditTaskDialogOpen(false);
      setSelectedTask(null);
    }
    
    // In a real app, we would refresh the task list from the API
    // For demo purposes, we'll simulate adding/updating a task
    if (isNew && epicId) {
      const newTask: Task = {
        id: `task-${Math.floor(Math.random() * 1000)}`,
        title: "New Sample Task",
        description: "This is a newly added task",
        status: "backlog",
        epic_id: epicId,
        estimation: 2,
        priority: "medium",
        assignee_id: "user-1",
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_product_idea: false
      };
      
      setEpicTasks(prev => [...prev, newTask]);
      
      toast({
        title: "Task added",
        description: "New task has been added to this epic.",
      });
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

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
                  className="bg-devops-purple/10 hover:bg-devops-purple/20"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Task
                </Button>
              </div>
              
              <ScrollArea className="h-[250px] rounded-md border">
                {epicTasks.length > 0 ? (
                  <Table>
                    <TableHeader className="sticky top-0 bg-white">
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
                          <TableCell>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {task.description}
                            </div>
                          </TableCell>
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
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit task</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <ListTodo className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No tasks yet</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Get started by adding your first task to this epic.
                    </p>
                    <Button 
                      type="button"
                      onClick={handleAddTask}
                      className="bg-devops-purple hover:bg-devops-purple-dark"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add first task
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>
          </>
        )}
      </form>
    </Form>
  );

  // For modal dialog rendering
  if (!useSheet) {
    return (
      <>
        <div className="space-y-4">
          <div className="mb-4">
            {formContent}
          </div>
          
          <DialogFooter className="mt-6 pt-4 border-t sticky bottom-0 bg-background pb-2 z-10">
            <Button variant="outline" type="button" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-devops-purple hover:bg-devops-purple-dark"
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Saving...' : 'Creating...'}
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {isEditing ? 'Save Changes' : 'Create Epic'}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
        
        {/* New Task Dialog */}
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Task to Epic</DialogTitle>
              <DialogDescription>
                Create a new task and assign it to this epic
              </DialogDescription>
            </DialogHeader>
            <TaskSubmissionForm 
              onSuccess={() => handleTaskSuccess(true)} 
              onCancel={() => setIsNewTaskDialogOpen(false)}
              isProductIdea={false}
              epicId={initialValues?.title}
            />
            <DialogFooter className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                className="bg-devops-purple hover:bg-devops-purple-dark"
                onClick={() => handleTaskSuccess(true)}
              >
                <Check className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Task Dialog */}
        {selectedTask && (
          <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update task details for this epic
                </DialogDescription>
              </DialogHeader>
              <TaskSubmissionForm 
                onSuccess={() => handleTaskSuccess(false)} 
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
              <DialogFooter className="mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditTaskDialogOpen(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button 
                  className="bg-devops-purple hover:bg-devops-purple-dark"
                  onClick={() => handleTaskSuccess(false)}
                >
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // For sheet rendering (for smaller screens or alternate UI)
  return (
    <Sheet>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>{isEditing ? 'Edit Epic' : 'Create New Epic'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update this epic and manage its tasks' : 'Create a new epic to organize related tasks'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          {formContent}
          <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-background pb-2">
            <Button variant="outline" type="button" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-devops-purple hover:bg-devops-purple-dark"
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Epic' : 'Create Epic')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
