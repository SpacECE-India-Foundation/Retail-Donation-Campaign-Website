import { Router } from "express";

import {getBankStatementHistory, reconcileBankTransactions, uploadBankStatement,} from "../../controllers/bankStatement.controller.js";
import { adminAuth } from "../../middelwares/adminAuth.middelware.js";
import { authorize } from "../../middelwares/RBAC.middelware.js";
import { statementUpload } from "../../utils/statementUpload.utils.js";

const bankStatementRoutes = Router();

bankStatementRoutes.post("/",adminAuth, authorize("SUPER_ADMIN"), statementUpload.single("statement"), uploadBankStatement);
bankStatementRoutes.get("/history", adminAuth, authorize("SUPER_ADMIN"), getBankStatementHistory);
bankStatementRoutes.post("/reconcile", adminAuth, authorize("SUPER_ADMIN"), reconcileBankTransactions);

export default bankStatementRoutes;
