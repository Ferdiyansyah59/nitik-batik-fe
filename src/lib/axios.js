import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from storage or auth store
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        const token = authData?.state?.token;
        if (token) {
          config.headers.Authorization = `${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }

    // For multipart/form-data, let browser set the content-type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📤 ${config.method?.toUpperCase()} ${config.url}`,
        config.data,
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth-storage');
          if (
            typeof window !== 'undefined' &&
            window.location.pathname !== '/login'
          ) {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', error.response.data);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  },
);

// Helper functions
export const apiClient = {
  // GET request
  get: (url, config = {}) => axiosInstance.get(url, config),

  // POST request
  post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),

  // PUT request
  put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),

  // PATCH request
  patch: (url, data = {}, config = {}) =>
    axiosInstance.patch(url, data, config),

  // DELETE request
  delete: (url, config = {}) => axiosInstance.delete(url, config),

  // Upload file
  upload: async (url, file, fieldName = 'file', additionalData = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Append additional data if provided
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    return axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      },
    });
  },

  // Upload multiple files
  uploadMultiple: async (
    url,
    files,
    fieldName = 'files',
    additionalData = {},
  ) => {
    const formData = new FormData();

    // Append multiple files
    files.forEach((file) => {
      formData.append(fieldName, file);
    });

    // Append additional data if provided
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    return axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default axiosInstance;
