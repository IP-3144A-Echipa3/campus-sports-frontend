import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Maps to the Express server port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor placeholder for JWT injection in future commits
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;