
import { User } from './database';

// Entity types that can be tracked
export type EntityType = 'user' | 'epic' | 'task' | 'product_idea';

// Type of change operation
export type ChangeOperation = 'create' | 'update' | 'delete' | 'status_change' | 'link' | 'unlink';

// Interface for field changes
export interface FieldChange {
  field: string;
  oldValue?: any;
  newValue: any;
}

// Main ChangeLog interface
export interface ChangeLog {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  operation: ChangeOperation;
  user_id: string; // Who made the change
  changes: FieldChange[];
  created_at: string;
}

// Utility for generating a ChangeLog record
export function createChangeLogEntry(
  entityType: EntityType,
  entityId: string,
  operation: ChangeOperation,
  userId: string,
  changes: FieldChange[]
): Omit<ChangeLog, 'id' | 'created_at'> {
  return {
    entity_type: entityType,
    entity_id: entityId,
    operation,
    user_id: userId,
    changes,
  };
}

// Helper to extract changes between two objects
export function extractChanges<T extends object>(oldObject: T, newObject: T): FieldChange[] {
  const changes: FieldChange[] = [];
  const allKeys = new Set([...Object.keys(oldObject), ...Object.keys(newObject)]);
  
  allKeys.forEach(key => {
    // Skip properties we don't want to track
    if (['id', 'created_at', 'updated_at'].includes(key)) return;
    
    // @ts-ignore - We're using string keys
    const oldValue = oldObject[key];
    // @ts-ignore
    const newValue = newObject[key];
    
    // Only record if values are different
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue
      });
    }
  });
  
  return changes;
}
