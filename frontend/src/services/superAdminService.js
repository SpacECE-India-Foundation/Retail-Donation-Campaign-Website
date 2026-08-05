// Adjust this import to match however authService.js imports its axios instance
// (e.g. `import api from "./api";` or `import { api } from "./apiClient";`)
import api from "./api";

// Creates a new admin. Backend generates a random password and emails it to them.
export const createAdmin = (payload) => api.post("/super-admin/add-admin", payload);

// Lists every admin account (Super Admin only).
export const getAllAdmins = () => api.get("/super-admin/admins");

// Deletes an admin account. Backend transfers all their campaigns to the
// Super Admin's ownership as part of the same transaction.
export const deleteAdmin = (adminId) => api.post(`/super-admin/delete/${adminId}`);

// Lists every campaign with its current owner populated — used to build the
// campaign-transfer picker.
export const getAllCampaignsForTransfer = () => api.get("/super-admin/campaigns-overview");

// Transfers ownership of one or more campaigns to a new admin.
// payload: { campaignIds: string[], adminId: string }
export const transferCampaignManagement = (payload) =>
  api.post("/super-admin/transfer-management", payload);

// Count of donors who opted in ("notify me") for future campaign / milestone update emails.
// Platform-wide — not scoped to any one admin's campaigns.
export const getSubscriberCount = () => api.get("/super-admin/subscribers-count");