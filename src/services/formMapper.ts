
import { Epic, Task, ProductIdea, User } from '../models/database';

// Map EpicSubmissionForm data to Epic database model
export function mapEpicFormToDatabase(formData: {
  title: string;
  description: string;
  estimation: number;
  capability_category: 'frontend' | 'backend' | 'infrastructure' | 'data' | 'security' | 'other';
}, userId: string): Omit<Epic, 'id' | 'created_at' | 'updated_at' | 'status'> {
  return {
    title: formData.title,
    description: formData.description,
    estimation: formData.estimation,
    capability_category: formData.capability_category,
    created_by: userId,
    owner_id: userId, // Default owner to creator
    team_members: [], // Initialize empty team members array
  };
}

// Map TaskSubmissionForm data to Task database model
export function mapTaskFormToDatabase(
  formData: {
    title: string;
    description: string;
    epic?: string;
    assignee?: string;
    assignee_type?: "developer" | "product" | "scrum" | "other";
    estimation: number;
    priority: "low" | "medium" | "high";
    status?: string; // Accept any status string, will be validated inside
    assigned_date?: string;
    completion_date?: string;
  }, 
  userId: string,
  isProductIdea: boolean = false
): Omit<Task, 'id' | 'created_at' | 'updated_at'> {
  // Determine the appropriate status based on whether it's a product idea or regular task
  let status: Task['status'];
  
  if (isProductIdea) {
    // For product ideas, convert product idea status to appropriate task status
    // Default to 'backlog' if status is missing or not valid for tasks
    status = 'backlog';
  } else {
    // For regular tasks, ensure the status is valid for tasks
    // Cast status to Task['status'] if it's a valid task status, otherwise default to 'ready'
    if (formData.status && ['backlog', 'ready', 'in_progress', 'review', 'done'].includes(formData.status)) {
      status = formData.status as Task['status'];
    } else {
      status = 'ready';
    }
  }

  return {
    title: formData.title,
    description: formData.description,
    epic_id: formData.epic,
    assignee_id: formData.assignee || undefined,
    assignee_type: formData.assignee_type, // This is now properly typed in the Task model
    estimation: formData.estimation,
    priority: formData.priority,
    status: status,
    assigned_date: formData.assigned_date,
    completion_date: formData.completion_date,
    is_product_idea: isProductIdea,
    created_by: userId,
    owner_id: userId,
    team_members: [],
  };
}

// Map ProductIdeaSubmissionForm data to ProductIdea database model
export function mapProductIdeaFormToDatabase(formData: {
  title: string;
  description: string;
  estimation: number;
  priority: 'low' | 'medium' | 'high';
}, userId: string): Omit<ProductIdea, 'id' | 'created_at' | 'updated_at' | 'status'> {
  return {
    title: formData.title,
    description: formData.description,
    estimation: formData.estimation,
    priority: formData.priority,
    created_by: userId,
    owner_id: userId, // Default owner to creator
    team_members: [], // Initialize empty team members array
  };
}

// Map database Epic model to form data
export function mapDatabaseToEpicForm(epic: Epic): {
  title: string;
  description: string;
  estimation: number;
  capability_category: 'frontend' | 'backend' | 'infrastructure' | 'data' | 'security' | 'other';
} {
  return {
    title: epic.title,
    description: epic.description,
    estimation: epic.estimation,
    capability_category: epic.capability_category,
  };
}

// Map database Task model to form data
export function mapDatabaseToTaskForm(task: Task): {
  title: string;
  description: string;
  epic?: string;
  assignee?: string;
  assignee_type?: "developer" | "product" | "scrum" | "other";
  estimation: number;
  priority: 'low' | 'medium' | 'high';
  status?: string;
  assigned_date?: Date;
  completion_date?: Date;
} {
  return {
    title: task.title,
    description: task.description,
    epic: task.epic_id,
    assignee: task.assignee_id,
    assignee_type: task.assignee_type,
    estimation: task.estimation,
    priority: task.priority,
    status: task.status,
    assigned_date: task.assigned_date ? new Date(task.assigned_date) : undefined,
    completion_date: task.completion_date ? new Date(task.completion_date) : undefined,
  };
}

// Map database ProductIdea model to form data
export function mapDatabaseToProductIdeaForm(productIdea: ProductIdea): {
  title: string;
  description: string;
  estimation: number;
  priority: 'low' | 'medium' | 'high';
} {
  return {
    title: productIdea.title,
    description: productIdea.description,
    estimation: productIdea.estimation,
    priority: productIdea.priority,
  };
}

// New utility functions for team member consistency

// Map User to a consistent team member representation
export function mapUserToTeamMember(user: {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  role?: string;
}): {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  initials: string;
} {
  // Generate initials from name
  const initials = user.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    initials,
  };
}

// Get initials from a user's name
export function getInitialsFromName(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
