import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const isXlsx = file.originalname.toLowerCase().endsWith(".xlsx");
    const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/octet-stream",
    ];

    if (isXlsx && allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only Excel (.xlsx) files are allowed"), false);
    }
};

export const statementUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
});
