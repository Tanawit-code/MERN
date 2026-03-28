import axios from "axios";
import { API_URL } from "../config/api";

// API กลุ่มเพื่อน
const FRIEND_API = axios.create({
    baseURL: `${API_URL}/friends`,
    withCredentials: true,
});

// API กลุ่มแชต
const CHAT_API = axios.create({
    baseURL: `${API_URL}/chat`,
    withCredentials: true,
});

// =========================
// FRIEND APIs
// =========================

export const searchUsersApi = (keyword) =>
    FRIEND_API.get(`/search?keyword=${encodeURIComponent(keyword)}`);

export const sendFriendRequestApi = (receiverId) =>
    FRIEND_API.post("/request", { receiverId });

export const getReceivedFriendRequestsApi = () =>
    FRIEND_API.get("/requests/received");

// เผื่อบางหน้าเดิมยังใช้ชื่อเก่า
export const getReceivedRequestsApi = () =>
    FRIEND_API.get("/requests/received");

export const getSentFriendRequestsApi = () =>
    FRIEND_API.get("/requests/sent");

export const acceptFriendRequestApi = (requestId) =>
    FRIEND_API.post("/accept", { requestId });

export const rejectFriendRequestApi = (requestId) =>
    FRIEND_API.post("/reject", { requestId });

export const cancelFriendRequestApi = (requestId) =>
    FRIEND_API.post("/cancel", { requestId });

export const getFriendsApi = () =>
    FRIEND_API.get("/");

export const unfriendApi = (friendId) =>
    FRIEND_API.delete("/unfriend", {
        data: { friendId },
    });

// =========================
// CHAT APIs
// =========================

export const createPrivateConversationApi = (friendId) =>
    CHAT_API.post("/conversation/private", { friendId });

export const getMyConversationsApi = () =>
    CHAT_API.get("/conversations");

export const getConversationApi = (conversationId) =>
    CHAT_API.get(`/conversation/${conversationId}`);

export const getMessagesApi = (conversationId) =>
    CHAT_API.get(`/messages/${conversationId}`);

// รองรับทั้งแบบส่ง object และส่งทีละ argument
export const sendMessageApi = (
    conversationIdOrPayload,
    text = "",
    media = "",
    mediaType = ""
) => {
    if (
        typeof conversationIdOrPayload === "object" &&
        conversationIdOrPayload !== null
    ) {
        return CHAT_API.post("/message/send", conversationIdOrPayload);
    }

    return CHAT_API.post("/message/send", {
        conversationId: conversationIdOrPayload,
        text,
        media,
        mediaType,
    });
};