
import { FieldChange } from '../models/changeLog';

/**
 * Compares two objects and returns an array of field changes
 * @param oldObj The original object
 * @param newObj The updated object
 * @param ignoredFields Fields to ignore when comparing (e.g., timestamps)
 * @returns Array of field changes
 */
export function compareObjects<T extends object>(
  oldObj: T, 
  newObj: T, 
  ignoredFields: string[] = ['id', 'created_at', 'updated_at']
): FieldChange[] {
  const changes: FieldChange[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  
  allKeys.forEach(key => {
    // Skip ignored fields
    if (ignoredFields.includes(key)) return;
    
    // @ts-ignore - Using string keys
    const oldValue = oldObj[key];
    // @ts-ignore
    const newValue = newObj[key];
    
    // Check if arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      // Only add if arrays are different
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue
        });
      }
    } 
    // Check objects
    else if (
      oldValue && 
      newValue && 
      typeof oldValue === 'object' && 
      typeof newValue === 'object'
    ) {
      // Compare objects recursively
      const nestedChanges = compareObjects(oldValue, newValue, ignoredFields);
      if (nestedChanges.length > 0) {
        changes.push({
          field: key,
          oldValue,
          newValue
        });
      }
    } 
    // Simple value comparison
    else if (oldValue !== newValue) {
      changes.push({
        field: key,
        oldValue,
        newValue
      });
    }
  });
  
  return changes;
}

/**
 * Creates a change entry for a newly created entity
 * @param newObj The new object that was created
 * @param ignoredFields Fields to ignore
 * @returns Array of field changes
 */
export function getCreationChanges<T extends object>(
  newObj: T, 
  ignoredFields: string[] = ['id', 'created_at', 'updated_at']
): FieldChange[] {
  const changes: FieldChange[] = [];
  
  Object.entries(newObj).forEach(([key, value]) => {
    if (!ignoredFields.includes(key) && value !== undefined) {
      changes.push({
        field: key,
        newValue: value
      });
    }
  });
  
  return changes;
}

/**
 * Helper to create a status change record
 * @param field The status field name
 * @param oldStatus Previous status
 * @param newStatus Updated status
 * @returns A FieldChange object
 */
export function createStatusChange(
  field: string,
  oldStatus: string,
  newStatus: string
): FieldChange {
  return {
    field,
    oldValue: oldStatus,
    newValue: newStatus
  };
}
