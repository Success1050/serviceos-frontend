import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("serviceos_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 & Error Handler
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // Don't auto-redirect if already on auth or public portal login pages
      const path = window.location.pathname;
      const isAuthPage = path.includes("/login") || path.includes("/register") || path.includes("/invite");

      if (!isAuthPage) {
        localStorage.removeItem("serviceos_token");
        localStorage.removeItem("serviceos_user");
        window.location.href = "/login?session_expired=true";
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    const formattedError = new Error(Array.isArray(message) ? message.join(", ") : message);
    return Promise.reject(formattedError);
  }
);

export default apiClient;
