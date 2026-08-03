import { Router } from "express";

import { uploadBankStatement, fetchBankStatementHistory } from "../../controllers/bankStatement.controller.js";
import { adminAuth } from "../../middelwares/adminAuth.middelware.js";
import { authorize } from "../../middelwares/RBAC.middelware.js";
import { statementUpload } from "../../utils/statementUpload.utils.js";

const bankStatementRoutes = Router();

bankStatementRoutes.post("/",adminAuth, authorize("SUPER_ADMIN"), statementUpload.single("statement"), uploadBankStatement);
bankStatementRoutes.get("/history", adminAuth, authorize("SUPER_ADMIN"), fetchBankStatementHistory);

export default bankStatementRoutes;