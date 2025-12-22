import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cho phép gửi cookies
});

// Interceptor: Thêm token vào Authorization header nếu có
api.interceptors.request.use(
  (config) => {
    // Parse JWT token from cookie safely (handles JWT with = characters)
    const cookies = document.cookie.split("; ");
    let token = null;
    for (const cookie of cookies) {
      if (cookie.startsWith("jwt=")) {
        token = cookie.substring(4); // Remove "jwt=" prefix
        break;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Daily Review API
export const getDailyReviewSummary = async () => {
  const response = await api.get('/review/summary/');
  return response.data;
};

export const getDailyReviewSession = async () => {
  const response = await api.get('/review/session/');
  return response.data;
};

export const submitDailyReview = async (results: any[]) => {
  const response = await api.post('/review/submit/', { results });
  return response.data;
};

export default api;
