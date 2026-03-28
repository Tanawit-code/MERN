import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getFriendsApi,
    createPrivateConversationApi,
} from "../services/chatApi";
import { useNavigate, Link } from "react-router-dom";
import { getImageUrl } from "../config/api";

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
                <div
                    style={{
                        maxWidth: "700px",
                        margin: "20px auto",
                        padding: "0 20px",
                        paddingTop: "80px",
                    }}
                >
                    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                        รายชื่อเพื่อน
                    </h2>

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
                                    gap: "12px",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = "scale(1.02)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = "scale(1)")
                                }
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            backgroundColor: "#2e6df5",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: "bold",
                                            fontSize: "18px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {friend.profilePic ? (
                                            <img
                                                src={getImageUrl(friend.profilePic)}
                                                alt="profile"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            friend.name?.charAt(0).toUpperCase() || "U"
                                        )}
                                    </div>

                                    <div>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontWeight: "bold",
                                                fontSize: "15px",
                                            }}
                                        >
                                            {friend.name}
                                        </p>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                color: "#666",
                                            }}
                                        >
                                            {friend.email}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Link
                                        to={`/profile/${friend._id}`}
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            border: "1px solid #d1d5db",
                                            backgroundColor: "#fff",
                                            color: "#111827",
                                            fontWeight: "bold",
                                            textDecoration: "none",
                                            fontSize: "13px",
                                            display: "inline-block",
                                        }}
                                    >
                                        ดูโปรไฟล์
                                    </Link>

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
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default FriendsList;