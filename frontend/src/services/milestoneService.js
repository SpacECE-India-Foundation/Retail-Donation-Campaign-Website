import api from "./api";
import { normalizeMilestone } from "./campaignService";

/* ------------------------------------------------------------------ */
/* Public — used by the donor-facing campaign pages                    */
/* ------------------------------------------------------------------ */

export const getCampaignMilestones = async (campaignId) => {
  if (!campaignId) return [];

  const { data } = await api.get(`/campaigns/${campaignId}`);
  const milestones = data?.data?.milestones ?? data?.milestones ?? [];

  return Array.isArray(milestones) ? milestones.map(normalizeMilestone) : [];
};

/* ------------------------------------------------------------------ */
/* Admin — milestone CRUD for the admin Campaign Detail page           */
/* Routes mounted at /api/admin/milestone in server.js                 */
/* (see Donation_Drive_Backennd/routes/AdminOperationRoutes/milestone.adminOperrations.routes.js) */
/* ------------------------------------------------------------------ */

export const fetchAdminMilestones = (campaignId) =>
  api.get(`/admin/milestone/${campaignId}/milestones`);

// fields: { milestoneTitle, description, targetAmount, displayOrder, mileStoneImage (File, optional) }
// note: no explicit Content-Type header — axios auto-sets the multipart boundary
// when the body is a FormData instance; setting it manually breaks multer parsing.
export const addMilestone = (campaignId, fields) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  return api.post(`/admin/milestone/${campaignId}/milestone`, formData);
};

// payload: any subset of { milestoneTitle, description, targetAmount, displayOrder }
// (no image re-upload supported by the backend controller for update — add-only)
export const updateMilestone = (campaignId, milestoneId, payload) =>
  api.patch(`/admin/milestone/${campaignId}/milestone/${milestoneId}`, payload);

export const deleteMilestone = (campaignId, milestoneId) =>
  api.delete(`/admin/milestone/${campaignId}/milestone/${milestoneId}`);