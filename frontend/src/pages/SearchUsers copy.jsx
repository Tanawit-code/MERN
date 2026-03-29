import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getImageUrl, API_BASE } from "../config/api";
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
                setSuggestedUsers(data.suggestions || []);
            } else {
                setSuggestedUsers([]);
            }
        } catch (error) {
            console.log(
                "โหลดรายชื่อแนะนำไม่สำเร็จ",
                error.response?.data || error.message || error
            );
            setSuggestedUsers([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleSearch = async () => {
        if (!keyword.trim()) {
            setUsers([]);
            return;
        }

        try {
            setLoading(true);

            await Promise.all([fetchSentRequests(), fetchFriends()]);

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

            setSuggestedUsers((prev) =>
                prev.filter((user) => user._id !== receiverId)
            );

            setUsers((prev) =>
                prev.map((user) =>
                    user._id === receiverId ? { ...user, requestSent: true } : user
                )
            );

            alert(res.data.message || "ส่งคำขอสำเร็จ");
        } catch (error) {
            const message = error.response?.data?.message || "ส่งคำขอไม่สำเร็จ";

            if (message === "ส่งคำขอไปแล้ว") {
                setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
                setSuggestedUsers((prev) =>
                    prev.filter((user) => user._id !== receiverId)
                );
            }

            if (message === "เป็นเพื่อนกันอยู่แล้ว") {
                setFriendMap((prev) => ({ ...prev, [receiverId]: true }));
                setSentRequests((prev) => {
                    const updated = { ...prev };
                    delete updated[receiverId];
                    return updated;
                });
                setSuggestedUsers((prev) =>
                    prev.filter((user) => user._id !== receiverId)
                );
            }

            alert(message);
        } finally {
            setSendingId(null);
        }
    };

    const renderAvatar = (user, compact = false) => {
        const size = compact ? "h-11 w-11" : "h-14 w-14";

        if (user.profilePic) {
            return (
                <img
                    src={getImageUrl(user.profilePic)}
                    alt="profile"
                    className={`${size} rounded-full object-cover border border-slate-200`}
                />
            );
        }

        return (
            <div
                className={`${size} rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0`}
            >
                {(user.name || user.username || "U").charAt(0).toUpperCase()}
            </div>
        );
    };

    const renderActionButton = (user, compact = false) => {
        const baseClass =
            "rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed";
        const smallClass = compact ? " px-3 py-2 text-xs" : "";

        if (friendMap[user._id]) {
            return (
                <button
                    disabled
                    className={`${baseClass}${smallClass} bg-green-600 text-white`}
                >
                    เป็นเพื่อนแล้ว
                </button>
            );
        }

        if (sentRequests[user._id]) {
            return (
                <button
                    disabled
                    className={`${baseClass}${smallClass} bg-slate-400 text-white`}
                >
                    ส่งคำขอแล้ว
                </button>
            );
        }

        return (
            <button
                onClick={() => handleAddFriend(user._id)}
                disabled={sendingId === user._id}
                className={`${baseClass}${smallClass} bg-blue-600 text-white hover:bg-blue-700`}
            >
                {sendingId === user._id ? "กำลังส่ง..." : "เพิ่มเพื่อน"}
            </button>
        );
    };

    const renderUserCard = (user, compact = false) => {
        return (
            <div
                key={user._id}
                className={`rounded-2xl border border-slate-200 bg-white ${compact ? "p-3" : "p-4"
                    }`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        {renderAvatar(user, compact)}

                        <div className="min-w-0 flex-1">
                            <h4
                                className={`truncate font-bold text-slate-800 ${compact ? "text-sm" : "text-base"
                                    }`}
                            >
                                {user.name || user.username || "-"}
                            </h4>
                            <p
                                className={`mt-1 break-all text-slate-500 ${compact ? "text-xs" : "text-sm"
                                    }`}
                            >
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className={`mt-4 flex flex-wrap items-center gap-2 ${compact ? "justify-between" : "justify-end"
                        }`}
                >
                    <Link
                        to={`/profile/${user._id}`}
                        className={`rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 ${compact
                            ? "px-3 py-2 text-xs font-semibold"
                            : "px-4 py-2 text-sm font-semibold"
                            }`}
                    >
                        ดูโปรไฟล์
                    </Link>

                    {renderActionButton(user, compact)}
                </div>
            </div>
        );
    };

    const resultCountText =
        keyword.trim() && !loading
            ? `พบ ${users.length} ผลลัพธ์สำหรับ "${keyword}"`
            : "พิมพ์ชื่อหรืออีเมลเพื่อค้นหาเพื่อนใหม่";

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 space-y-6">
                        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-5">
                                <h1 className="text-2xl font-bold text-slate-800">
                                    ค้นหาผู้ใช้
                                </h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    ค้นหาด้วยชื่อหรืออีเมล แล้วส่งคำขอเป็นเพื่อนได้ทันที
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <input
                                    type="text"
                                    placeholder="พิมพ์ชื่อหรืออีเมล"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                                />

                                <button
                                    onClick={handleSearch}
                                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                                >
                                    ค้นหา
                                </button>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        ผลการค้นหา
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {resultCountText}
                                    </p>
                                </div>
                            </div>

                            {loading && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                    กำลังค้นหา...
                                </div>
                            )}

                            {!loading && users.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                    {keyword.trim()
                                        ? "ไม่พบผู้ใช้ที่ค้นหา"
                                        : "ยังไม่มีผลลัพธ์ ให้เริ่มค้นหาจากช่องด้านบน"}
                                </div>
                            )}

                            <div className="space-y-4">
                                {users.map((user) => renderUserCard(user))}
                            </div>
                        </div>
                    </div>

                    <aside className="xl:sticky xl:top-24 xl:self-start">
                        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        คนที่แนะนำ
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        รายชื่อที่อาจเป็นเพื่อนของคุณ
                                    </p>
                                </div>

                                <button
                                    onClick={fetchSuggestedUsers}
                                    className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                                >
                                    รีเฟรช
                                </button>
                            </div>

                            {loadingSuggestions ? (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                    กำลังโหลดคำแนะนำ...
                                </div>
                            ) : suggestedUsers.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                    ยังไม่มีคำแนะนำ
                                </div>
                            ) : (
                                <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                                    {suggestedUsers.map((user) =>
                                        renderUserCard(user, true)
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default SearchUsers;