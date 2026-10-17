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
      const isPortalRoute = window.location.pathname.startsWith("/s/");
      const token = isPortalRoute
        ? (localStorage.getItem("serviceos_customer_token") || localStorage.getItem("serviceos_token"))
        : (localStorage.getItem("serviceos_token") || localStorage.getItem("serviceos_customer_token"));

      if (token && config.headers && !config.headers.Authorization) {
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
      const path = window.location.pathname;
      const isAuthPage = path.includes("/login") || path.includes("/register") || path.includes("/invite");

      if (path.startsWith("/s/")) {
        // Customer portal session handling
        localStorage.removeItem("serviceos_customer_token");
        localStorage.removeItem("serviceos_customer_context");
        if (!isAuthPage) {
          const match = path.match(/^\/s\/([^/]+)/);
          const slug = match ? match[1] : "";
          if (slug) {
            window.location.href = `/s/${slug}/login?session_expired=true`;
          }
        }
      } else if (!isAuthPage) {
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

    const formattedError: any = new Error(Array.isArray(message) ? message.join(", ") : message);
    formattedError.status = error.response?.status;
    formattedError.statusCode = error.response?.status;
    formattedError.response = error.response;
    return Promise.reject(formattedError);
  }
);

export default apiClient;
