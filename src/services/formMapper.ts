
import { Epic, Task, ProductIdea } from '../models/database';

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
export function mapTaskFormToDatabase(formData: {
  title: string;
  description: string;
  epic?: string;
  assignee?: string;
  estimation: number;
  priority: 'low' | 'medium' | 'high';
  assigned_date?: string;
  completion_date?: string;
}, userId: string, isProductIdea: boolean = false): Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'> {
  return {
    title: formData.title,
    description: formData.description,
    epic_id: formData.epic,
    assignee_id: formData.assignee,
    estimation: formData.estimation,
    priority: formData.priority,
    assigned_date: formData.assigned_date,
    completion_date: formData.completion_date,
    is_product_idea: isProductIdea,
    created_by: userId,
    owner_id: userId, // Default owner to creator
    team_members: [], // Initialize empty team members array
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
  estimation: number;
  priority: 'low' | 'medium' | 'high';
  assigned_date?: Date;
  completion_date?: Date;
} {
  return {
    title: task.title,
    description: task.description,
    epic: task.epic_id,
    assignee: task.assignee_id,
    estimation: task.estimation,
    priority: task.priority,
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
