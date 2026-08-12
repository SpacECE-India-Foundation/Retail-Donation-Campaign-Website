import ExcelJS from "exceljs";
import Subscriber from "../../models/subscribers.modals.js";
import Campaign from "../../models/campaign.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";

const MAX_IMPORT_ROWS = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normaliseHeader = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const cellText = (cell) => String(cell?.text ?? cell?.value ?? "").trim();

const parseDate = (value) => {
    // ExcelJS normally returns a Date for cells formatted as dates.
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

    // Formula cells can expose their calculated value through `result`.
    if (value && typeof value === "object" && "result" in value) {
        return parseDate(value.result);
    }

    // Excel serial date (1900 date system; ExcelJS-compatible epoch).
    if (typeof value === "number" || (typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value.trim()))) {
        const serial = Number(value);
        if (serial > 0 && serial < 300000) {
            const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
            if (!Number.isNaN(date.getTime())) return date;
        }
    }

    if (!value) return null;
    const text = String(value).trim();

    // Support ISO and naturally parseable values (for example, "January 5, 2025").
    const nativeDate = new Date(text);
    if (!Number.isNaN(nativeDate.getTime()) && !/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(text)) {
        return nativeDate;
    }

    // Support dd/mm/yyyy, dd-mm-yyyy, mm/dd/yyyy, and two-digit years.
    const parts = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})$/);
    if (!parts) return null;

    let first = Number(parts[1]);
    let second = Number(parts[2]);
    let year = Number(parts[3]);
    if (year < 100) year += year >= 70 ? 1900 : 2000;

    // If one side is greater than 12, its position is unambiguous. Otherwise
    // use day-first, which matches the project's expected Excel input format.
    let day = first;
    let month = second;
    if (first <= 12 && second > 12) {
        month = first;
        day = second;
    }

    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day ? date : null;
};

const splitCampaigns = (value) => String(value || "")
    .split(/[;,|]/)
    .map((campaign) => campaign.trim())
    .filter(Boolean);

