import axios from "axios";
import { emit, NOTIFY_EVENT } from "./lib/bus";

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

const DEBUG =
  (typeof localStorage !== "undefined" &&
    localStorage.getItem("debugAuth") === "1") ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_DEBUG_AUTH === "1");

const dlog = (...args) => {
  if (DEBUG && typeof console !== "undefined") console.debug("[auth]", ...args);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.meta && typeof config.meta.silent !== "undefined") {
    config._silent = !!config.meta.silent;
  }
  dlog(
    "request",
    config.method?.toUpperCase(),
    config.url,
    config._silent ? "(silent)" : ""
  );
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (!originalRequest) return Promise.reject(err);

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        dlog(
          "queueing while refresh in progress:",
          originalRequest.method?.toUpperCase(),
          originalRequest.url
        );
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            dlog(
              "retry after queued refresh:",
              originalRequest.method?.toUpperCase(),
              originalRequest.url
            );
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      isRefreshing = true;
      dlog("refresh start; pending:", pendingRequests.length);
      try {
        const refreshRes = await bare.post("/refresh", {});

        if (refreshRes.data?.status === "success") {
          const newToken = refreshRes.data.token;
          localStorage.setItem("token", newToken);

          dlog(
            "refresh success; resolving",
            pendingRequests.length,
            "queued requests"
          );
          pendingRequests.forEach((p) => p.resolve(newToken));
          pendingRequests = [];

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          dlog(
            "retry original:",
            originalRequest.method?.toUpperCase(),
            originalRequest.url
          );
          return api(originalRequest);
        } else {
          dlog("refresh failed (response)");
          pendingRequests.forEach((p) => p.reject(refreshRes));
          pendingRequests = [];
          localStorage.removeItem("token");
          window.location.href = "/";
          return Promise.reject(err);
        }
      } catch (refreshErr) {
        dlog("refresh error:", refreshErr?.message || refreshErr);
        pendingRequests.forEach((p) => p.reject(refreshErr));
        pendingRequests = [];
        localStorage.removeItem("token");
        try {
          emit(NOTIFY_EVENT, {
            severity: "warning",
            message: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
            duration: 3500,
          });
        } catch {}
        window.location.href = "/";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
        dlog("refresh end");
      }
    }

    // Global error toast (opt-in): only when explicitly requested and not silent
    try {
      const status = err.response?.status;
      const cfg = err.config || {};
      const wantsToast = cfg.meta && cfg.meta.toast === true;
      const isSilent = !!cfg._silent;
      if (wantsToast && !isSilent && status !== 401) {
        let message = err.response?.data?.message;
        if (!message) {
          if (status === 403) message = "Bu işlem için yetkiniz yok.";
          else if (status === 404) message = "Kayıt bulunamadı.";
          else if (status === 413) message = "Dosya boyutu sınırı aşıldı.";
          else if (status >= 500) message = "Sunucu hatası. Lütfen tekrar deneyin.";
          else message = "Beklenmeyen bir hata oluştu.";
        }
        emit(NOTIFY_EVENT, { severity: "error", message });
      }
    } catch {}

    return Promise.reject(err);
  }
);

export default api;
