export const getImageUrl = (path, backendUrl = "http://localhost:5000") => {
    if (!path) return "";

    // ถ้าเป็น base64 หรือ blob หรือ url เต็ม ใช้ได้เลย
    if (
        path.startsWith("data:") ||
        path.startsWith("blob:") ||
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {
        return path;
    }

    // ถ้าเป็น path ธรรมดา เช่น uploads/a.jpg หรือ /uploads/a.jpg
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${backendUrl}${cleanPath}`;
};