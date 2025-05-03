
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductIdea } from "@/models/database";
import { Badge } from "./ui/badge";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  estimation: z.coerce.number().min(1, "Estimation is required").max(365, "Estimation must be less than 365 days"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Priority is required",
  }),
});

interface EditProductIdeaFormProps {
  idea: ProductIdea & {
    linkedEpics: string[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
  };
  onSave: (updatedIdea: Partial<ProductIdea> & { linkedEpics?: string[] }) => void;
  onCancel: () => void;
  availableEpics?: string[];
}

export function EditProductIdeaForm({ 
  idea, 
  onSave, 
  onCancel,
  availableEpics = ["ML-Driven Recommendations", "Performance Optimization Initiative", "Mobile App Strategy", "User Engagement Analytics", "Cloud Migration Project"]
}: EditProductIdeaFormProps) {
  const [linkedEpics, setLinkedEpics] = React.useState<string[]>(idea.linkedEpics || []);
  const [newEpic, setNewEpic] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: idea.title,
      description: idea.description,
      estimation: idea.estimation,
      priority: idea.priority,
    },
  });

  const handleAddEpic = () => {
    if (newEpic && !linkedEpics.includes(newEpic)) {
      setLinkedEpics([...linkedEpics, newEpic]);
      setNewEpic("");
    }
  };

  const handleRemoveEpic = (epic: string) => {
    setLinkedEpics(linkedEpics.filter(e => e !== epic));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSave({
        ...values,
        linkedEpics,
      });
      setIsSubmitting(false);
    }, 600);
  };

  // Filter out already linked epics from available epics
  const filteredAvailableEpics = availableEpics.filter(
    epic => !linkedEpics.includes(epic)
  );

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
                <Input placeholder="Enter idea title" {...field} />
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
                  placeholder="Enter detailed description" 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide a comprehensive description of the product idea
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimation (days)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
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
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Linked Epics</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {linkedEpics.map((epic) => (
              <Badge key={epic} className="flex items-center gap-1 py-1.5 px-3">
                {epic}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveEpic(epic)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {linkedEpics.length === 0 && (
              <div className="text-sm text-muted-foreground">No epics linked yet</div>
            )}
          </div>

          <div className="flex gap-2">
            <select
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={newEpic}
              onChange={(e) => setNewEpic(e.target.value)}
            >
              <option value="">Select an epic to link</option>
              {filteredAvailableEpics.map((epic) => (
                <option key={epic} value={epic}>
                  {epic}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={handleAddEpic}
              disabled={!newEpic}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
