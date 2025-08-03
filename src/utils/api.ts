const BASE_URL = 'https://www.whatsapp.api.funtaste.xyz';

interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiRequest = async (endpoint: string, options: ApiRequestOptions = {}): Promise<any> => {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Add timeout and other fetch options for better error handling
    signal: AbortSignal.timeout(30000), // 30 second timeout
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Provide more specific error messages based on error type
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw new Error('Request timed out. The server may be experiencing issues. Please try again later.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    return `1${cleaned}`;
  }
  
  return cleaned;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};