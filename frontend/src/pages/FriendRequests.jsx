import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    getReceivedRequestsApi,
    acceptFriendRequestApi,
    rejectFriendRequestApi,
} from "../services/chatApi";

const API_BASE = "http://localhost:5000";

const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("data:image") || path.startsWith("data:video")) return path;
    if (path.startsWith("/")) return `${API_BASE}${path}`;
    return `${API_BASE}/${path}`;
};

function FriendRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await getReceivedRequestsApi();
            setRequests(res.data.requests || []);
        } catch (error) {
            console.log(error.response?.data || error.message);
            alert(error.response?.data?.message || "โหลดคำขอเป็นเพื่อนไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (requestId) => {
        try {
            const res = await acceptFriendRequestApi(requestId);
            alert(res.data.message || "รับเพื่อนสำเร็จ");
            setRequests((prev) => prev.filter((item) => item._id !== requestId));
        } catch (error) {
            alert(error.response?.data?.message || "รับเพื่อนไม่สำเร็จ");
        }
    };

    const handleReject = async (requestId) => {
        try {
            const res = await rejectFriendRequestApi(requestId);
            alert(res.data.message || "ปฏิเสธสำเร็จ");
            setRequests((prev) => prev.filter((item) => item._id !== requestId));
        } catch (error) {
            alert(error.response?.data?.message || "ปฏิเสธไม่สำเร็จ");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
            <Navbar />

            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
                <h2 style={{ marginBottom: "20px" }}>คำขอเป็นเพื่อน</h2>

                {loading ? (
                    <p>กำลังโหลด...</p>
                ) : requests.length === 0 ? (
                    <p style={{ color: "#666" }}>ยังไม่มีคำขอ</p>
                ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                        {requests.map((item) => (
                            <div
                                key={item._id}
                                style={{
                                    background: "#fff",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
                                    <Link
                                        to={`/profile/${item.sender?._id}`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        {item.sender?.profilePic ? (
                                            <img
                                                src={getImageUrl(item.sender.profilePic)}
                                                alt={item.sender?.name || "profile"}
                                                style={{
                                                    width: "56px",
                                                    height: "56px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    border: "2px solid #e5e7eb",
                                                    display: "block",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: "56px",
                                                    height: "56px",
                                                    borderRadius: "50%",
                                                    background: "#2563eb",
                                                    color: "#fff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "bold",
                                                    fontSize: "20px",
                                                    border: "2px solid #e5e7eb",
                                                }}
                                            >
                                                {item.sender?.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                        )}
                                    </Link>

                                    <div style={{ minWidth: 0 }}>
                                        <Link
                                            to={`/profile/${item.sender?._id}`}
                                            style={{
                                                textDecoration: "none",
                                                color: "#111827",
                                            }}
                                        >
                                            <h4 style={{ margin: 0 }}>
                                                {item.sender?.name || item.sender?.username || "ไม่ทราบชื่อ"}
                                            </h4>
                                        </Link>

                                        <p style={{ margin: "6px 0 0", color: "#666" }}>
                                            {item.sender?.email || "-"}
                                        </p>

                                        <Link
                                            to={`/profile/${item.sender?._id}`}
                                            style={{
                                                display: "inline-block",
                                                marginTop: "8px",
                                                color: "#2563eb",
                                                textDecoration: "none",
                                                fontWeight: "600",
                                            }}
                                        >
                                            ดูโปรไฟล์
                                        </Link>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    <button
                                        onClick={() => handleAccept(item._id)}
                                        style={{
                                            padding: "8px 14px",
                                            borderRadius: "8px",
                                            border: "none",
                                            background: "#16a34a",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        รับเพื่อน
                                    </button>

                                    <button
                                        onClick={() => handleReject(item._id)}
                                        style={{
                                            padding: "8px 14px",
                                            borderRadius: "8px",
                                            border: "none",
                                            background: "#dc2626",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ปฏิเสธ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FriendRequests;