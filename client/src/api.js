import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // ileride JWT token veya cookie için hazır dursun
});

// Kullanım örneği:
// await api.post("/login", { mail, password });

export default api;
