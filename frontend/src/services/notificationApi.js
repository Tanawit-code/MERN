import axios from "axios";
import { API_URL } from "../config/api";

const API = axios.create({
    baseURL: `${API_URL}/notifications`,
    withCredentials: true,
});

export const getNotificationsApi = () => API.get("/");
export const getUnreadNotificationCountApi = () => API.get("/unread-count");
export const markNotificationAsReadApi = (notificationId) =>
    API.post("/read", { notificationId });
export const markAllNotificationsAsReadApi = () => API.post("/read-all");
export const clearAllNotificationsApi = () =>
    API.delete("/clear-all");