import ExcelJS from "exceljs";
import { ApiError } from "../utils/apiError.utils.js";
import { amountToPaise, normalizeTransactionId, paiseToAmount } from "../utils/bankTransaction.utils.js";

class BankStatementParserService {
    constructor() {
        this.supportedExtensions = [".xlsx"];

        this.headerMapping = {
            transactionId: [
                "utr",
                "utr number",
                "transaction id",
                "transactionid",
                "reference no",
                "reference number",
                "ref no",
                "rrn",
            ],

            transactionDate: [
                "transaction date",
                "date",
                "value date",
                "posting date",
            ],

            amount: [
                "amount",
                "credit",
                "deposit amount",
                "credit amount",
            ],

            senderName: [
                "sender",
                "sender name",
                "remitter",
                "remitter name",
                "from",
                "account holder",
                "description",
                "particulars",
            ],

            remarks: [
                "remarks",
                "remark",
                "narration",
                "description",
                "particulars",
            ],
        };
    }

    async parseStatement(file) {
        if (!file) {
            throw new ApiError(400, "No bank statement uploaded.");
        }

        // DEBUG (remove before production)
        // console.log("Uploaded statement:", file.originalname);
        // console.log("File size:", file.size);
        // console.log("Mime type:", file.mimetype);

        if (!file.originalname.toLowerCase().endsWith(".xlsx")) {
            throw new ApiError(400, "Only Excel (.xlsx) statements are supported.");
        }

        const workbook = new ExcelJS.Workbook();

        try {
            await workbook.xlsx.load(file.buffer);
        } catch (error) {
            throw new ApiError(400, "Unable to read Excel workbook.");
        }

        if (workbook.worksheets.length === 0) {
            throw new ApiError(400, "Excel sheet is empty.");
        }

        const worksheet = workbook.worksheets[0];

        if (worksheet.rowCount < 2) {
            throw new ApiError(
                400,
                "Statement must contain at least one transaction."
            );
        }

        let headerRowNumber = 0;
        let requiredColumns = null;

        // Bank exports often include a title or account summary before the headers.
        for (let rowNumber = 1; rowNumber <= Math.min(worksheet.rowCount, 20); rowNumber++) {
            const headers = {};
            worksheet.getRow(rowNumber).eachCell((cell, columnNumber) => {
                const value = String(cell.text ?? cell.value ?? "").trim().toLowerCase();
                if (value) headers[value] = columnNumber;
            });

            const columns = {};
            for (const field of Object.keys(this.headerMapping)) {
                for (const possibleHeader of this.headerMapping[field]) {
                    if (headers[possibleHeader]) {
                        columns[field] = headers[possibleHeader];
                        break;
                    }
                }
            }

            if (columns.transactionId && columns.transactionDate && columns.amount) {
                headerRowNumber = rowNumber;
                requiredColumns = columns;
                break;
            }
        }

        if (!requiredColumns) {
            throw new ApiError(
                400,
                "Required statement columns could not be detected."
            );
        }

        const transactions = [];
        const invalidRows = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= headerRowNumber) {
                return;
            }

            const transactionId = row.getCell(requiredColumns.transactionId).text?.trim() ?? "";
            const transactionIdNormalized = normalizeTransactionId(transactionId);

            if (!transactionIdNormalized) {
                return;
            }

            const amountValue = row.getCell(requiredColumns.amount).value;
            const amountInPaise = amountToPaise(
                typeof amountValue === "object" && amountValue?.result !== undefined
                    ? amountValue.result
                    : amountValue
            );
            const rawDate = row.getCell(requiredColumns.transactionDate).value;
            const transactionDate = rawDate instanceof Date
                ? rawDate
                : typeof rawDate === "number"
                    ? new Date(Date.UTC(1899, 11, 30) + rawDate * 86400000)
                    : new Date(rawDate);

            if (!amountInPaise || Number.isNaN(transactionDate.getTime())) {
                invalidRows.push({
                    rowNumber,
                    transactionId,
                    reason: !amountInPaise ? "Amount must be a positive number." : "Transaction date is invalid.",
                });
                return;
            }

            const senderName = requiredColumns.senderName
                ? row.getCell(requiredColumns.senderName).text?.trim() ?? ""
                : "";

            const remarks = requiredColumns.remarks
                ? row.getCell(requiredColumns.remarks).text?.trim() ?? ""
                : "";

            transactions.push({
                transactionId,
                transactionIdNormalized,
                amount: paiseToAmount(amountInPaise),
                amountInPaise,
                transactionDate,
                senderName,
                remarks,
            });
        });

        // DEBUG (remove before production)
        // console.log("Parsed transactions:", transactions.length);
        // console.log(transactions.slice(0, 3));

        if (transactions.length === 0) {
            throw new ApiError(
                400,
                "No valid transactions were found in the uploaded statement.",
                invalidRows
            );
        }

        return { transactions, invalidRows };
    }
}

export default new BankStatementParserService();
