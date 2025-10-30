import axios from "axios";

const api = axios.create({
  baseURL: "https://tutalim.com/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    console.warn("🔴 401 Interceptor tetiklendi mi?", err.response?.status);
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          "http://tutalim.com/api/refresh",
          {},
          { withCredentials: true }
        );

        if (refreshRes.data.status === "success") {
          const newToken = refreshRes.data.token;
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.warn("Refresh başarısız, yeniden giriş gerekli.");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }

    return Promise.reject(err);
  }
);

export default api;
