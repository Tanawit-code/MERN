import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getFriendsApi,
    createPrivateConversationApi,
    unfriendApi,
} from "../services/chatApi";
import { useNavigate, Link } from "react-router-dom";
import { getImageUrl } from "../config/api";
import { toast } from "react-toastify";

function FriendsList() {
    const [friends, setFriends] = useState([]);
    const [removingId, setRemovingId] = useState("");
    const [startingChatId, setStartingChatId] = useState("");
    const [loading, setLoading] = useState(true);

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchFriends();
    }, []);

    const friendCount = useMemo(() => friends.length, [friends]);

    const openConfirmModal = ({ title, message, onConfirm }) => {
        setConfirmModal({
            open: true,
            title,
            message,
            onConfirm,
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
        });
    };

    const fetchFriends = async () => {
        try {
            setLoading(true);
            const res = await getFriendsApi();
            setFriends(res.data.friends || []);
        } catch (error) {
            console.log(error.response?.data || error.message);
            toast.error("โหลดรายชื่อเพื่อนไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (friendId) => {
        try {
            setStartingChatId(friendId);
            const res = await createPrivateConversationApi(friendId);
            const conversationId = res.data.conversation._id;
            navigate(`/chat/${conversationId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "เริ่มแชทไม่สำเร็จ");
        } finally {
            setStartingChatId("");
        }
    };

    const submitUnfriend = async (friendId) => {
        try {
            setRemovingId(friendId);
            const res = await unfriendApi(friendId);

            if (res.data.success) {
                setFriends((prev) => prev.filter((friend) => friend._id !== friendId));
                closeConfirmModal();
                toast.success(res.data.message || "ลบเพื่อนสำเร็จ");
            } else {
                toast.error(res.data.message || "ลบเพื่อนไม่สำเร็จ");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "ลบเพื่อนไม่สำเร็จ");
        } finally {
            setRemovingId("");
        }
    };

    const handleUnfriend = async (friendId, friendName) => {
        openConfirmModal({
            title: "ลบเพื่อน",
            message: `ต้องการลบ ${friendName || "ผู้ใช้นี้"} ออกจากเพื่อนใช่ไหม?`,
            onConfirm: () => submitUnfriend(friendId),
        });
    };

    const renderAvatar = (friend) => {
        if (friend.profilePic) {
            return (
                <img
                    src={getImageUrl(friend.profilePic)}
                    alt={friend.name || "profile"}
                    className="h-14 w-14 rounded-full object-cover border border-slate-200 shadow-sm"
                />
            );
        }

        return (
            <div className="h-14 w-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                {friend.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
        );
    };

    return (
        <>
            <div className="min-h-screen bg-slate-100">
                <Navbar />

                <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    รายชื่อเพื่อน
                                </h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    ดูโปรไฟล์ เริ่มแชท หรือจัดการรายชื่อเพื่อนของคุณ
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                                ทั้งหมด <span className="font-bold text-slate-800">{friendCount}</span> คน
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        {loading ? (
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                    กำลังโหลดรายชื่อเพื่อน...
                                </div>
                            </div>
                        ) : friends.length === 0 ? (
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                                    <p className="text-lg font-semibold text-slate-700">
                                        ยังไม่มีเพื่อน
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        ลองไปหน้า “ค้นหาผู้ใช้” เพื่อเพิ่มเพื่อนใหม่
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {friends.map((friend) => (
                                    <div
                                        key={friend._id}
                                        className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex min-w-0 items-center gap-4">
                                                {renderAvatar(friend)}

                                                <div className="min-w-0">
                                                    <p className="truncate text-lg font-bold text-slate-800">
                                                        {friend.name || "ผู้ใช้"}
                                                    </p>
                                                    <p className="mt-1 break-all text-sm text-slate-500">
                                                        {friend.email || "-"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    to={`/profile/${friend._id}`}
                                                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    ดูโปรไฟล์
                                                </Link>

                                                <button
                                                    onClick={() => handleStartChat(friend._id)}
                                                    disabled={startingChatId === friend._id}
                                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                                                >
                                                    {startingChatId === friend._id
                                                        ? "กำลังเปิดแชท..."
                                                        : "แชท"}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleUnfriend(friend._id, friend.name)
                                                    }
                                                    disabled={removingId === friend._id}
                                                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                                                >
                                                    {removingId === friend._id
                                                        ? "กำลังลบ..."
                                                        : "ลบเพื่อน"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {confirmModal.open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                        <div className="border-b border-red-100 bg-red-50 px-6 py-4">
                            <h3 className="text-lg font-bold text-red-600">
                                {confirmModal.title}
                            </h3>
                        </div>

                        <div className="px-6 py-5">
                            <p className="leading-relaxed text-gray-700">
                                {confirmModal.message}
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 pb-6">
                            <button
                                onClick={closeConfirmModal}
                                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
                            >
                                ยกเลิก
                            </button>

                            <button
                                onClick={confirmModal.onConfirm}
                                className="rounded-xl bg-red-500 px-5 py-2.5 font-semibold text-white transition hover:bg-red-600 cursor-pointer"
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

export default FriendsList;