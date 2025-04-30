
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

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  epic: z.string().optional(),
  assignee: z.string().optional(),
  estimation: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  }),
  priority: z.enum(["low", "medium", "high"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const defaultValues: Partial<TaskFormValues> = {
  priority: "medium",
  estimation: "1",
};

export function TaskSubmissionForm() {
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const onSubmit = (data: TaskFormValues) => {
    toast({
      title: "Task created",
      description: `Task "${data.title}" has been created successfully.`,
    });
    
    console.log("Task submitted:", data);
    form.reset();
  };

  // Sample epic data
  const epics = [
    { id: "1", name: "User Authentication System Overhaul" },
    { id: "2", name: "Performance Optimization Initiative" },
    { id: "3", name: "ML-Driven Recommendations" },
  ];

  // Sample team members
  const teamMembers = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Emma Watson" },
    { id: "3", name: "Michael Brown" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
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
                  placeholder="Describe the task in detail" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
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
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an epic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {epics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The epic this task belongs to
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
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to team member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimation (days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="Estimated completion days" 
                    {...field} 
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
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-devops-purple hover:bg-devops-purple-dark"
          >
            Create Task
          </Button>
        </div>
      </form>
    </Form>
  );
}
