
// This file defines our database schema and models

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  estimation: number; // in days
  capability_category: 'frontend' | 'backend' | 'infrastructure' | 'data' | 'security' | 'other';
  status: 'planning' | 'in_progress' | 'completed';
  created_by: string; // user_id
  owner_id: string; // user_id of the owner
  team_members: string[]; // array of user_ids that are part of this epic's team
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  epic_id?: string; // Optional as some tasks might not be part of an epic
  assignee_id?: string; // Optional as tasks can be unassigned
  owner_id: string; // user_id of the task owner
  team_members: string[]; // array of user_ids that are part of this task's team
  estimation: number; // in days
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'ready' | 'in_progress' | 'review' | 'done';
  is_product_idea: boolean; // To differentiate between regular tasks and product ideas
  assigned_date?: string; // Date when the task was assigned
  completion_date?: string; // Date when the task was completed
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

// New interface for ProductIdea
export interface ProductIdea {
  id: string;
  title: string;
  description: string;
  estimation: number; // estimated size in days
  priority: 'low' | 'medium' | 'high';
  status: 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  owner_id: string; // user_id of the owner
  team_members: string[]; // array of user_ids that are part of this product idea's team
  created_by: string; // user_id
  created_at: string;
  updated_at: string;
}

// Junction table to link product ideas to epics (many-to-many)
export interface ProductIdeaEpicLink {
  id: string;
  product_idea_id: string;
  epic_id: string;
  created_at: string;
}

// Database Views / Aggregations
export interface EpicWithTasks extends Epic {
  tasks: Task[];
  completion_percentage: number;
  total_estimation: number;
  completed_tasks_count: number;
  total_tasks_count: number;
}

export interface UserWithTasks extends User {
  assigned_tasks: Task[];
  total_workload: number;
}

export interface ProductIdeaWithEpics extends ProductIdea {
  epics: EpicWithTasks[];
  implementation_status: number; // percentage of completion based on linked epics
  completed_tasks_count: number;
  total_tasks_count: number;
}

// Define the table names for use in API calls
export const TABLES = {
  USERS: 'users',
  EPICS: 'epics',
  TASKS: 'tasks',
  PRODUCT_IDEAS: 'product_ideas',
  PRODUCT_IDEA_EPIC_LINKS: 'product_idea_epic_links'
};
