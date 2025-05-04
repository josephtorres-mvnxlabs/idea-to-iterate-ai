
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { taskApi, epicApi, userApi } from "@/services/api";
import { mapTaskFormToDatabase } from "@/services/formMapper";
import { useQuery } from "@tanstack/react-query";
import { Epic, User } from "@/models/database";
import { format } from "date-fns";
import { TaskFormBasicFields } from "./TaskFormFields";
import { TaskFormEstimationFields } from "./TaskFormEstimation";
import { TaskFormDateFields } from "./TaskFormDates";
import { TaskFormValues, taskFormSchema, defaultFormValues, TaskStatus, ProductIdeaStatus } from "./types";

interface TaskSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isProductIdea?: boolean;
  epicId?: string;
  taskValues?: Partial<TaskFormValues>;
}

export function TaskSubmissionForm({ 
  onSuccess, 
  onCancel, 
  isProductIdea = false,
  epicId,
  taskValues
}: TaskSubmissionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!taskValues;

  // Fetch epics for dropdown
  const { data: epics } = useQuery({
    queryKey: ['epics'],
    queryFn: epicApi.getAll,
    placeholderData: [] as Epic[]
  });

  // Fetch team members for dropdown
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
    placeholderData: [] as User[]
  });

  // Create form values combining defaults, passed values, and preselected epic
  const formDefaultValues = React.useMemo(() => {
    // Set appropriate default status based on whether it's a product idea
    const defaultStatus = isProductIdea ? 
      "proposed" as ProductIdeaStatus : 
      "backlog" as TaskStatus;
    
    return {
      ...defaultFormValues,
      status: defaultStatus,
      ...(taskValues || {}),
      // When editing, prioritize the epic from taskValues, otherwise use the provided epicId
      epic: (taskValues?.epic || epicId)
    };
  }, [epicId, taskValues, isProductIdea]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: formDefaultValues,
  });

  // If epicId changes and we're not in edit mode, update the epic field
  React.useEffect(() => {
    if (epicId && !isEditing) {
      form.setValue('epic', epicId);
    }
  }, [epicId, form, isEditing]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, you'd get the user ID from auth context
      const userId = "current-user-id"; 
      
      // Convert form data to database model - ensure all required fields are present
      // Pass the form status as a string and let the mapper handle the type conversion
      const taskData = mapTaskFormToDatabase({
        title: data.title,
        description: data.description,
        epic: data.epic || epicId, // Prioritize form data but fall back to epicId
        assignee: data.assignee,
        assignee_type: data.assignee_type,
        estimation: data.estimation,
        priority: data.priority,
        status: data.status,
        assigned_date: data.assigned_date ? format(data.assigned_date, "yyyy-MM-dd") : undefined,
        completion_date: data.completion_date ? format(data.completion_date, "yyyy-MM-dd") : undefined
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
        
        {/* Basic task information fields */}
        <TaskFormBasicFields 
          form={form} 
          isProductIdea={isProductIdea} 
          epicId={epicId} 
          epics={epics}
          users={users}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estimation and priority fields */}
          <TaskFormEstimationFields
            form={form}
            isProductIdea={isProductIdea}
            isEditing={isEditing}
          />

          {/* Date fields - only show for tasks, not product ideas */}
          {!isProductIdea && (
            <TaskFormDateFields form={form} />
          )}
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
