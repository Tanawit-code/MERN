import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Member from "./pages/Member";
import Home from "./pages/Home";
import SearchUsers from "./pages/SearchUsers";
import FriendRequests from "./pages/FriendRequests";
import FriendsList from "./pages/FriendsList";
import ChatPage from "./pages/ChatPage";

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<Member />} />
        <Route path="/search-users" element={<SearchUsers />} />
        <Route path="/friend-requests" element={<FriendRequests />} />
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>
    </>
  );
};

export default App;