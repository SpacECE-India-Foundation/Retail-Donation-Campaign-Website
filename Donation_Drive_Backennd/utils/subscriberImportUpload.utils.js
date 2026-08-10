import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const isXlsx = file.originalname.toLowerCase().endsWith(".xlsx");
    const allowedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/octet-stream",
    ];

    if (isXlsx && allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    return cb(new Error("Only Excel (.xlsx) files are allowed."), false);
};

export const subscriberImportUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
