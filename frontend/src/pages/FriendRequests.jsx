import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getReceivedRequestsApi,
    acceptFriendRequestApi,
    rejectFriendRequestApi,
} from "../services/chatApi";

function FriendRequests() {
    const [requests, setRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            const res = await getReceivedRequestsApi();
            setRequests(res.data.requests || []);
        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (requestId) => {
        try {
            const res = await acceptFriendRequestApi(requestId);
            alert(res.data.message);
            setRequests((prev) => prev.filter((item) => item._id !== requestId));
        } catch (error) {
            alert(error.response?.data?.message || "รับเพื่อนไม่สำเร็จ");
        }
    };

    const handleReject = async (requestId) => {
        try {
            const res = await rejectFriendRequestApi(requestId);
            alert(res.data.message);
            setRequests((prev) => prev.filter((item) => item._id !== requestId));
        } catch (error) {
            alert(error.response?.data?.message || "ปฏิเสธไม่สำเร็จ");
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <div style={{ padding: "20px", paddingTop: "80px", maxWidth: "600px", margin: "0 auto" }}>
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>คำขอเป็นเพื่อน</h2>

                {requests.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#555" }}>ยังไม่มีคำขอ</p>
                ) : (
                    requests.map((item) => (
                        <div
                            key={item._id}
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
                            }}
                        >
                            <div>
                                <p style={{ margin: 0, fontWeight: "bold", fontSize: "15px" }}>
                                    {item.sender?.username}
                                </p>
                                <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                                    {item.sender?.email}
                                </p>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => handleAccept(item._id)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        border: "none",
                                        backgroundColor: "#4CAF50",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                    }}
                                >
                                    รับเพื่อน
                                </button>
                                <button
                                    onClick={() => handleReject(item._id)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        border: "none",
                                        backgroundColor: "#f44336",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                    }}
                                >
                                    ปฏิเสธ
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FriendRequests;