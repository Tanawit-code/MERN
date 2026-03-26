import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/groups";

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `group-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
        "image/gif",
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("อนุญาตเฉพาะไฟล์รูป jpg, jpeg, png, webp, gif"));
    }
};

const uploadGroupImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadGroupImage;