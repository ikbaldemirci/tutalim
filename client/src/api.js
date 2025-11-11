import axios from "axios";

let isRefreshing = false;
let pendingRequests = [];

const api = axios.create({
  baseURL: "https://tutalim.com/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((error) => Promise.reject(error));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          "https://tutalim.com/api/refresh",
          {},
          { withCredentials: true }
        );

        if (refreshRes.data.status === "success") {
          const newToken = refreshRes.data.token;
          localStorage.setItem("token", newToken);

          pendingRequests.forEach((p) => p.resolve(newToken));
          pendingRequests = [];

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        pendingRequests.forEach((p) => p.reject(refreshErr));
        pendingRequests = [];
        localStorage.removeItem("token");
        window.location.href = "/";
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
