// Status configuration model to define available statuses for different entity types

/**
 * Represents a status definition with display properties
 */
export interface Status {
  id: string;
  name: string;
  description?: string;
  color?: string; // For UI representation
  order: number; // For sorting/displaying in the correct order
  is_default?: boolean; // Whether this status should be the default for new entities
  is_completed?: boolean; // Whether this status represents completion (for progress calculation)
  is_archived?: boolean; // Whether this status represents archived items
  created_at: string;
  updated_at: string;
}

/**
 * Entity types that can have status configurations
 */
export type StatusEntityType = 'product_idea' | 'epic' | 'task';

/**
 * Maps entity types to their allowed statuses
 */
export interface StatusConfiguration {
  id: string;
  entity_type: StatusEntityType;
  status_id: string;
  enabled: boolean; // Whether this status is currently available for the entity type
  created_at: string;
  updated_at: string;
}

/**
 * Table names for status-related entities
 */
export const STATUS_TABLES = {
  STATUSES: 'statuses',
  STATUS_CONFIGURATIONS: 'status_configurations'
};

/**
 * Default statuses for product ideas
 */
export const DEFAULT_PRODUCT_IDEA_STATUSES: Omit<Status, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Proposed', description: 'New idea that has been submitted', color: '#6366F1', order: 10, is_default: true },
  { name: 'Under Review', description: 'Being evaluated by the team', color: '#F59E0B', order: 20 },
  { name: 'Approved', description: 'Approved for implementation', color: '#10B981', order: 30 },
  { name: 'Rejected', description: 'Not approved for implementation', color: '#EF4444', order: 40 },
  { name: 'Implemented', description: 'Has been fully implemented', color: '#8B5CF6', order: 50, is_completed: true },
  { name: 'Archived', description: 'Archived for historical reference', color: '#71717A', order: 60, is_archived: true }
];

/**
 * Default statuses for epics
 */
export const DEFAULT_EPIC_STATUSES: Omit<Status, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Planning', description: 'Epic is being planned', color: '#6366F1', order: 10, is_default: true },
  { name: 'In Progress', description: 'Implementation has started', color: '#F59E0B', order: 20 },
  { name: 'Completed', description: 'All tasks completed', color: '#10B981', order: 30, is_completed: true },
  { name: 'Archived', description: 'Archived for historical reference', color: '#71717A', order: 40, is_archived: true }
];

/**
 * Default statuses for tasks
 */
export const DEFAULT_TASK_STATUSES: Omit<Status, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Backlog', description: 'Planned but not started', color: '#6B7280', order: 10, is_default: true },
  { name: 'Ready', description: 'Ready to be worked on', color: '#6366F1', order: 20 },
  { name: 'In Progress', description: 'Currently being worked on', color: '#F59E0B', order: 30 },
  { name: 'Review', description: 'Ready for review', color: '#8B5CF6', order: 40 },
  { name: 'Done', description: 'Task is completed', color: '#10B981', order: 50, is_completed: true },
  { name: 'Archived', description: 'Archived for historical reference', color: '#71717A', order: 60, is_archived: true }
];

/**
 * Maps entity types to their default status arrays
 */
export const DEFAULT_STATUSES_BY_ENTITY_TYPE: Record<StatusEntityType, Omit<Status, 'id' | 'created_at' | 'updated_at'>[]> = {
  product_idea: DEFAULT_PRODUCT_IDEA_STATUSES,
  epic: DEFAULT_EPIC_STATUSES,
  task: DEFAULT_TASK_STATUSES
};

/**
 * Helper to get available statuses for a given entity type
 * @param entityType The type of entity to get statuses for
 * @param statuses All available statuses in the system
 * @param statusConfigs All status configurations
 * @returns Array of statuses available for the entity type
 */
export function getStatusesForEntityType(
  entityType: StatusEntityType,
  statuses: Status[],
  statusConfigs: StatusConfiguration[]
): Status[] {
  // Find all enabled status configurations for this entity type
  const enabledStatusIds = statusConfigs
    .filter(config => config.entity_type === entityType && config.enabled)
    .map(config => config.status_id);
  
  // Return all statuses that are enabled for this entity type, sorted by order
  return statuses
    .filter(status => enabledStatusIds.includes(status.id))
    .sort((a, b) => a.order - b.order);
}

/**
 * Get the default status for a given entity type
 */
export function getDefaultStatusForEntityType(
  entityType: StatusEntityType,
  statuses: Status[],
  statusConfigs: StatusConfiguration[]
): Status | undefined {
  const availableStatuses = getStatusesForEntityType(entityType, statuses, statusConfigs);
  return availableStatuses.find(status => status.is_default) || availableStatuses[0];
}

/**
 * Check if a status represents completion for progress calculation
 */
export function isCompletionStatus(status: Status): boolean {
  return !!status.is_completed;
}

/**
 * Check if a status represents an archived item
 */
export function isArchivedStatus(status: Status): boolean {
  return !!status.is_archived;
}
