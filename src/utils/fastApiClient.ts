
import { API_BASE_URL, API_TIMEOUT, ENABLE_API_LOGGING } from '../config/apiConfig';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * FastAPI client utility for making API requests
 * 
 * @param endpoint - The API endpoint to call (without base URL)
 * @param options - Request options including method, headers, and body
 * @returns A promise resolving to the API response
 */
export async function fetchFromApi<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_TIMEOUT
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add default headers
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers
  };

  // Log request details if logging is enabled
  if (ENABLE_API_LOGGING) {
    console.log(`API Request: ${method} ${url}`);
    if (body) console.log('Request Body:', body);
  }

  try {
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Make the fetch request
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Parse response
    let data = null;
    if (response.status !== 204) { // No content
      data = await response.json().catch(() => null);
    }
    
    // Log response if logging is enabled
    if (ENABLE_API_LOGGING) {
      console.log(`API Response (${response.status}):`, data);
    }

    if (!response.ok) {
      throw new Error(
        `API Error (${response.status}): ${
          typeof data === 'object' && data?.detail
            ? data.detail
            : response.statusText
        }`
      );
    }

    return { data: data as T, error: null, status: response.status };
  } catch (error) {
    // Handle errors, including timeouts
    const isAbortError = error instanceof DOMException && error.name === 'AbortError';
    const errorMessage = isAbortError 
      ? `API request timed out after ${timeout}ms` 
      : (error instanceof Error ? error.message : String(error));
    
    if (ENABLE_API_LOGGING) {
      console.error('API Error:', errorMessage);
    }
    
    return { 
      data: null, 
      error: new Error(errorMessage), 
      status: isAbortError ? 408 : 500 
    };
  }
}

/**
 * GET request helper
 */
export const get = <T>(endpoint: string, headers?: Record<string, string>) => 
  fetchFromApi<T>(endpoint, { method: 'GET', headers });

/**
 * POST request helper
 */
export const post = <T>(endpoint: string, body: any, headers?: Record<string, string>) => 
  fetchFromApi<T>(endpoint, { method: 'POST', body, headers });

/**
 * PUT request helper
 */
export const put = <T>(endpoint: string, body: any, headers?: Record<string, string>) => 
  fetchFromApi<T>(endpoint, { method: 'PUT', body, headers });

/**
 * DELETE request helper
 */
export const del = <T>(endpoint: string, headers?: Record<string, string>) => 
  fetchFromApi<T>(endpoint, { method: 'DELETE', headers });

export default { get, post, put, delete: del };
