
import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Epic, User } from "@/models/database";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "./types";

interface TaskFormBasicFieldsProps {
  form: UseFormReturn<TaskFormValues>;
  isProductIdea?: boolean;
  epicId?: string;
  epics?: Epic[];
  users?: User[];
}

export function TaskFormBasicFields({
  form, 
  isProductIdea = false,
  epicId,
  epics = [],
  users = []
}: TaskFormBasicFieldsProps) {
  return (
    <>
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

      {isProductIdea ? (
        <FormField
          control={form.control}
          name="epic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Epic</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!!epicId && !form.getValues().epic}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an epic or create new" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">+ Create new epic</SelectItem>
                  {epics?.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>
                      {epic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select an existing epic or create a new one
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="epic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Epic</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!!epicId && !form.getValues().epic}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an epic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {epics?.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>
                      {epic.title}
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
      )}

      <FormField
        control={form.control}
        name="assignee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assignee</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to team member" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
