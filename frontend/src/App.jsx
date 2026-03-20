import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/login";
import Home from "./pages/Home";
import SearchUsers from "./pages/SearchUsers";
import FriendRequests from "./pages/FriendRequests";
import FriendsList from "./pages/FriendsList";
import ChatPage from "./pages/ChatPage";

// ✅ เพิ่ม 2 ตัวนี้
import VerifyEmail from "./pages/VerifyEmail";
import CheckEmail from "./pages/CheckEmail";

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ หน้าใหม่ */}
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/member" element={<Navigate to="/" replace />} />
        <Route path="/search" element={<SearchUsers />} />
        <Route path="/search-users" element={<SearchUsers />} />
        <Route path="/friend-requests" element={<FriendRequests />} />
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;