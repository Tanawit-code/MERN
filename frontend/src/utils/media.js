import { API_BASE } from "../config/api";

export const getMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";

    const value = path.trim();
    if (!value) return "";

    // base64
    if (value.startsWith("data:image") || value.startsWith("data:video")) {
        return value;
    }

    // full url
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    // path แบบ /uploads/abc.jpg
    if (value.startsWith("/")) {
        return `${API_BASE}${value}`;
    }

    // path แบบ uploads/abc.jpg
    if (value.includes("uploads")) {
        return `${API_BASE}/${value}`;
    }

    // fallback กรณีเก็บชื่อไฟล์เฉย ๆ
    return `${API_BASE}/uploads/${value}`;
};

export const hasMedia = (path) => {
    return typeof path === "string" && path.trim() !== "";
};