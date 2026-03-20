import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/chat",
    withCredentials: true,
});

export const searchUsersApi = (keyword) =>
    API.get(`/users/search?keyword=${keyword}`);

export const sendFriendRequestApi = (receiverId) =>
    API.post("/friend-request/send", { receiverId });

export const getReceivedRequestsApi = () =>
    API.get("/friend-request/received");

export const acceptFriendRequestApi = (requestId) =>
    API.post("/friend-request/accept", { requestId });

export const rejectFriendRequestApi = (requestId) =>
    API.post("/friend-request/reject", { requestId });

export const getFriendsApi = () => API.get("/friends");

export const createPrivateConversationApi = (friendId) =>
    API.post("/conversation/private", { friendId });

export const getMessagesApi = (conversationId) =>
    API.get(`/messages/${conversationId}`);

export const sendMessageApi = (conversationId, text) =>
    API.post("/message/send", { conversationId, text });

export const getSentFriendRequestsApi = () =>
    API.get("/friend-request/sent");