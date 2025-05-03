import { Epic, Task, User, ProductIdea, TABLES, EpicWithTasks, ProductIdeaWithEpics } from '../models/database';
import { MOCK_TASKS, MOCK_EPICS, MOCK_USERS } from './mockData';
import { USE_MOCK_DATA, API_BASE_URL } from '../config/apiConfig';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  if (USE_MOCK_DATA) {
    console.log(`Using mock data for ${method} ${endpoint}`);
    // Return mock data based on the endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockDataForEndpoint(endpoint, method, body) as T);
      }, 300); // Simulate network delay
    });
  }
  
  try {
    console.log(`Fetching API: ${method} ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Helper function to get mock data based on endpoint
function getMockDataForEndpoint(endpoint: string, method: string, body?: any) {
  console.log(`Getting mock data for: ${method} ${endpoint}`);
  
  // GET requests
  if (method === 'GET') {
    // All tasks
    if (endpoint === `/${TABLES.TASKS}`) {
      console.log('Returning mock tasks:', MOCK_TASKS.length);
      return MOCK_TASKS;
    }
    
    // All epics
    if (endpoint === `/${TABLES.EPICS}`) {
      return MOCK_EPICS;
    }
    
    // All users
    if (endpoint === `/${TABLES.USERS}`) {
      return MOCK_USERS;
    }
    
    // Tasks for a specific epic
    if (endpoint.match(new RegExp(`/${TABLES.EPICS}/[\\w-]+/tasks`))) {
      const epicId = endpoint.split('/')[2];
      return MOCK_TASKS.filter(task => task.epic_id === epicId);
    }
    
    // Epics for a specific product idea
    if (endpoint.match(new RegExp(`/${TABLES.PRODUCT_IDEAS}/[\\w-]+/epics`))) {
      const ideaId = endpoint.split('/')[2];
      // In a real app, this would query the junction table
      // For mock data, we'll return epics that would be linked to this idea
      const linkedEpicIds = ['epic-1', 'epic-2']; // Mock linked epic IDs
      return MOCK_EPICS.filter(epic => linkedEpicIds.includes(epic.id));
    }
  }
  
  // POST requests - create new items
  if (method === 'POST') {
    if (endpoint === `/${TABLES.TASKS}`) {
      // Generate a new task with the provided data
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_TASKS.push(newTask);
      return newTask;
    }
    
    if (endpoint === `/${TABLES.EPICS}`) {
      // Generate a new epic with the provided data
      const newEpic: Epic = {
        id: `epic-${Date.now()}`,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_EPICS.push(newEpic);
      return newEpic;
    }
    
    // Handle linking a product idea to an epic
    if (endpoint.match(new RegExp(`/${TABLES.PRODUCT_IDEAS}/[\\w-]+/epics/[\\w-]+`))) {
      const [ideaId, epicId] = [endpoint.split('/')[2], endpoint.split('/')[4]];
      console.log(`Linking product idea ${ideaId} to epic ${epicId}`);
      // In a real app, this would create a record in the junction table
      return { success: true };
    }
  }
  
  // DELETE requests - remove items or links
  if (method === 'DELETE') {
    // Handle unlinking a product idea from an epic
    if (endpoint.match(new RegExp(`/${TABLES.PRODUCT_IDEAS}/[\\w-]+/epics/[\\w-]+`))) {
      const [ideaId, epicId] = [endpoint.split('/')[2], endpoint.split('/')[4]];
      console.log(`Unlinking product idea ${ideaId} from epic ${epicId}`);
      // In a real app, this would remove a record from the junction table
      return { success: true };
    }
  }
  
  // Default - empty response
  return {};
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
  
  getLinkedProductIdeas: (epicId: string) => 
    fetchAPI<ProductIdea[]>(`/${TABLES.EPICS}/${epicId}/product-ideas`),
  
  calculateProgress: (epic: Epic, tasks: Task[]): number => {
    if (!tasks || tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  },
  
  // Database methods for real API connections
  getFromDatabase: () => fetchAPI<Epic[]>(`/epics`),
  
  getByIdFromDatabase: (id: string) => fetchAPI<Epic>(`/epics/${id}`),
  
  createInDatabase: (epic: Omit<Epic, 'id' | 'created_at' | 'updated_at' | 'status'>) => 
    fetchAPI<Epic>(`/epics`, 'POST', {
      ...epic,
      status: 'planning'
    }),
  
  updateInDatabase: (id: string, epic: Partial<Omit<Epic, 'id' | 'created_at' | 'created_by'>>) => 
    fetchAPI<Epic>(`/epics/${id}`, 'PUT', epic),
  
  deleteFromDatabase: (id: string) => fetchAPI<void>(`/epics/${id}`, 'DELETE'),
};

// Task related API calls
export const taskApi = {
  getAll: () => {
    console.log('Calling taskApi.getAll()');
    return fetchAPI<Task[]>(`/${TABLES.TASKS}`);
  },
  
  getByEpic: (epicId: string) => {
    console.log('Calling taskApi.getByEpic():', epicId);
    return fetchAPI<Task[]>(`/${TABLES.EPICS}/${epicId}/tasks`);
  },
  
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
    fetchAPI<Task>(`/${TABLES.TASKS}/${id}/status`, 'PUT', { status }),
  
  // Database methods for real API connections
  getFromDatabase: () => fetchAPI<Task[]>(`/tasks`),
  
  getByEpicFromDatabase: (epicId: string) => fetchAPI<Task[]>(`/tasks/epic/${epicId}`),
  
  getByIdFromDatabase: (id: string) => fetchAPI<Task>(`/tasks/${id}`),
  
  createInDatabase: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'>) => 
    fetchAPI<Task>(`/tasks`, 'POST', {
      ...task,
      status: task.is_product_idea ? 'backlog' : 'ready'
    }),
  
  updateInDatabase: (id: string, task: Partial<Omit<Task, 'id' | 'created_at' | 'created_by'>>) => 
    fetchAPI<Task>(`/tasks/${id}`, 'PUT', task),
  
  deleteFromDatabase: (id: string) => fetchAPI<void>(`/tasks/${id}`, 'DELETE'),
  
  updateStatusInDatabase: (id: string, status: Task['status']) => 
    fetchAPI<Task>(`/tasks/${id}/status`, 'PUT', { status })
};

// User related API calls
export const userApi = {
  getAll: () => fetchAPI<User[]>(`/${TABLES.USERS}`),
  
  getById: (id: string) => fetchAPI<User>(`/${TABLES.USERS}/${id}`),
  
  getWithTasks: (id: string) => fetchAPI<User & { assigned_tasks: Task[] }>(`/${TABLES.USERS}/${id}/tasks`),
  
  update: (id: string, user: Partial<Omit<User, 'id' | 'created_at'>>) => 
    fetchAPI<User>(`/${TABLES.USERS}/${id}`, 'PUT', user),
  
  // Database methods for real API connections
  getFromDatabase: () => fetchAPI<User[]>(`/users`),
  
  getByIdFromDatabase: (id: string) => fetchAPI<User>(`/users/${id}`),
  
  updateInDatabase: (id: string, user: Partial<Omit<User, 'id' | 'created_at'>>) => 
    fetchAPI<User>(`/users/${id}`, 'PUT', user)
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
  
  getLinkedEpics: (id: string) => fetchAPI<Epic[]>(`/${TABLES.PRODUCT_IDEAS}/${id}/epics`),
  
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
  },
  
  // Database methods for real API connections
  getFromDatabase: () => fetchAPI<ProductIdea[]>(`/product-ideas`),
  
  getByIdFromDatabase: (id: string) => fetchAPI<ProductIdea>(`/product-ideas/${id}`),
  
  createInDatabase: (idea: Omit<ProductIdea, 'id' | 'created_at' | 'updated_at' | 'status'>) => 
    fetchAPI<ProductIdea>(`/product-ideas`, 'POST', {
      ...idea,
      status: 'proposed'
    }),
  
  updateInDatabase: (id: string, idea: Partial<Omit<ProductIdea, 'id' | 'created_at' | 'created_by'>>) => 
    fetchAPI<ProductIdea>(`/product-ideas/${id}`, 'PUT', idea),
  
  deleteFromDatabase: (id: string) => fetchAPI<void>(`/product-ideas/${id}`, 'DELETE'),
  
  getLinkedEpicsFromDatabase: (id: string) => fetchAPI<Epic[]>(`/product-ideas/${id}/epics`),
  
  linkToEpicInDatabase: (ideaId: string, epicId: string) => 
    fetchAPI<void>(`/product-ideas/${ideaId}/epics/${epicId}`, 'POST'),
    
  unlinkFromEpicInDatabase: (ideaId: string, epicId: string) => 
    fetchAPI<void>(`/product-ideas/${ideaId}/epics/${epicId}`, 'DELETE'),
};

export default {
  epics: epicApi,
  tasks: taskApi,
  users: userApi,
  productIdeas: productIdeaApi
};
