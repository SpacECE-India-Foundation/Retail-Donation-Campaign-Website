import api from "./api";

export const login = (credentials) => api.post("/admin/auth/login-admin", credentials);
export const forgotPassword = (email) => api.post("/admin/auth/forgot-password", { email });
export const verifyOtp = (data) => api.post("/admin/auth/verify-otp", data);
export const resetPassword = (data) => api.post("/admin/auth/reset-password", data);
export const getCurrentAdmin = () => api.get("/admin/admin-me");
export const logout = () => api.post("/admin/auth/logout"); // placeholder - no logout endpoint on backend yet
