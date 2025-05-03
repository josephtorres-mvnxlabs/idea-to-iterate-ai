
import { Status, StatusConfiguration, StatusEntityType, DEFAULT_STATUSES_BY_ENTITY_TYPE } from '../models/statusConfig';
import { v4 as uuidv4 } from 'uuid';

// Simulated database for statuses
let statuses: Status[] = [];
let statusConfigurations: StatusConfiguration[] = [];

/**
 * Initialize default status configurations if none exist
 */
export async function initializeDefaultStatuses(): Promise<void> {
  // If we already have statuses, don't initialize again
  if (statuses.length > 0) return;
  
  // Create default statuses
  const now = new Date().toISOString();
  
  // Create all default statuses with IDs
  Object.entries(DEFAULT_STATUSES_BY_ENTITY_TYPE).forEach(([entityType, defaultStatuses]) => {
    defaultStatuses.forEach(defaultStatus => {
      const statusId = uuidv4();
      
      // Add the status
      statuses.push({
        ...defaultStatus,
        id: statusId,
        created_at: now,
        updated_at: now
      });
      
      // Create the configuration to link the status to the entity type
      statusConfigurations.push({
        id: uuidv4(),
        entity_type: entityType as StatusEntityType,
        status_id: statusId,
        enabled: true,
        created_at: now,
        updated_at: now
      });
    });
  });
}

// Get all statuses
export async function getAllStatuses(): Promise<Status[]> {
  await initializeDefaultStatuses();
  return [...statuses];
}

// Get all status configurations
export async function getAllStatusConfigurations(): Promise<StatusConfiguration[]> {
  await initializeDefaultStatuses();
  return [...statusConfigurations];
}

// Get statuses for a specific entity type
export async function getStatusesForEntityType(entityType: StatusEntityType): Promise<Status[]> {
  await initializeDefaultStatuses();
  
  const enabledStatusIds = statusConfigurations
    .filter(config => config.entity_type === entityType && config.enabled)
    .map(config => config.status_id);
  
  return statuses
    .filter(status => enabledStatusIds.includes(status.id))
    .sort((a, b) => a.order - b.order);
}

// Create a new status
export async function createStatus(statusData: Omit<Status, 'id' | 'created_at' | 'updated_at'>): Promise<Status> {
  const now = new Date().toISOString();
  const newStatus: Status = {
    ...statusData,
    id: uuidv4(),
    created_at: now,
    updated_at: now
  };
  
  statuses.push(newStatus);
  return newStatus;
}

// Update an existing status
export async function updateStatus(id: string, statusData: Partial<Omit<Status, 'id' | 'created_at' | 'updated_at'>>): Promise<Status | null> {
  const index = statuses.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  const updatedStatus: Status = {
    ...statuses[index],
    ...statusData,
    updated_at: new Date().toISOString()
  };
  
  statuses[index] = updatedStatus;
  return updatedStatus;
}

// Delete a status (if not in use)
export async function deleteStatus(id: string): Promise<boolean> {
  const index = statuses.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  statuses = statuses.filter(s => s.id !== id);
  // Also clean up any configurations using this status
  statusConfigurations = statusConfigurations.filter(sc => sc.status_id !== id);
  
  return true;
}

// Enable or disable a status for an entity type
export async function setStatusEnabledForEntityType(
  statusId: string, 
  entityType: StatusEntityType, 
  enabled: boolean
): Promise<StatusConfiguration | null> {
  // Check if the configuration exists
  let config = statusConfigurations.find(
    sc => sc.status_id === statusId && sc.entity_type === entityType
  );
  
  const now = new Date().toISOString();
  
  if (config) {
    // Update existing configuration
    config.enabled = enabled;
    config.updated_at = now;
  } else {
    // Create new configuration
    config = {
      id: uuidv4(),
      entity_type: entityType,
      status_id: statusId,
      enabled,
      created_at: now,
      updated_at: now
    };
    statusConfigurations.push(config);
  }
  
  return config;
}
