// router หลักของ frontend
// มีหน้าหลัก ๆ เช่น:

// / → Home
// /login
// /search
// /friend-requests
// /friends
// /chat/:conversationId
// /profilepage
// /groups
// /groups/:groupId

// สรุปคือเป็นไฟล์กำหนดว่า URL ไหนจะเปิดหน้าอะไร

import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/login";
import Home from "./pages/Home";
import SearchUsers from "./pages/SearchUsers";
import FriendRequests from "./pages/FriendRequests";
import FriendsList from "./pages/FriendsList";
import ChatPage from "./pages/ChatPage";

import VerifyEmail from "./pages/VerifyEmail";
import CheckEmail from "./pages/CheckEmail";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProfilePage from "./pages/ProfilePage";

import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";

import EditGroupPage from "./pages/EditGroupPage";

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/member" element={<Navigate to="/" replace />} />
        <Route path="/search" element={<SearchUsers />} />
        <Route path="/search-users" element={<SearchUsers />} />
        <Route path="/friend-requests" element={<FriendRequests />} />
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/profilepage" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />

        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />

        <Route path="/groups/edit/:groupId" element={<EditGroupPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;