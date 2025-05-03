
/**
 * API Configuration
 * 
 * This file contains configuration settings for API connections.
 * Update these values to match your FastAPI backend settings.
 */

// Set to false to use the real API instead of mock data
export const USE_MOCK_DATA = true;

// Base URL for the FastAPI backend
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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
