import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    searchUsersApi,
    sendFriendRequestApi,
    getSentFriendRequestsApi,
    getFriendsApi,
} from "../services/chatApi";


function SearchUsers() {
    const [keyword, setKeyword] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sendingId, setSendingId] = useState(null);
    const [sentRequests, setSentRequests] = useState({});
    const [friendMap, setFriendMap] = useState({});

    useEffect(() => {
        fetchSentRequests();
        fetchFriends();
    }, []);

    const fetchSentRequests = async () => {
        try {
            const res = await getSentFriendRequestsApi();
            const requests = res.data.requests || [];

            const sentMap = {};
            requests.forEach((req) => {
                if (req.receiver?._id) sentMap[req.receiver._id] = true;
                else if (req.receiver) sentMap[req.receiver] = true;
            });

            setSentRequests(sentMap);
        } catch (error) {
            console.log("โหลดคำขอที่ส่งไปแล้วไม่สำเร็จ", error.response?.data || error.message);
        }
    };

    const fetchFriends = async () => {
        try {
            const res = await getFriendsApi();
            const friends = res.data.friends || [];

            const map = {};
            friends.forEach((friend) => {
                if (friend?._id) map[friend._id] = true;
            });

            setFriendMap(map);
        } catch (error) {
            console.log("โหลดรายชื่อเพื่อนไม่สำเร็จ", error.response?.data || error.message);
        }
    };

    const handleSearch = async () => {
        if (!keyword.trim()) return;

        try {
            setLoading(true);
            await fetchSentRequests();
            await fetchFriends();

            const res = await searchUsersApi(keyword);
            setUsers(res.data.users || []);
        } catch (error) {
            console.log(error.response?.data || error.message);
            alert(error.response?.data?.message || "ค้นหาไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (receiverId) => {
        try {
            setSendingId(receiverId);
            const res = await sendFriendRequestApi(receiverId);

            setSentRequests((prev) => ({
                ...prev,
                [receiverId]: true,
            }));

            alert(res.data.message);
        } catch (error) {
            const message = error.response?.data?.message || "ส่งคำขอไม่สำเร็จ";

            if (message === "ส่งคำขอไปแล้ว") {
                setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
            }

            if (message === "เป็นเพื่อนกันอยู่แล้ว") {
                setFriendMap((prev) => ({ ...prev, [receiverId]: true }));
                setSentRequests((prev) => {
                    const updated = { ...prev };
                    delete updated[receiverId];
                    return updated;
                });
            }

            alert(message);
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
                <h2 style={{ textAlign: "center", marginBottom: "20px", paddingTop: "80px" }}>ค้นหาผู้ใช้</h2>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <input
                        type="text"
                        placeholder="ค้นหาจาก username หรือ email"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            width: "300px",
                            fontSize: "14px",
                            outline: "none",
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            marginLeft: "10px",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#2e6df5",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        ค้นหา
                    </button>
                </div>

                {loading && <p style={{ textAlign: "center", color: "#555" }}>กำลังค้นหา...</p>}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {users.map((user) => {
                        const isSending = sendingId === user._id;
                        const isFriend = friendMap[user._id];
                        const isSent = !isFriend && sentRequests[user._id];

                        return (
                            <div
                                key={user._id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    border: "1px solid #ddd",
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    backgroundColor: "#fff",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                }}
                            >
                                <div>
                                    <p style={{ margin: 0, fontWeight: "bold" }}>{user.username}</p>
                                    <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{user.email}</p>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleAddFriend(user._id)}
                                        disabled={isSending || isSent || isFriend}
                                        style={{
                                            padding: "6px 12px",
                                            borderRadius: "20px",
                                            border: "none",
                                            backgroundColor: isFriend
                                                ? "#aaa"
                                                : isSent
                                                    ? "#f0ad4e"
                                                    : "#2e6df5",
                                            color: "#fff",
                                            fontWeight: "bold",
                                            cursor: isSending || isSent || isFriend ? "not-allowed" : "pointer",
                                            fontSize: "13px",
                                        }}
                                    >
                                        {isSending
                                            ? "กำลังส่ง..."
                                            : isFriend
                                                ? "เป็นเพื่อนกันอยู่แล้ว"
                                                : isSent
                                                    ? "ส่งคำขอแล้ว"
                                                    : "เพิ่มเพื่อน"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default SearchUsers;