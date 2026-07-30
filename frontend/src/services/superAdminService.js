// Adjust this import to match however authService.js imports its axios instance
// (e.g. `import api from "./api";` or `import { api } from "./apiClient";`)
import api from "./api";

export const createAdmin = (payload) => api.post("/super-admin/add-admin", payload);
export const getAllAdmins = () => api.get("/super-admin/admins");
export const deleteAdmin = (adminId) => api.post(`/super-admin/delete/${adminId}`);
export const getAllCampaignsForTransfer = () => api.get("/super-admin/campaigns-overview");
export const transferCampaignManagement = (payload) =>
  api.post("/super-admin/transfer-management", payload);