import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3002/api",
  withCredentials: true, // needed once JWT httpOnly cookie auth is live
});

export default api;
