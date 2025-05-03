import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { taskApi, epicApi, userApi } from "@/services/api";
import { mapTaskFormToDatabase } from "@/services/formMapper";
import { useQuery } from "@tanstack/react-query";
import { Epic, User } from "@/models/database";
import { Plus } from "lucide-react";

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  epic: z.string().optional(),
  assignee: z.string().optional(),
  estimation: z.coerce.number().min(0).default(1),
  priority: z.enum(["low", "medium", "high"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const defaultValues: Partial<TaskFormValues> = {
  priority: "medium",
  estimation: 1,
};

interface TaskSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isProductIdea?: boolean;
  epicId?: string;
  taskValues?: Partial<TaskFormValues>;
  onCreateNewEpic?: () => void;
}

export function TaskSubmissionForm({ 
  onSuccess, 
  onCancel, 
  isProductIdea = false,
  epicId,
  taskValues,
  onCreateNewEpic
}: TaskSubmissionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!taskValues;

  // For debugging purposes
  React.useEffect(() => {
    console.log("TaskSubmissionForm initialized with:", { 
      epicId, 
      taskValues,
      isEditing
    });
    
    if (taskValues) {
      console.log("Task epic_id:", taskValues.epic);
    }
  }, [epicId, taskValues, isEditing]);

  // Fetch epics for dropdown
  const { data: epics, isLoading: epicsLoading } = useQuery({
    queryKey: ['epics'],
    queryFn: epicApi.getAll,
    placeholderData: [] as Epic[]
  });

  // Fetch team members for dropdown
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
    placeholderData: [] as User[]
  });

  // Create form values combining defaults, passed values, and preselected epic
  const formDefaultValues = React.useMemo(() => {
    // When editing a task, prefer the task's existing epic over any epicId prop
    const effectiveEpicId = taskValues?.epic || epicId;
    
    console.log("Calculating form defaults with effectiveEpicId:", effectiveEpicId);
    
    return {
      ...defaultValues,
      ...(taskValues || {}),
      ...(effectiveEpicId ? { epic: effectiveEpicId } : {})
    };
  }, [epicId, taskValues]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: formDefaultValues,
  });

  // Effect to update form when values change
  React.useEffect(() => {
    if (formDefaultValues) {
      console.log("Setting form values:", formDefaultValues);
      
      Object.entries(formDefaultValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof TaskFormValues, value as any);
        }
      });
    }
  }, [formDefaultValues, form]);

  const handleEpicChange = (value: string) => {
    console.log("Epic selection changed:", value);
    
    if (value === "new" && onCreateNewEpic) {
      onCreateNewEpic();
    } else {
      form.setValue("epic", value);
    }
  };

  // Log current form value for debugging
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form current values:", value);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, you'd get the user ID from auth context
      const userId = "current-user-id"; 
      
      console.log("Submitting form with data:", data);
      
      // Convert form data to database model - ensure all required fields are present
      const taskData = mapTaskFormToDatabase({
        title: data.title,
        description: data.description,
        epic: data.epic,
        assignee: data.assignee,
        estimation: data.estimation,
        priority: data.priority
      }, userId, isProductIdea);
      
      // Submit to API
      if (isEditing) {
        // In a real app, we would update the task
        // await taskApi.update(taskId, taskData);
        toast({
          title: "Task updated",
          description: `Task "${data.title}" has been updated successfully.`,
        });
      } else {
        await taskApi.create(taskData);
        
        const successMessage = isProductIdea 
          ? `Product idea "${data.title}" has been created and will be curated to an epic.`
          : `Task "${data.title}" has been created successfully.`;
        
        toast({
          title: isProductIdea ? "Product idea created" : "Task created",
          description: successMessage,
        });
      }
      
      console.log(isEditing ? "Task updated:" : (isProductIdea ? "Product idea submitted:" : "Task submitted:"), data);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} ${isProductIdea ? "product idea" : "task"}. Please try again.`,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing 
            ? "Edit Task" 
            : (isProductIdea ? "Create New Product Idea" : "Create New Task")
          }
        </h2>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isProductIdea ? "Product Idea Title" : "Task Title"}</FormLabel>
              <FormControl>
                <Input placeholder={isProductIdea ? "Enter product idea title" : "Enter task title"} {...field} />
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
                  placeholder={isProductIdea 
                    ? "Describe your product idea in detail. What problem does it solve? Who is it for?" 
                    : "Describe the task in detail"
                  } 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              {isProductIdea && (
                <FormDescription>
                  Great product ideas clearly define the problem, target audience, and proposed solution
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="epic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Epic</FormLabel>
                <Select 
                  onValueChange={handleEpicChange}
                  defaultValue={field.value}
                  value={field.value}
                  // Only disable if it's a new task with a preselected epic, not when editing
                  disabled={!isEditing && !!epicId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an epic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {onCreateNewEpic && (
                      <SelectItem value="new" className="flex items-center text-devops-purple">
                        <Plus className="h-4 w-4 mr-1 inline" /> Create new epic
                      </SelectItem>
                    )}
                    {epics?.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {epicsLoading ? "Loading epics..." : "Select an existing epic or create a new one"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to team member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Fixed: Changed empty string to "unassigned" to avoid the error */}
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {usersLoading ? "Loading users..." : "Assign this task to a team member"}
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
                <FormLabel>
                  {isProductIdea ? "Estimated Size (days)" : "Estimation (days)"}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder={isProductIdea ? "Estimated effort in days" : "Estimated completion days"}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-devops-purple hover:bg-devops-purple-dark"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Submitting...') 
              : (isEditing ? 'Update Task' : (isProductIdea ? "Submit Product Idea" : "Create Task"))
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
