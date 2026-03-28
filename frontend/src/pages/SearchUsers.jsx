import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    searchUsersApi,
    sendFriendRequestApi,
    getSentFriendRequestsApi,
    getFriendsApi,
} from "../services/chatApi";

const API_BASE = "http://localhost:5000";

const getImageUrl = (path) => {
    if (!path) return "";

    // ถ้าเป็น full URL
    if (path.startsWith("http")) return path;

    // ถ้าเป็น base64
    if (path.startsWith("data:image") || path.startsWith("data:video")) {
        return path;
    }

    // ถ้ามี uploads อยู่แล้ว
    if (path.includes("uploads")) {
        return `${API_BASE}/${path}`;
    }

    // default
    return `${API_BASE}/uploads/${path}`;
};

function SearchUsers() {
    const [keyword, setKeyword] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [sendingId, setSendingId] = useState(null);
    const [sentRequests, setSentRequests] = useState({});
    const [friendMap, setFriendMap] = useState({});

    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        await Promise.all([
            fetchSentRequests(),
            fetchFriends(),
            fetchSuggestedUsers(),
        ]);
    };

    const fetchSentRequests = async () => {
        try {
            const res = await getSentFriendRequestsApi();
            const requests = res.data.requests || [];
            const sentMap = {};

            requests.forEach((req) => {
                if (req.receiver?._id) {
                    sentMap[req.receiver._id] = true;
                } else if (req.receiver) {
                    sentMap[req.receiver] = true;
                }
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

    const fetchSuggestedUsers = async () => {
        try {
            setLoadingSuggestions(true);

            const res = await fetch(`${API_BASE}/api/friends/suggestions`, {
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setSuggestedUsers(data.users || []);
            } else {
                setSuggestedUsers([]);
            }
        } catch (error) {
            console.log(
                "โหลดรายชื่อแนะนำไม่สำเร็จ",
                error.response?.data || error.message
            );
            setSuggestedUsers([]);
        } finally {
            setLoadingSuggestions(false);
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

            setSuggestedUsers((prev) => prev.filter((user) => user._id !== receiverId));

            alert(res.data.message || "ส่งคำขอสำเร็จ");
        } catch (error) {
            const message = error.response?.data?.message || "ส่งคำขอไม่สำเร็จ";

            if (message === "ส่งคำขอไปแล้ว") {
                setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
                setSuggestedUsers((prev) => prev.filter((user) => user._id !== receiverId));
            }

            if (message === "เป็นเพื่อนกันอยู่แล้ว") {
                setFriendMap((prev) => ({ ...prev, [receiverId]: true }));
                setSentRequests((prev) => {
                    const updated = { ...prev };
                    delete updated[receiverId];
                    return updated;
                });
                setSuggestedUsers((prev) => prev.filter((user) => user._id !== receiverId));
            }

            alert(message);
        } finally {
            setSendingId(null);
        }
    };

    const renderUserCard = (user) => (
        <div
            key={user._id}
            style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "14px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        width: "52px",
                        height: "52px",
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
                            src={getImageUrl(user.profilePic)}
                            alt="profile"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        (user.name || user.username || "U").charAt(0).toUpperCase()
                    )}
                </div>

                <div style={{ minWidth: 0 }}>
                    <h4
                        style={{
                            margin: 0,
                            fontSize: "16px",
                            color: "#111827",
                        }}
                    >
                        {user.name || user.username || "-"}
                    </h4>
                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#6b7280",
                            fontSize: "14px",
                            wordBreak: "break-word",
                        }}
                    >
                        {user.email}
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                }}
            >
                <Link
                    to={`/profile/${user._id}`}
                    style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        color: "#111827",
                        textDecoration: "none",
                        display: "inline-block",
                        fontWeight: "500",
                    }}
                >
                    ดูโปรไฟล์
                </Link>

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
                            fontWeight: "600",
                        }}
                    >
                        {sendingId === user._id ? "กำลังส่ง..." : "เพิ่มเพื่อน"}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
            <Navbar />

            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
                <div
                    style={{
                        background: "#fff",
                        borderRadius: "18px",
                        padding: "20px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        marginBottom: "24px",
                    }}
                >
                    <h2 style={{ margin: 0, marginBottom: "18px", color: "#111827" }}>
                        ค้นหาผู้ใช้
                    </h2>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
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
                                padding: "12px 14px",
                                borderRadius: "10px",
                                border: "1px solid #d1d5db",
                                width: "320px",
                                fontSize: "14px",
                                outline: "none",
                                background: "#f9fafb",
                            }}
                        />

                        <button
                            onClick={handleSearch}
                            style={{
                                padding: "12px 18px",
                                border: "none",
                                borderRadius: "10px",
                                background: "#2563eb",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            ค้นหา
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        background: "#fff",
                        borderRadius: "18px",
                        padding: "20px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        marginBottom: "24px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "16px",
                            flexWrap: "wrap",
                            gap: "8px",
                        }}
                    >
                        <h3 style={{ margin: 0, color: "#111827" }}>คนที่แนะนำ</h3>
                        <button
                            onClick={fetchSuggestedUsers}
                            style={{
                                border: "none",
                                background: "#e5e7eb",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            รีเฟรช
                        </button>
                    </div>

                    {loadingSuggestions ? (
                        <p style={{ color: "#6b7280" }}>กำลังโหลดคำแนะนำ...</p>
                    ) : suggestedUsers.length === 0 ? (
                        <p style={{ color: "#6b7280" }}>ยังไม่มีคำแนะนำ</p>
                    ) : (
                        <div style={{ display: "grid", gap: "12px" }}>
                            {suggestedUsers.slice(0, 5).map(renderUserCard)}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        background: "#fff",
                        borderRadius: "18px",
                        padding: "20px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    }}
                >
                    <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#111827" }}>
                        ผลการค้นหา
                    </h3>

                    {loading && <p style={{ color: "#6b7280" }}>กำลังค้นหา...</p>}

                    {!loading && users.length === 0 && (
                        <p style={{ color: "#6b7280" }}>ยังไม่มีผลลัพธ์</p>
                    )}

                    <div style={{ display: "grid", gap: "12px" }}>
                        {users.map(renderUserCard)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchUsers;