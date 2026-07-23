import api from "./api";

export const login = (credentials) => api.post("/admin/auth/login-admin", credentials);
export const forgotPassword = (email) => api.post("/admin/auth/forgot-password", { email });
export const verifyOtp = (data) => api.post("/admin/auth/verify-otp", data);
export const resetPassword = (data) => api.post("/admin/auth/reset-password", data);
export const getCurrentAdmin = () => api.get("/admin/admin-me");
export const logout = () => api.post("/admin/auth/logout");

// payload: { fullName?, phone?, profileImage? (File) } — any subset
export const updateAdminProfile = (payload) => {
  const hasFile = payload.profileImage instanceof File;

  if (!hasFile) {
    // plain JSON is fine when there's no file to upload
    return api.patch("/admin/auth/update-profile", payload);
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  // no explicit Content-Type header — let axios/the browser set the multipart
  // boundary automatically, same fix as the campaign banner upload earlier
  return api.patch("/admin/auth/update-profile", formData);
};

export const changePassword = (currentPassword, newPassword) =>
  api.patch("/admin/auth/change-password", { currentPassword, newPassword });