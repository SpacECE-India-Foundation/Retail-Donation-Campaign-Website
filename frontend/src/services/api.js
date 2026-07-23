import axios from "axios";

// Fallback matches the confirmed local backend PORT (see frontend/.env
// and Donation_Drive_Backennd/.env). Set VITE_API_URL in your local .env
// if your backend ever runs on a different port.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3002/api",
  withCredentials: true, // needed once JWT httpOnly cookie auth is live
});

export default api;
