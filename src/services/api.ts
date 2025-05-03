
import { Epic, Task, User, ProductIdea, TABLES, EpicWithTasks, ProductIdeaWithEpics } from '../models/database';

// Base API URL - In a real app, this would come from environment variables
const API_BASE_URL = '/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Epic related API calls
export const epicApi = {
  getAll: () => fetchAPI<Epic[]>(`/${TABLES.EPICS}`),
  
  getById: (id: string) => fetchAPI<Epic>(`/${TABLES.EPICS}/${id}`),
  
  create: (epic: Omit<Epic, 'id' | 'created_at' | 'updated_at' | 'status'>) => 
    fetchAPI<Epic>(`/${TABLES.EPICS}`, 'POST', {
      ...epic,
      status: 'planning',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
  
  update: (id: string, epic: Partial<Omit<Epic, 'id' | 'created_at' | 'created_by'>>) => 
    fetchAPI<Epic>(`/${TABLES.EPICS}/${id}`, 'PUT', {
      ...epic,
      updated_at: new Date().toISOString()
    }),
  
  delete: (id: string) => fetchAPI<void>(`/${TABLES.EPICS}/${id}`, 'DELETE'),
  
  getWithTasks: (id: string) => fetchAPI<EpicWithTasks>(`/${TABLES.EPICS}/${id}/tasks`),
  
  getAllWithTasks: () => fetchAPI<EpicWithTasks[]>(`/${TABLES.EPICS}/with-tasks`),
  
  calculateProgress: (epic: Epic, tasks: Task[]): number => {
    if (!tasks || tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }
};

// Task related API calls
export const taskApi = {
  getAll: () => fetchAPI<Task[]>(`/${TABLES.TASKS}`),
  
  getByEpic: (epicId: string) => fetchAPI<Task[]>(`/${TABLES.EPICS}/${epicId}/tasks`),
  
  getById: (id: string) => fetchAPI<Task>(`/${TABLES.TASKS}/${id}`),
  
  create: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'>) => 
    fetchAPI<Task>(`/${TABLES.TASKS}`, 'POST', {
      ...task,
      status: task.is_product_idea ? 'backlog' : 'ready',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
  
  update: (id: string, task: Partial<Omit<Task, 'id' | 'created_at' | 'created_by'>>) => 
    fetchAPI<Task>(`/${TABLES.TASKS}/${id}`, 'PUT', {
      ...task,
      updated_at: new Date().toISOString()
    }),
  
  delete: (id: string) => fetchAPI<void>(`/${TABLES.TASKS}/${id}`, 'DELETE'),
  
  updateStatus: (id: string, status: Task['status']) => 
    fetchAPI<Task>(`/${TABLES.TASKS}/${id}/status`, 'PUT', { status })
};

// User related API calls
export const userApi = {
  getAll: () => fetchAPI<User[]>(`/${TABLES.USERS}`),
  
  getById: (id: string) => fetchAPI<User>(`/${TABLES.USERS}/${id}`),
  
  getWithTasks: (id: string) => fetchAPI<User & { assigned_tasks: Task[] }>(`/${TABLES.USERS}/${id}/tasks`),
  
  update: (id: string, user: Partial<Omit<User, 'id' | 'created_at'>>) => 
    fetchAPI<User>(`/${TABLES.USERS}/${id}`, 'PUT', user)
};

// Product Idea related API calls
export const productIdeaApi = {
  getAll: () => fetchAPI<ProductIdea[]>(`/${TABLES.PRODUCT_IDEAS}`),
  
  getById: (id: string) => fetchAPI<ProductIdea>(`/${TABLES.PRODUCT_IDEAS}/${id}`),
  
  create: (idea: Omit<ProductIdea, 'id' | 'created_at' | 'updated_at' | 'status'>) => 
    fetchAPI<ProductIdea>(`/${TABLES.PRODUCT_IDEAS}`, 'POST', {
      ...idea,
      status: 'proposed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
  
  update: (id: string, idea: Partial<Omit<ProductIdea, 'id' | 'created_at' | 'created_by'>>) => 
    fetchAPI<ProductIdea>(`/${TABLES.PRODUCT_IDEAS}/${id}`, 'PUT', {
      ...idea,
      updated_at: new Date().toISOString()
    }),
  
  delete: (id: string) => fetchAPI<void>(`/${TABLES.PRODUCT_IDEAS}/${id}`, 'DELETE'),
  
  getWithEpics: (id: string) => fetchAPI<ProductIdeaWithEpics>(`/${TABLES.PRODUCT_IDEAS}/${id}/epics`),
  
  getAllWithEpics: () => fetchAPI<ProductIdeaWithEpics[]>(`/${TABLES.PRODUCT_IDEAS}/with-epics`),
  
  linkToEpic: (ideaId: string, epicId: string) => 
    fetchAPI<void>(`/${TABLES.PRODUCT_IDEAS}/${ideaId}/epics/${epicId}`, 'POST'),
    
  unlinkFromEpic: (ideaId: string, epicId: string) => 
    fetchAPI<void>(`/${TABLES.PRODUCT_IDEAS}/${ideaId}/epics/${epicId}`, 'DELETE'),
    
  calculateProgress: (idea: ProductIdea, epicsWithTasks: EpicWithTasks[]): number => {
    if (!epicsWithTasks || epicsWithTasks.length === 0) return 0;
    
    // Count all tasks and completed tasks across all linked epics
    let totalTasks = 0;
    let completedTasks = 0;
    
    epicsWithTasks.forEach(epic => {
      if (epic.tasks && epic.tasks.length > 0) {
        totalTasks += epic.tasks.length;
        completedTasks += epic.tasks.filter(task => task.status === 'done').length;
      }
    });
    
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  }
};

export default {
  epics: epicApi,
  tasks: taskApi,
  users: userApi,
  productIdeas: productIdeaApi
};
