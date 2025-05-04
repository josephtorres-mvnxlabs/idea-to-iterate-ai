
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, X, UserPlus } from "lucide-react";

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
import { ProductIdea, User } from "@/models/database";
import { Badge } from "./ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitialsFromName } from "@/services/formMapper";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  estimation: z.coerce.number().min(1, "Estimation is required").max(365, "Estimation must be less than 365 days"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Priority is required",
  }),
  status: z.enum(["proposed", "under_review", "approved", "rejected", "implemented"], {
    required_error: "Status is required",
  }),
  owner_id: z.string().min(1, "Owner is required"),
});

interface EditProductIdeaFormProps {
  idea: ProductIdea & {
    linkedEpics: string[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
    owner?: User;
    teamMembers?: User[];
  };
  onSave: (updatedIdea: Partial<ProductIdea> & { 
    linkedEpics?: string[];
    owner_id?: string;
    team_members?: string[];
  }) => void;
  onCancel: () => void;
  availableEpics?: string[];
  availableUsers?: User[];
}

export function EditProductIdeaForm({ 
  idea, 
  onSave, 
  onCancel,
  availableEpics = ["ML-Driven Recommendations", "Performance Optimization Initiative", "Mobile App Strategy", "User Engagement Analytics", "Cloud Migration Project"],
  availableUsers = [
    { id: "user-1", name: "Alex Johnson", email: "alex.j@company.com", role: "admin", user_type: "developer", created_at: "", avatar_url: "https://i.pravatar.cc/150?img=1" },
    { id: "user-2", name: "Maria Garcia", email: "maria.g@company.com", role: "member", user_type: "product", created_at: "", avatar_url: "https://i.pravatar.cc/150?img=2" },
    { id: "user-3", name: "Tyler Smith", email: "tyler.s@company.com", role: "member", user_type: "scrum", created_at: "", avatar_url: "https://i.pravatar.cc/150?img=3" },
    { id: "user-4", name: "Sam Wong", email: "sam.w@company.com", role: "member", user_type: "developer", created_at: "", avatar_url: "https://i.pravatar.cc/150?img=4" },
    { id: "user-5", name: "Jamie Lee", email: "jamie.l@company.com", role: "member", user_type: "product", created_at: "", avatar_url: "https://i.pravatar.cc/150?img=5" },
    { id: "user-6", name: "Robin Chen", email: "robin.c@company.com", role: "member", user_type: "developer", created_at: "", avatar_url: "https://i.pravatar.cc/150?img=6" }
  ]
}: EditProductIdeaFormProps) {
  const [linkedEpics, setLinkedEpics] = React.useState<string[]>(idea.linkedEpics || []);
  const [newEpic, setNewEpic] = React.useState<string>("");
  const [selectedTeamMembers, setSelectedTeamMembers] = React.useState<User[]>(idea.teamMembers || []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [teamSelectorOpen, setTeamSelectorOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: idea.title,
      description: idea.description,
      estimation: idea.estimation,
      priority: idea.priority,
      status: idea.status || "proposed",
      owner_id: idea.owner?.id || idea.owner_id || availableUsers[0].id,
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

  const handleAddTeamMember = (user: User) => {
    // Check if user is already in team
    if (!selectedTeamMembers.some(member => member.id === user.id)) {
      setSelectedTeamMembers([...selectedTeamMembers, user]);
    }
    setTeamSelectorOpen(false);
  };

  const handleRemoveTeamMember = (userId: string) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(member => member.id !== userId));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Get team member IDs
    const teamMemberIds = selectedTeamMembers.map(member => member.id);
    
    // Simulate API call
    setTimeout(() => {
      onSave({
        ...values,
        linkedEpics,
        team_members: teamMemberIds,
      });
      setIsSubmitting(false);
    }, 600);
  };

  // Filter out already linked epics from available epics
  const filteredAvailableEpics = availableEpics.filter(
    epic => !linkedEpics.includes(epic)
  );

  // Filter out users who are already in the team
  const filteredAvailableUsers = availableUsers.filter(
    user => !selectedTeamMembers.some(member => member.id === user.id)
  );

  // Get owner user object
  const ownerUser = availableUsers.find(user => user.id === form.watch("owner_id"));

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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposed">Proposed</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Current status of the product idea
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="owner_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Owner</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product owner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {user.avatar_url ? (
                            <AvatarImage src={user.avatar_url} alt={user.name} />
                          ) : (
                            <AvatarFallback>
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {user.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Team Members</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {selectedTeamMembers.map((member) => (
              <Badge key={member.id} className="flex items-center gap-1 py-1.5 px-3">
                <Avatar className="h-4 w-4 mr-1">
                  {member.avatar_url ? (
                    <AvatarImage src={member.avatar_url} alt={member.name} />
                  ) : (
                    <AvatarFallback className="text-[10px]">
                      {getInitialsFromName(member.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {member.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveTeamMember(member.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {selectedTeamMembers.length === 0 && (
              <div className="text-sm text-muted-foreground">No team members added yet</div>
            )}
          </div>

          <div className="flex gap-2">
            <Popover open={teamSelectorOpen} onOpenChange={setTeamSelectorOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search team members..." />
                  <CommandList>
                    <CommandEmpty>No members found.</CommandEmpty>
                    <CommandGroup heading="Available Team Members">
                      {filteredAvailableUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => handleAddTeamMember(user)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Avatar className="h-6 w-6">
                            {user.avatar_url ? (
                              <AvatarImage src={user.avatar_url} alt={user.name} />
                            ) : (
                              <AvatarFallback>
                                {getInitialsFromName(user.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {user.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
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
