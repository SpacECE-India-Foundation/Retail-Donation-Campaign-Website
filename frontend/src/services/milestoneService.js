import api from "./api";

export const getMilestones = () => api.get("/milestones");
