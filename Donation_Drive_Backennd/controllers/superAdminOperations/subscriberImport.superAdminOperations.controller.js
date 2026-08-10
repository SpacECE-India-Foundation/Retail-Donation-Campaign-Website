import ExcelJS from "exceljs";
import Subscriber from "../../models/subscribers.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";

const MAX_IMPORT_ROWS = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normaliseHeader = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const cellText = (cell) => String(cell?.text ?? cell?.value ?? "").trim();

const getColumnIndexes = (worksheet) => {
    const headers = worksheet.getRow(1).values;
    let donorNameColumn;
    let donorEmailColumn;

    headers.forEach((header, index) => {
        const value = normaliseHeader(header);

        if (["donorname", "name", "fullname"].includes(value)) donorNameColumn = index;
        if (["donoremail", "email", "emailaddress"].includes(value)) donorEmailColumn = index;
    });

    if (!donorNameColumn || !donorEmailColumn) {
        throw new ApiError(400, "The first worksheet must contain donorName and donorEmail columns.");
    }

    return { donorNameColumn, donorEmailColumn };
};

const buildPreviewRows = async (file) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new ApiError(400, "The Excel file does not contain a worksheet.");

    const { donorNameColumn, donorEmailColumn } = getColumnIndexes(worksheet);
    const rows = [];
    const emailsInFile = new Set();

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const donorName = cellText(row.getCell(donorNameColumn));
        const donorEmail = cellText(row.getCell(donorEmailColumn)).toLowerCase();
        if (!donorName && !donorEmail) return;

        const previewRow = { rowNumber, donorName, donorEmail, status: "READY", reason: null };
        if (!donorName) {
            previewRow.status = "INVALID";
            previewRow.reason = "Donor name is required.";
        } else if (!EMAIL_PATTERN.test(donorEmail)) {
            previewRow.status = "INVALID";
            previewRow.reason = "A valid donor email is required.";
        } else if (emailsInFile.has(donorEmail)) {
            previewRow.status = "DUPLICATE_IN_FILE";
            previewRow.reason = "This email is repeated in the uploaded file.";
        } else {
            emailsInFile.add(donorEmail);
        }
        rows.push(previewRow);
    });

    if (!rows.length) throw new ApiError(400, "The Excel file has no subscriber records.");
    if (rows.length > MAX_IMPORT_ROWS) {
        throw new ApiError(400, `A maximum of ${MAX_IMPORT_ROWS} subscriber records can be imported at once.`);
    }

    const validEmails = rows.filter((row) => row.status === "READY").map((row) => row.donorEmail);
    const existingEmails = new Set(await Subscriber.distinct("donorEmail", { donorEmail: { $in: validEmails } }));

    rows.forEach((row) => {
        if (row.status === "READY" && existingEmails.has(row.donorEmail)) {
            row.status = "ALREADY_SUBSCRIBED";
            row.reason = "A subscriber with this email already exists.";
        }
    });

    return rows;
};

export const previewSubscriberImport = async (req, res) => {
    try {
        if (!req.file) throw new ApiError(400, "An Excel file is required.");

        const rows = await buildPreviewRows(req.file);
        const readyCount = rows.filter((row) => row.status === "READY").length;

        return res.status(200).json(new ApiResponse(200, {
            rows,
            summary: { totalRows: rows.length, readyCount, skippedCount: rows.length - readyCount },
        }, "Subscriber import preview generated successfully."));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Failed to preview subscriber import.")
        );
    }
};

export const commitSubscriberImport = async (req, res) => {
    try {
        const submittedRows = req.body?.subscribers;
        if (!Array.isArray(submittedRows) || !submittedRows.length) {
            throw new ApiError(400, "At least one subscriber is required to complete the import.");
        }
        if (submittedRows.length > MAX_IMPORT_ROWS) {
            throw new ApiError(400, `A maximum of ${MAX_IMPORT_ROWS} subscriber records can be imported at once.`);
        }

        const seenEmails = new Set();
        const invalidRows = [];
        const records = submittedRows.reduce((validRecords, row, index) => {
            const donorName = String(row?.donorName || "").trim();
            const donorEmail = String(row?.donorEmail || "").trim().toLowerCase();

            if (!donorName || !EMAIL_PATTERN.test(donorEmail) || seenEmails.has(donorEmail)) {
                invalidRows.push({ rowNumber: row?.rowNumber || index + 1, donorName, donorEmail, reason: "Invalid, missing, or duplicate subscriber data." });
                return validRecords;
            }
            seenEmails.add(donorEmail);
            validRecords.push({ donorName, donorEmail, subscribed: true });
            return validRecords;
        }, []);

        if (!records.length) throw new ApiError(400, "There are no valid subscriber records to import.");

        const existingEmails = new Set(await Subscriber.distinct("donorEmail", { donorEmail: { $in: records.map((record) => record.donorEmail) } }));
        const recordsToInsert = records.filter((record) => !existingEmails.has(record.donorEmail));

        let importedCount = 0;
        let duplicateCount = existingEmails.size;
        const importFailures = [...invalidRows];

        if (recordsToInsert.length) {
            try {
                const inserted = await Subscriber.insertMany(recordsToInsert, { ordered: false });
                importedCount = inserted.length;
            } catch (error) {
                const writeErrors = error?.writeErrors || [];
                importedCount = error?.insertedDocs?.length || 0;
                duplicateCount += writeErrors.filter((writeError) => writeError.code === 11000).length;
                writeErrors.filter((writeError) => writeError.code !== 11000).forEach((writeError) => {
                    const record = recordsToInsert[writeError.index];
                    importFailures.push({ donorName: record?.donorName, donorEmail: record?.donorEmail, reason: writeError.errmsg || "Import failed." });
                });
                if (!writeErrors.length) throw error;
            }
        }

        return res.status(201).json(new ApiResponse(201, {
            importedCount,
            duplicateCount,
            invalidCount: invalidRows.length,
            failedCount: importFailures.length,
            importFailures,
        }, "Subscriber import completed successfully."));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Failed to import subscribers.")
        );
    }
};
