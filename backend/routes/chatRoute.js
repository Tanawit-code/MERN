import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    searchUsers,
    sendFriendRequest,
    getReceivedFriendRequests,
    getSentFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    getFriends,
    unfriend,
} from "../controllers/friendController.js";

import {
    createOrGetPrivateConversation,
    getMyConversations,
    getConversationById,
} from "../controllers/conversationController.js";

import {
    sendMessage,
    getMessagesByConversation,
} from "../controllers/messageController.js";

const chatRouter = express.Router();

/* ---------- friend ---------- */
chatRouter.get("/users/search", authMiddleware, searchUsers);
chatRouter.post("/friend-request/send", authMiddleware, sendFriendRequest);
chatRouter.get("/friend-request/received", authMiddleware, getReceivedFriendRequests);
chatRouter.get("/friend-request/sent", authMiddleware, getSentFriendRequests);
chatRouter.post("/friend-request/accept", authMiddleware, acceptFriendRequest);
chatRouter.post("/friend-request/reject", authMiddleware, rejectFriendRequest);
chatRouter.post("/friend-request/cancel", authMiddleware, cancelFriendRequest);
chatRouter.get("/friends", authMiddleware, getFriends);
chatRouter.post("/friends/unfriend", authMiddleware, unfriend);

/* ---------- conversation ---------- */
chatRouter.post(
    "/conversation/private",
    authMiddleware,
    createOrGetPrivateConversation
);
chatRouter.get("/conversations", authMiddleware, getMyConversations);
chatRouter.get("/conversation/:conversationId", authMiddleware, getConversationById);

/* ---------- message ---------- */
chatRouter.post("/message/send", authMiddleware, sendMessage);
chatRouter.get(
    "/messages/:conversationId",
    authMiddleware,
    getMessagesByConversation
);

export default chatRouter;