import axios from "axios";
import { logout, updateActivity } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token + update activity on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // refresh session on API call
    updateActivity();

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Auto logout if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;