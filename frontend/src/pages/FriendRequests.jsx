import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getReceivedRequestsApi,
    acceptFriendRequestApi,
    rejectFriendRequestApi,
} from "../services/chatApi";

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
                                }}
                            >
                                <div>
                                    <h4 style={{ margin: 0 }}>
                                        {item.sender?.name || item.sender?.username || "ไม่ทราบชื่อ"}
                                    </h4>
                                    <p style={{ margin: "6px 0 0", color: "#666" }}>
                                        {item.sender?.email || "-"}
                                    </p>
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
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