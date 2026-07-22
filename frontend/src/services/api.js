import axios from "axios";

// Fallback matches the value documented in frontend/.env.example.
// The backend itself reads its port from process.env.PORT (see
// Donation_Drive_Backennd/server.js) with no hardcoded default, so set
// VITE_API_URL in your local .env to match whatever PORT your backend
// .env actually uses if it differs from 5000.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // needed once JWT httpOnly cookie auth is live
});

export default api;
