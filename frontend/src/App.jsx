import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Member from "./pages/Member"
import Home from "./pages/Home"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import SearchUsers from "./pages/SearchUsers";
import FriendRequests from "./pages/FriendRequests";
import FriendsList from "./pages/FriendsList";
import ChatPage from "./pages/ChatPage";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<Member />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<SearchUsers />} />
        <Route path="/requests" element={<FriendRequests />} />
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
      </Routes>
    </div>
  )
}

export default App