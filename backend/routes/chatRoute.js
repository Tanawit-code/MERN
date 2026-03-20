import express from "express";
import authUser from "../middleware/authMiddleware.js";

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
chatRouter.get("/users/search", authUser, searchUsers);
chatRouter.post("/friend-request/send", authUser, sendFriendRequest);
chatRouter.get("/friend-request/received", authUser, getReceivedFriendRequests);
chatRouter.get("/friend-request/sent", authUser, getSentFriendRequests);
chatRouter.post("/friend-request/accept", authUser, acceptFriendRequest);
chatRouter.post("/friend-request/reject", authUser, rejectFriendRequest);
chatRouter.post("/friend-request/cancel", authUser, cancelFriendRequest);
chatRouter.get("/friends", authUser, getFriends);
chatRouter.post("/friends/unfriend", authUser, unfriend);

/* ---------- conversation ---------- */
chatRouter.post(
    "/conversation/private",
    authUser,
    createOrGetPrivateConversation
);
chatRouter.get("/conversations", authUser, getMyConversations);
chatRouter.get("/conversation/:conversationId", authUser, getConversationById);

/* ---------- message ---------- */
chatRouter.post("/message/send", authUser, sendMessage);
chatRouter.get(
    "/messages/:conversationId",
    authUser,
    getMessagesByConversation
);

export default chatRouter;