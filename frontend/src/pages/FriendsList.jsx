import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getFriendsApi,
    createPrivateConversationApi,
} from "../services/chatApi";
import { useNavigate } from "react-router-dom";

function FriendsList() {
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();

    const fetchFriends = async () => {
        try {
            const res = await getFriendsApi();
            setFriends(res.data.friends || []);
        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const handleStartChat = async (friendId) => {
        try {
            const res = await createPrivateConversationApi(friendId);
            const conversationId = res.data.conversation._id;
            navigate(`/chat/${conversationId}`);
        } catch (error) {
            alert(error.response?.data?.message || "เริ่มแชทไม่สำเร็จ");
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <div className="bg-gray-100 min-h-screen">
                <div style={{ maxWidth: "600px", margin: "20px auto", padding: "0 20px", paddingTop: "80px" }}>
                    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>รายชื่อเพื่อน</h2>

                    {friends.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#555" }}>ยังไม่มีเพื่อน</p>
                    ) : (
                        friends.map((friend) => (
                            <div
                                key={friend._id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    border: "1px solid #ddd",
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    marginBottom: "12px",
                                    backgroundColor: "#fff",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                    transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            >
                                <div>
                                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "15px", }}>{friend.name}</p>
                                    <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{friend.email}</p>
                                </div>

                                <button
                                    onClick={() => handleStartChat(friend._id)}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: "20px",
                                        border: "none",
                                        backgroundColor: "#2e6df5",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                    }}
                                >
                                    แชท
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default FriendsList;