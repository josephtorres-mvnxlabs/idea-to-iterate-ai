
/**
 * FastAPI endpoint definitions
 * This file defines the expected endpoints and their request/response formats
 * for integration with the FastAPI backend.
 */

// Base URL for API endpoints
export const API_ROUTES = {
  USERS: '/api/users',
  EPICS: '/api/epics',
  TASKS: '/api/tasks',
  PRODUCT_IDEAS: '/api/product-ideas',
  CHANGE_LOGS: '/api/change-logs',
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_ALL: API_ROUTES.USERS,
  GET_BY_ID: (id: string) => `${API_ROUTES.USERS}/${id}`,
  CREATE: API_ROUTES.USERS,
  UPDATE: (id: string) => `${API_ROUTES.USERS}/${id}`,
  UPDATE_TYPE: (id: string) => `${API_ROUTES.USERS}/${id}/type`,
  GET_WITH_TASKS: (id: string) => `${API_ROUTES.USERS}/${id}/tasks`,
  GET_WORKLOAD: `${API_ROUTES.USERS}/workload`,
};

// Epic endpoints
export const EPIC_ENDPOINTS = {
  GET_ALL: API_ROUTES.EPICS,
  GET_BY_ID: (id: string) => `${API_ROUTES.EPICS}/${id}`,
  CREATE: API_ROUTES.EPICS,
  UPDATE: (id: string) => `${API_ROUTES.EPICS}/${id}`,
  DELETE: (id: string) => `${API_ROUTES.EPICS}/${id}`,
  UPDATE_STATUS: (id: string) => `${API_ROUTES.EPICS}/${id}/status`,
  GET_TASKS: (id: string) => `${API_ROUTES.EPICS}/${id}/tasks`,
  GET_WITH_TASKS: `${API_ROUTES.EPICS}/with-tasks`,
  GET_PRODUCT_IDEAS: (id: string) => `${API_ROUTES.EPICS}/${id}/product-ideas`,
  ADD_TEAM_MEMBER: (id: string, userId: string) => `${API_ROUTES.EPICS}/${id}/team-members/${userId}`,
  REMOVE_TEAM_MEMBER: (id: string, userId: string) => `${API_ROUTES.EPICS}/${id}/team-members/${userId}`,
};

// Task endpoints
export const TASK_ENDPOINTS = {
  GET_ALL: API_ROUTES.TASKS,
  GET_BY_ID: (id: string) => `${API_ROUTES.TASKS}/${id}`,
  CREATE: API_ROUTES.TASKS,
  UPDATE: (id: string) => `${API_ROUTES.TASKS}/${id}`,
  DELETE: (id: string) => `${API_ROUTES.TASKS}/${id}`,
  UPDATE_STATUS: (id: string) => `${API_ROUTES.TASKS}/${id}/status`,
  GET_BY_EPIC: (epicId: string) => `${API_ROUTES.TASKS}/epic/${epicId}`,
  GET_BY_ASSIGNEE: (userId: string) => `${API_ROUTES.TASKS}/assignee/${userId}`,
  ADD_TEAM_MEMBER: (id: string, userId: string) => `${API_ROUTES.TASKS}/${id}/team-members/${userId}`,
  REMOVE_TEAM_MEMBER: (id: string, userId: string) => `${API_ROUTES.TASKS}/${id}/team-members/${userId}`,
};

// Product Idea endpoints
export const PRODUCT_IDEA_ENDPOINTS = {
  GET_ALL: API_ROUTES.PRODUCT_IDEAS,
  GET_BY_ID: (id: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}`,
  CREATE: API_ROUTES.PRODUCT_IDEAS,
  UPDATE: (id: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}`,
  DELETE: (id: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}`,
  UPDATE_STATUS: (id: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}/status`,
  GET_LINKED_EPICS: (id: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}/epics`,
  LINK_TO_EPIC: (id: string, epicId: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}/epics/${epicId}`,
  UNLINK_FROM_EPIC: (id: string, epicId: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}/epics/${epicId}`,
  GET_WITH_EPICS: `${API_ROUTES.PRODUCT_IDEAS}/with-epics`,
  ADD_TEAM_MEMBER: (id: string, userId: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}/team-members/${userId}`,
  REMOVE_TEAM_MEMBER: (id: string, userId: string) => `${API_ROUTES.PRODUCT_IDEAS}/${id}/team-members/${userId}`,
};

// Change Log endpoints
export const CHANGE_LOG_ENDPOINTS = {
  GET_ALL: API_ROUTES.CHANGE_LOGS,
  GET_BY_ENTITY: (entityType: string, entityId: string) => 
    `${API_ROUTES.CHANGE_LOGS}/${entityType}/${entityId}`,
  CREATE: API_ROUTES.CHANGE_LOGS,
};

export default {
  USER: USER_ENDPOINTS,
  EPIC: EPIC_ENDPOINTS,
  TASK: TASK_ENDPOINTS,
  PRODUCT_IDEA: PRODUCT_IDEA_ENDPOINTS,
  CHANGE_LOG: CHANGE_LOG_ENDPOINTS,
};
