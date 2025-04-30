
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const epicFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 week").default(4),
});

type EpicFormValues = z.infer<typeof epicFormSchema>;

const defaultValues: Partial<EpicFormValues> = {
  duration: 4,
};

interface EpicSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void; // Added onCancel prop
}

export function EpicSubmissionForm({ onSuccess, onCancel }: EpicSubmissionFormProps) {
  const { toast } = useToast();

  const form = useForm<EpicFormValues>({
    resolver: zodResolver(epicFormSchema),
    defaultValues,
  });

  const onSubmit = (data: EpicFormValues) => {
    toast({
      title: "Epic created",
      description: `Epic "${data.title}" has been created successfully.`,
    });
    
    console.log("Epic submitted:", data);
    form.reset();
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Create New Epic</h2>
        
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
                  placeholder="Describe the epic in detail" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Epic descriptions should clearly outline the overall goal and business value
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration (weeks)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="Estimated duration in weeks"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => {
              form.reset();
              if (onCancel) onCancel();
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-devops-purple hover:bg-devops-purple-dark"
          >
            Create Epic
          </Button>
        </div>
      </form>
    </Form>
  );
}
