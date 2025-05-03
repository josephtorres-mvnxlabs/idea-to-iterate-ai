
import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "./types";

interface TaskFormEstimationFieldsProps {
  form: UseFormReturn<TaskFormValues>;
  isProductIdea?: boolean;
  isEditing?: boolean;
}

export function TaskFormEstimationFields({
  form,
  isProductIdea = false,
  isEditing = false
}: TaskFormEstimationFieldsProps) {
  return (
    <>
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
      
      {/* Add Task Status field for editing */}
      {isEditing && (
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Current task status
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
