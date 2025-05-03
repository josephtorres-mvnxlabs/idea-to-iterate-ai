
import { ChangeLog, EntityType, ChangeOperation, FieldChange } from '../models/changeLog';
import { TABLES } from '../models/database';
import { USE_MOCK_DATA, API_BASE_URL } from '../config/apiConfig';

// Mock data for change logs
const MOCK_CHANGE_LOGS: ChangeLog[] = [];

// Generic fetch wrapper specifically for change logs
async function fetchChangeLogAPI<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  if (USE_MOCK_DATA) {
    console.log(`Using mock data for change log ${method} ${endpoint}`);
    // Return mock data based on the endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        if (method === 'POST' && endpoint === `/${TABLES.CHANGE_LOGS}`) {
          const newLog: ChangeLog = {
            id: `log-${Date.now()}`,
            ...body,
            created_at: new Date().toISOString(),
          };
          MOCK_CHANGE_LOGS.push(newLog);
          return resolve(newLog as unknown as T);
        }
        
        if (method === 'GET' && endpoint === `/${TABLES.CHANGE_LOGS}`) {
          return resolve(MOCK_CHANGE_LOGS as unknown as T);
        }
        
        if (endpoint.match(new RegExp(`/${TABLES.CHANGE_LOGS}/entity/[\\w-]+/[\\w-]+`))) {
          const [entityType, entityId] = endpoint.split('/').slice(-2);
          const filteredLogs = MOCK_CHANGE_LOGS.filter(
            log => log.entity_type === entityType && log.entity_id === entityId
          );
          return resolve(filteredLogs as unknown as T);
        }
        
        if (endpoint.match(new RegExp(`/${TABLES.CHANGE_LOGS}/user/[\\w-]+`))) {
          const userId = endpoint.split('/').pop();
          const filteredLogs = MOCK_CHANGE_LOGS.filter(
            log => log.user_id === userId
          );
          return resolve(filteredLogs as unknown as T);
        }
        
        resolve([] as unknown as T);
      }, 300);
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

// Change log related API calls
export const changeLogApi = {
  // Record a new change
  logChange: (
    entityType: EntityType, 
    entityId: string, 
    operation: ChangeOperation, 
    userId: string, 
    changes: FieldChange[]
  ) => {
    console.log(`Logging change: ${operation} on ${entityType} ${entityId} by user ${userId}`);
    console.log('Changes:', changes);
    
    return fetchChangeLogAPI<ChangeLog>(`/${TABLES.CHANGE_LOGS}`, 'POST', {
      entity_type: entityType,
      entity_id: entityId,
      operation,
      user_id: userId,
      changes
    });
  },
  
  // Get all change logs
  getAll: () => fetchChangeLogAPI<ChangeLog[]>(`/${TABLES.CHANGE_LOGS}`),
  
  // Get change logs for a specific entity
  getByEntity: (entityType: EntityType, entityId: string) => 
    fetchChangeLogAPI<ChangeLog[]>(`/${TABLES.CHANGE_LOGS}/entity/${entityType}/${entityId}`),
  
  // Get change logs created by a specific user
  getByUser: (userId: string) => 
    fetchChangeLogAPI<ChangeLog[]>(`/${TABLES.CHANGE_LOGS}/user/${userId}`),
  
  // Real API variants
  logChangeInDatabase: (
    entityType: EntityType, 
    entityId: string, 
    operation: ChangeOperation, 
    userId: string, 
    changes: FieldChange[]
  ) => {
    return fetchChangeLogAPI<ChangeLog>(`/change-logs`, 'POST', {
      entity_type: entityType,
      entity_id: entityId,
      operation,
      user_id: userId,
      changes
    });
  },
  
  getAllFromDatabase: () => fetchChangeLogAPI<ChangeLog[]>(`/change-logs`),
  
  getByEntityFromDatabase: (entityType: EntityType, entityId: string) => 
    fetchChangeLogAPI<ChangeLog[]>(`/change-logs/entity/${entityType}/${entityId}`),
  
  getByUserFromDatabase: (userId: string) => 
    fetchChangeLogAPI<ChangeLog[]>(`/change-logs/user/${userId}`)
};

export default changeLogApi;
