import api from "./api";

// file: a File object (the bank statement, .csv/.xlsx — whatever statementUpload.utils.js accepts)
// note: no explicit Content-Type header — axios/the browser auto-sets "multipart/form-data"
// WITH the correct boundary when the body is a FormData instance; setting it manually strips
// the boundary and the server can't parse the file out.
export const uploadBankStatement = (file) => {
  const formData = new FormData();
  formData.append("statement", file);
  return api.post("/super-admin/bank-statement", formData);
};

// Lists every statement ever uploaded (grouped by file), with match status per file.
export const getBankStatementHistory = () => api.get("/super-admin/bank-statement/history");