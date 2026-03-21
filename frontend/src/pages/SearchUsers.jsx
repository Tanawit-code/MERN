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
            console.log(
                "โหลดคำขอที่ส่งไปแล้วไม่สำเร็จ",
                error.response?.data || error.message
            );
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
            console.log(
                "โหลดรายชื่อเพื่อนไม่สำเร็จ",
                error.response?.data || error.message
            );
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

            alert(res.data.message || "ส่งคำขอสำเร็จ");
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
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
            <Navbar />

            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
                <h2 style={{ marginBottom: "20px" }}>ค้นหาผู้ใช้</h2>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                    }}
                >
                    <input
                        type="text"
                        placeholder="พิมพ์ชื่อหรืออีเมล"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                            padding: "10px 16px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#2563eb",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        ค้นหา
                    </button>
                </div>

                {loading && <p>กำลังค้นหา...</p>}

                {!loading && users.length === 0 && (
                    <p style={{ color: "#666" }}>ยังไม่มีผลลัพธ์</p>
                )}

                <div style={{ display: "grid", gap: "12px" }}>
                    {users.map((user) => (
                        <div
                            key={user._id}
                            style={{
                                background: "#fff",
                                padding: "16px",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "12px",
                            }}
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
                                        background: "#2563eb",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        fontSize: "18px",
                                        flexShrink: 0,
                                    }}
                                >
                                    {user.profilePic ? (
                                        <img
                                            src={`http://localhost:5000/${user.profilePic}`}
                                            alt="profile"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        (user.name || user.username || "U")
                                            .charAt(0)
                                            .toUpperCase()
                                    )}
                                </div>

                                <div>
                                    <h4 style={{ margin: 0 }}>
                                        {user.name || user.username || "-"}
                                    </h4>
                                    <p style={{ margin: "6px 0 0", color: "#666" }}>
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {friendMap[user._id] ? (
                                <button
                                    disabled
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "#16a34a",
                                        color: "#fff",
                                    }}
                                >
                                    เป็นเพื่อนแล้ว
                                </button>
                            ) : sentRequests[user._id] ? (
                                <button
                                    disabled
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "#9ca3af",
                                        color: "#fff",
                                    }}
                                >
                                    ส่งคำขอแล้ว
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleAddFriend(user._id)}
                                    disabled={sendingId === user._id}
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "#2563eb",
                                        color: "#fff",
                                        cursor: "pointer",
                                    }}
                                >
                                    {sendingId === user._id ? "กำลังส่ง..." : "เพิ่มเพื่อน"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchUsers;