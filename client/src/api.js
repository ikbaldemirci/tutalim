import axios from "axios";

let isRefreshing = false;
let pendingRequests = [];

const api = axios.create({
  baseURL: "https://tutalim.com/api",
  withCredentials: true,
});
const bare = axios.create({
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

    if (!originalRequest) return Promise.reject(err);

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      isRefreshing = true;
      try {
        const refreshRes = await bare.post("/refresh", {});

        if (refreshRes.data?.status === "success") {
          const newToken = refreshRes.data.token;
          localStorage.setItem("token", newToken);
          window.dispatchEvent(
            new CustomEvent("token-updated", { detail: newToken })
          );
          pendingRequests.forEach((p) => p.resolve(newToken));
          pendingRequests = [];

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          pendingRequests.forEach((p) => p.reject(refreshRes));
          pendingRequests = [];
          localStorage.removeItem("token");
          window.dispatchEvent(
            new CustomEvent("token-updated", { detail: null })
          );
          window.location.href = "/";
          return Promise.reject(err);
        }
      } catch (refreshErr) {
        pendingRequests.forEach((p) => p.reject(refreshErr));
        pendingRequests = [];
        localStorage.removeItem("token");
        window.dispatchEvent(
          new CustomEvent("token-updated", { detail: null })
        );
        window.location.href = "/";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
