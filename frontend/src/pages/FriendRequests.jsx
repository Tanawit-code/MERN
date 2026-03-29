import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    getReceivedRequestsApi,
    acceptFriendRequestApi,
    rejectFriendRequestApi,
} from "../services/chatApi";
import { toast } from "react-toastify";

const API_BASE =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("data")) return path;
    if (path.startsWith("/")) return `${API_BASE}${path}`;
    return `${API_BASE}/${path}`;
};

function FriendRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState("");

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const openConfirmModal = ({ title, message, onConfirm }) => {
        setConfirmModal({ open: true, title, message, onConfirm });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ open: false });
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await getReceivedRequestsApi();
            setRequests(res.data.requests || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "โหลดคำขอไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            setActionId(requestId);
            const res = await acceptFriendRequestApi(requestId);

            setRequests((prev) =>
                prev.filter((item) => item._id !== requestId)
            );

            toast.success(res.data.message || "รับเพื่อนสำเร็จ");
        } catch (error) {
            toast.error(error.response?.data?.message || "รับเพื่อนไม่สำเร็จ");
        } finally {
            setActionId("");
        }
    };

    const submitReject = async (requestId) => {
        try {
            setActionId(requestId);

            const res = await rejectFriendRequestApi(requestId);

            setRequests((prev) =>
                prev.filter((item) => item._id !== requestId)
            );

            closeConfirmModal();
            toast.success(res.data.message || "ปฏิเสธสำเร็จ");
        } catch (error) {
            toast.error(error.response?.data?.message || "ปฏิเสธไม่สำเร็จ");
        } finally {
            setActionId("");
        }
    };

    const handleReject = (requestId, name) => {
        openConfirmModal({
            title: "ปฏิเสธคำขอ",
            message: `ต้องการปฏิเสธคำขอจาก ${name || "ผู้ใช้"} ใช่ไหม?`,
            onConfirm: () => submitReject(requestId),
        });
    };

    return (
        <>
            <div className="min-h-screen bg-slate-100">
                <Navbar />

                <div className="mx-auto max-w-5xl px-4 py-6">
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h1 className="text-2xl font-bold text-slate-800">
                            คำขอเป็นเพื่อน
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            จัดการคำขอที่มีคนส่งมาให้คุณ
                        </p>
                    </div>

                    <div className="mt-6">
                        {loading ? (
                            <div className="bg-white p-6 rounded-3xl shadow text-center">
                                กำลังโหลด...
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="bg-white p-10 rounded-3xl shadow text-center text-gray-500">
                                ยังไม่มีคำขอ
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Link to={`/profile/${item.sender?._id}`}>
                                                {item.sender?.profilePic ? (
                                                    <img
                                                        src={getImageUrl(
                                                            item.sender.profilePic
                                                        )}
                                                        className="w-14 h-14 rounded-full object-cover border"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                                                        {item.sender?.name?.charAt(0)?.toUpperCase() ||
                                                            "U"}
                                                    </div>
                                                )}
                                            </Link>

                                            <div>
                                                <Link
                                                    to={`/profile/${item.sender?._id}`}
                                                    className="font-bold text-slate-800 hover:text-blue-600"
                                                >
                                                    {item.sender?.name || "ไม่ทราบชื่อ"}
                                                </Link>
                                                <p className="text-sm text-gray-500">
                                                    {item.sender?.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(item._id)}
                                                disabled={actionId === item._id}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl cursor-pointer"
                                            >
                                                {actionId === item._id
                                                    ? "กำลังรับ..."
                                                    : "รับเพื่อน"}
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleReject(
                                                        item._id,
                                                        item.sender?.name
                                                    )
                                                }
                                                disabled={actionId === item._id}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl cursor-pointer"
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
            </div>

            {/* MODAL */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-red-600 mb-3">
                            {confirmModal.title}
                        </h3>

                        <p className="text-gray-700 mb-5">
                            {confirmModal.message}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeConfirmModal}
                                className="px-4 py-2 border rounded-xl"
                            >
                                ยกเลิก
                            </button>

                            <button
                                onClick={confirmModal.onConfirm}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl cursor-pointer"
                            >
                                ตกลง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default FriendRequests;