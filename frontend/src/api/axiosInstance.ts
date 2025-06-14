import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();
// Create an axios instance with a base URL from environment variables


const api = axios.create({
  baseURL: process.env.VITE_API_URL  // fallback if env var missing
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
