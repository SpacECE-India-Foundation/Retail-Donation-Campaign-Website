import api from "./api";

// Step 1: upload the sheet, get back a preview (nothing stored yet).
// Field key MUST be "file" — matches subscriberImportUpload.utils.js's
// multer config (subscriberImportUpload.single("file")).
export const previewSubscriberImport = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/super-admin/subscribers/import/preview", formData);
};

// Step 2: admin confirmed the preview — send only the remaining READY rows
// (after any removed) to actually store them.
export const commitSubscriberImport = (subscribers) =>
  api.post("/super-admin/subscribers/import/commit", { subscribers });

// Listing + search table below the upload section.
export const getSubscribers = ({ page = 1, limit = 20, search = "" } = {}) =>
  api.get("/super-admin/subscribers/search-subscribers", { params: { page, limit, search } });