const resolveCampaignIds = async (values) => {
    const uniqueValues = [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
    if (!uniqueValues.length) return { ids: [], unknown: [] };
    const campaigns = await Campaign.find({ $or: [
        { _id: { $in: uniqueValues.filter((value) => /^[a-f\d]{24}$/i.test(value)) } },
        { campaignName: { $in: uniqueValues } },
    ] }).select("_id campaignName").lean();
    const campaignMap = new Map(campaigns.flatMap((campaign) => [[String(campaign._id), campaign._id], [campaign.campaignName, campaign._id]]));
    return {
        ids: uniqueValues.map((value) => campaignMap.get(value)).filter(Boolean),
        unknown: uniqueValues.filter((value) => !campaignMap.has(value)),
        map: campaignMap,
    };
};

const getColumnIndexes = (worksheet) => {
    const headers = worksheet.getRow(1).values;
    let donorNameColumn;
    let donorEmailColumn;
    let lastDonationColumn;
    let subscribedCampaignsColumn;

    headers.forEach((header, index) => {
        const value = normaliseHeader(header);

        if (["donorname", "name", "fullname"].includes(value)) donorNameColumn = index;
        if (["donoremail", "email", "emailaddress"].includes(value)) donorEmailColumn = index;
        if (["lastdonation", "lastdonationat", "donationdate", "lastdonationdate"].includes(value)) lastDonationColumn = index;
        if (["subscribedcampaign", "subscribedcampaigns", "campaign", "campaigns"].includes(value)) subscribedCampaignsColumn = index;
    });

    if (!donorNameColumn || !donorEmailColumn) {
        throw new ApiError(400, "The first worksheet must contain donorName and donorEmail columns.");
    }

    return { donorNameColumn, donorEmailColumn, lastDonationColumn, subscribedCampaignsColumn };
};

const buildPreviewRows = async (file) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new ApiError(400, "The Excel file does not contain a worksheet.");

    const { donorNameColumn, donorEmailColumn, lastDonationColumn, subscribedCampaignsColumn } = getColumnIndexes(worksheet);
    const rows = [];
    const emailsInFile = new Set();

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const donorName = cellText(row.getCell(donorNameColumn));
        const donorEmail = cellText(row.getCell(donorEmailColumn)).toLowerCase();
        const lastDonationAt = lastDonationColumn ? parseDate(row.getCell(lastDonationColumn).value) : null;
        const subscribedCampaigns = subscribedCampaignsColumn ? splitCampaigns(cellText(row.getCell(subscribedCampaignsColumn))) : [];
        if (!donorName && !donorEmail) return;

        const previewRow = { rowNumber, donorName, donorEmail, lastDonationAt, subscribedCampaigns, status: "READY", reason: null };
        if (!donorName) {
            previewRow.status = "INVALID";
            previewRow.reason = "Donor name is required.";
        } else if (!EMAIL_PATTERN.test(donorEmail)) {
            previewRow.status = "INVALID";
            previewRow.reason = "A valid donor email is required.";
        } else if (emailsInFile.has(donorEmail)) {
            previewRow.status = "DUPLICATE_IN_FILE";
            previewRow.reason = "This email is repeated in the uploaded file.";
        } else if (lastDonationColumn && cellText(row.getCell(lastDonationColumn)) && !lastDonationAt) {
            previewRow.status = "INVALID";
            previewRow.reason = "Last donation must be a valid date.";
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

    const campaignValues = [...new Set(rows.flatMap((row) => row.status === "READY" ? row.subscribedCampaigns : []))];
    if (campaignValues.length) {
        const { unknown: unknownValues, map: campaignMap } = await resolveCampaignIds(campaignValues);
        rows.forEach((row) => {
            if (row.status !== "READY") return;
            const resolved = row.subscribedCampaigns.map((value) => campaignMap.get(value)).filter(Boolean);
            const unknown = row.subscribedCampaigns.filter((value) => unknownValues.includes(value));
            if (unknown.length) {
                row.status = "INVALID";
                row.reason = `Campaign not found: ${unknown.join(", ")}.`;
            } else {
                row.subscribedCampaigns = resolved;
            }
        });
    }

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
            const lastDonationAt = row?.lastDonationAt ? parseDate(row.lastDonationAt) : null;
            const subscribedCampaigns = Array.isArray(row?.subscribedCampaigns) ? row.subscribedCampaigns : [];

            if (!donorName || !EMAIL_PATTERN.test(donorEmail) || seenEmails.has(donorEmail) || (row?.lastDonationAt && !lastDonationAt)) {
                invalidRows.push({ rowNumber: row?.rowNumber || index + 1, donorName, donorEmail, reason: "Invalid, missing, or duplicate subscriber data." });
                return validRecords;
            }
            seenEmails.add(donorEmail);
            validRecords.push({ donorName, donorEmail, subscribed: true, lastDonationAt, subscribedCampaigns });
            return validRecords;
        }, []);

        if (!records.length) throw new ApiError(400, "There are no valid subscriber records to import.");

        const campaignResolution = await resolveCampaignIds(records.flatMap((record) => record.subscribedCampaigns));
        if (campaignResolution.unknown.length) {
            throw new ApiError(400, `Campaign not found: ${campaignResolution.unknown.join(", ")}.`);
        }
        const campaignMap = new Map();
        const campaignDocuments = await Campaign.find({ _id: { $in: campaignResolution.ids } }).select("_id campaignName").lean();
        campaignDocuments.forEach((campaign) => {
            campaignMap.set(String(campaign._id), campaign._id);
            campaignMap.set(campaign.campaignName, campaign._id);
        });
        records.forEach((record) => {
            record.subscribedCampaigns = record.subscribedCampaigns.map((value) => campaignMap.get(String(value))).filter(Boolean);
            record.lastDonationAt = record.lastDonationAt || null;
            if (!record.subscribedCampaigns.length) delete record.subscribedCampaigns;
        });

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
