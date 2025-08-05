// API Configuration for external and local API calls

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

// Get API base URL from environment variables or use default
const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Check for runtime environment variable (for production builds)
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }

  // Detect if we're in a cloud environment without backend
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('fly.dev') || hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      // For demo/preview environments, use mock mode
      return '__MOCK_MODE__';
    }
  }

  // Default to local API for development
  return '/api';
};

// API Configuration
export const apiConfig: ApiConfig = {
  baseUrl: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Enhanced fetch wrapper with better error handling and configuration
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${apiConfig.baseUrl}${endpoint}`;
  
  // Merge default headers with provided headers
  const headers = {
    ...apiConfig.headers,
    ...options.headers,
  };

  // Add timestamp to GET requests to prevent caching
  const finalUrl = options.method === 'GET' || !options.method 
    ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
    : url;

  const config: RequestInit = {
    ...options,
    headers,
    // Add timeout support
    signal: AbortSignal.timeout(apiConfig.timeout),
  };

  try {
    const response = await fetch(finalUrl, config);
    
    // Handle common HTTP errors
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new ApiError(
        `API call failed: ${response.status} ${response.statusText}`,
        response.status,
        errorMessage
      );
    }
    
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new ApiError('Request timeout', 408, 'The request took too long to complete');
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Custom API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to extract error message from response
const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data.message || data.error || 'Unknown error';
    } else {
      return await response.text();
    }
  } catch {
    return 'Unable to parse error response';
  }
};

// Helper functions for common API operations
export const apiGet = async (endpoint: string): Promise<any> => {
  const response = await apiCall(endpoint);
  return response.json();
};

export const apiPost = async (endpoint: string, data: any): Promise<any> => {
  const response = await apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

export const apiPut = async (endpoint: string, data: any): Promise<any> => {
  const response = await apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};

export const apiDelete = async (endpoint: string): Promise<void> => {
  await apiCall(endpoint, {
    method: 'DELETE',
  });
};

// Configuration helpers
export const setApiBaseUrl = (url: string): void => {
  apiConfig.baseUrl = url;
};

export const setApiTimeout = (timeout: number): void => {
  apiConfig.timeout = timeout;
};

export const addApiHeader = (key: string, value: string): void => {
  apiConfig.headers[key] = value;
};

export const removeApiHeader = (key: string): void => {
  delete apiConfig.headers[key];
};

// Environment-specific configurations
export const configureForEnvironment = (env: 'development' | 'staging' | 'production') => {
  switch (env) {
    case 'development':
      setApiBaseUrl('/api');
      setApiTimeout(30000);
      break;
    case 'staging':
      setApiBaseUrl('https://staging-api.bijafarms.com/api');
      setApiTimeout(20000);
      addApiHeader('X-Environment', 'staging');
      break;
    case 'production':
      setApiBaseUrl('https://api.bijafarms.com/api');
      setApiTimeout(15000);
      addApiHeader('X-Environment', 'production');
      break;
  }
};

// Debug information
export const getApiConfig = () => ({
  ...apiConfig,
  currentUrl: apiConfig.baseUrl,
  environment: import.meta.env.NODE_ENV || 'development',
});
