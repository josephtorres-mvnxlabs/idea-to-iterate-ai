
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
}, userId: string, isProductIdea: boolean = false): Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'> {
  return {
    title: formData.title,
    description: formData.description,
    epic_id: formData.epic,
    assignee_id: formData.assignee,
    estimation: formData.estimation,
    priority: formData.priority,
    is_product_idea: isProductIdea,
    created_by: userId,
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
} {
  return {
    title: task.title,
    description: task.description,
    epic: task.epic_id,
    assignee: task.assignee_id,
    estimation: task.estimation,
    priority: task.priority,
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
