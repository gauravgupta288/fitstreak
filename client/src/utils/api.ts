import { Capacitor } from '@capacitor/core';

const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (Capacitor.isNativePlatform()) {
    if (Capacitor.getPlatform() === 'android') {
      return 'http://10.0.2.2:5000';
    }
  }
  return 'http://localhost:5000';
};

export const getApiBaseUrl = (): string => {
  const cachedUrl = localStorage.getItem('fitstreak_api_url');
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl && envUrl.includes('onrender.com')) {
    if (cachedUrl && (cachedUrl.includes('localhost') || cachedUrl.includes('10.0.2.2'))) {
      localStorage.removeItem('fitstreak_api_url');
      return envUrl;
    }
  }
  
  return cachedUrl || getDefaultApiUrl();
};

export const setApiBaseUrl = (url: string) => {
  if (!url) {
    localStorage.removeItem('fitstreak_api_url');
  } else {
    const cleanedUrl = url.trim().endsWith('/') ? url.trim().slice(0, -1) : url.trim();
    localStorage.setItem('fitstreak_api_url', cleanedUrl);
  }
};


/**
 * Get current date in YYYY-MM-DD local format
 */
export const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Standardized API client using fetch
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem('fitstreak_token');
  const clientDate = getLocalDateString();

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Custom header to tell the server what day it is for the user's timezone
  headers.set('x-client-date', clientDate);

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  // Handle successful empty responses (like deletions)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
