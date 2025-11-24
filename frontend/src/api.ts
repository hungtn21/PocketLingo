import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cho phép gửi cookies
});

// Interceptor: Thêm token vào Authorization header nếu có
api.interceptors.request.use(
  (config) => {
    // Thử lấy token từ cookie (key là 'jwt')
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
