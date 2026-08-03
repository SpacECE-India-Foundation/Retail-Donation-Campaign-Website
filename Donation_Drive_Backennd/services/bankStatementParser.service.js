import ExcelJS from "exceljs";
import { ApiError } from "../utils/apiError.utils.js";

class BankStatementParserService {
    constructor() {
        this.supportedExtensions = [".xlsx"];

        //here, we have done the headermapping so we can allow the flexible schema of bank xlsx file with different headers
        //this are the commonly used headers in the trasnaction file
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

    //here, is the actual parsing logic is implemented
    async parseStatement(file) {
        ApiError.assert(file,"No file is Uploaded!!")

        // DEBUG (remove before production)
        // console.log("Uploaded statement:", file.originalname);
        // console.log("File size:", file.size);
        // console.log("Mime type:", file.mimetype);

        const workbook = new ExcelJS.Workbook();

        try {
            await workbook.xlsx.load(file.buffer);
        } catch (error) {
            throw new ApiError(400, "Unable to read Excel workbook.");
        }

        if (workbook.worksheets.length === 0) {
            throw new ApiError(400, "Excel sheet is empty.");
        }

        //storing the very first worksheet from the excel file 
        const worksheet = workbook.worksheets[0];

        //here, we have checked for the rowcount 2 is because if the rowcount is less than two that means there is no any transactionrows, there is only header rows
        ApiError.assert(worksheet.rowCount>2,"Statement must contain at least one transaction!!")

        const headerRow = worksheet.getRow(1);

        const headers = {};

        headerRow.eachCell((cell, columnNumber) => {
            const value = String(cell.value ?? "")
                .trim()
                .toLowerCase();

            headers[value] = columnNumber;
        });

        // DEBUG (remove before production)
        // console.log("Detected headers:", headers);

        const requiredColumns = {};

        for (const field of Object.keys(this.headerMapping)) {
            for (const possibleHeader of this.headerMapping[field]) {
                if (headers[possibleHeader]) {
                    requiredColumns[field] = headers[possibleHeader];
                    break;
                }
            }
        }

        if (
            !requiredColumns.transactionId ||
            !requiredColumns.transactionDate ||
            !requiredColumns.amount
        ) {
            throw new ApiError(
                400,
                "Required statement columns could not be detected."
            );
        }

        const transactions = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                return;
            }

            const transactionId =
                row.getCell(requiredColumns.transactionId).text?.trim() ?? "";

            if (!transactionId) {
                return;
            }

            const amountValue =
                row.getCell(requiredColumns.amount).value ?? 0;

            const amount = Number(amountValue);

            const transactionDate =
                row.getCell(requiredColumns.transactionDate).value;

            const senderName = requiredColumns.senderName
                ? row.getCell(requiredColumns.senderName).text?.trim() ?? ""
                : "";

            const remarks = requiredColumns.remarks
                ? row.getCell(requiredColumns.remarks).text?.trim() ?? ""
                : "";

            transactions.push({
                utr: transactionId,
                amount,
                transactionDate: new Date(transactionDate),
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
                "No valid transactions were found in the uploaded statement."
            );
        }

        return transactions;
    }
}

export default new BankStatementParserService();