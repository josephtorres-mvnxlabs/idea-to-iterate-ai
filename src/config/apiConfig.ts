
/**
 * API Configuration
 * 
 * This file contains configuration settings for API connections.
 * Update these values to match your FastAPI backend settings.
 */

// Get environment variables - for Vite, we use import.meta.env instead of process.env
const getEnvVar = (key: string, defaultValue: string): string => {
  // In Vite, environment variables are exposed through import.meta.env
  const envVar = import.meta.env[key];
  return envVar !== undefined ? envVar : defaultValue;
};

// Set to false to use the real API instead of mock data
export const USE_MOCK_DATA = true;

// Base URL for the FastAPI backend
export const API_BASE_URL = getEnvVar('VITE_API_URL', 'http://localhost:8000/api');

// API request timeout in milliseconds
export const API_TIMEOUT = 30000;

// Flag to enable detailed API request logging
export const ENABLE_API_LOGGING = true;

// Function to toggle between mock and real API data
export const setUseMockData = (useMock: boolean): void => {
  // In a real app, this would update localStorage or context
  console.log(`API mode set to: ${useMock ? 'Mock Data' : 'Real API'}`);
  // This is a placeholder - in a real app you'd use a state management solution
};

// FastAPI specific endpoints
export const API_ENDPOINTS = {
  USERS: '/users',
  EPICS: '/epics',
  TASKS: '/tasks',
  PRODUCT_IDEAS: '/product-ideas',
  PRODUCT_IDEA_EPIC_LINKS: '/product-idea-epic-links'
};
