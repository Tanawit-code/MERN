import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// อนุญาตเฉพาะไฟล์ภาพ
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];

// ตั้งชื่อไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});

// ตรวจไฟล์
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("ประเภทไฟล์ไม่ถูกต้อง (อนุญาตเฉพาะรูปภาพ)"), false);
    }

    if (!allowedExt.includes(ext)) {
        return cb(new Error("นามสกุลไฟล์ไม่ถูกต้อง"), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export default upload;