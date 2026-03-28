export const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_BASE = API_URL.replace(/\/api$/, "");

export const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("data:image") || path.startsWith("data:video")) return path;
    if (path.startsWith("/")) return `${API_BASE}${path}`;
    return `${API_BASE}/${path}`;
};