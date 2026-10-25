import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here if needed, e.g., redirect on 401
    if (error.response && error.response.status === 401) {
      // Typically handled by auth state or router, but can emit event or clear local state
    }
    return Promise.reject(error);
  }
);