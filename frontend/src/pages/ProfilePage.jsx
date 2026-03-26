import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import ProfilePostCard from "../components/ProfilePostCard";

const API_BASE = "http://localhost:5000";

const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (path.startsWith("/uploads")) {
        return `${API_BASE}${path}`;
    }

    return `${API_BASE}/uploads/${path}`;
};

const ProfilePage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { isLoggedIn, isLoading, userData, getUserData } = useContext(AppContext);

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [commentText, setCommentText] = useState({});
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [startingChat, setStartingChat] = useState(false);
    const [friends, setFriends] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loadingFriendStatus, setLoadingFriendStatus] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [coverPic, setCoverPic] = useState("");

    const isMyProfile = !userId || userId === userData?._id;

    const isFriend = friends.some((friend) => friend._id === profile?._id);

    const isRequestSent = sentRequests.some(
        (request) => request.receiver?._id === profile?._id
    );

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            navigate("/login");
            return;
        }

        if (!isLoading && isLoggedIn) {
            if (userId) {
                fetchUserProfile(userId);
                fetchFriendStatus();
            } else {
                fetchMyProfile();
            }
        }
    }, [isLoading, isLoggedIn, userId]);

    const fillProfileForm = (profileData) => {
        setProfile(profileData);
        setName(profileData?.name || "");
        setBio(profileData?.bio || "");
        setProfilePic(profileData?.profilePic || "");
        setCoverPic(profileData?.coverPic || "");
    };

    const fetchMyProfile = async () => {
        try {
            setLoadingProfile(true);

            const res = await fetch(`${API_BASE}/api/profile/me`, {
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                const profileData = data.profile || data.user;
                fillProfileForm(profileData);
                fetchPostsByUser(profileData._id);
            } else {
                alert(data.message || "โหลดโปรไฟล์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("FETCH MY PROFILE ERROR:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchUserProfile = async (id) => {
        try {
            setLoadingProfile(true);

            const res = await fetch(`${API_BASE}/api/profile/${id}`, {
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                const profileData = data.profile || data.user;

                fillProfileForm(profileData);
                setIsFollowing(profileData.isFollowing || false);

                fetchPostsByUser(profileData._id);
            } else {
                alert(data.message || "โหลดโปรไฟล์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("FETCH USER PROFILE ERROR:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchPostsByUser = async (id) => {
        try {
            setLoadingPosts(true);

            const res = await fetch(`${API_BASE}/api/posts/user/${id}`, {
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                setPosts(data.posts || []);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error("FETCH USER POSTS ERROR:", error);
            setPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchFriendStatus = async () => {
        if (!isLoggedIn || !userId) return;

        try {
            setLoadingFriendStatus(true);

            const [friendsRes, sentRes] = await Promise.all([
                fetch(`${API_BASE}/api/friends`, {
                    credentials: "include",
                }),
                fetch(`${API_BASE}/api/friends/requests/sent`, {
                    credentials: "include",
                }),
            ]);

            const friendsData = await friendsRes.json();
            const sentData = await sentRes.json();

            if (friendsData.success) {
                setFriends(friendsData.friends || []);
            } else {
                setFriends([]);
            }

            if (sentData.success) {
                setSentRequests(sentData.requests || []);
            } else {
                setSentRequests([]);
            }
        } catch (error) {
            console.error("FETCH FRIEND STATUS ERROR:", error);
            setFriends([]);
            setSentRequests([]);
        } finally {
            setLoadingFriendStatus(false);
        }
    };

    const handleFollow = async () => {
        try {
            // ถ้าตอนนี้เป็นเพื่อนกันอยู่ แล้วอยากให้เลิกติดตาม = เลิกเป็นเพื่อนด้วย
            if (isFriend) {
                const res = await fetch(`${API_BASE}/api/friends/unfriend`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        friendId: profile._id,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "ลบเพื่อนไม่สำเร็จ");
                }

                setIsFollowing(false);
                await fetchUserProfile(profile._id);
                await fetchFriendStatus();
                return;
            }

            // ถ้ายังไม่เป็นเพื่อน ใช้ระบบติดตามปกติ
            const res = await fetch(`${API_BASE}/api/profile/follow/${profile._id}`, {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setIsFollowing(data.isFollowing);
                await fetchUserProfile(profile._id);
            } else {
                alert(data.message || "ติดตามไม่สำเร็จ");
            }
        } catch (err) {
            console.error("FOLLOW ERROR:", err);
            alert(err.message || "เกิดข้อผิดพลาด");
        }
    };

    const fileToBase64 = (file, callback) => {
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result);
        reader.readAsDataURL(file);
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        fileToBase64(file, setProfilePic);
    };

    const handleCoverPicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        fileToBase64(file, setCoverPic);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const res = await fetch(`${API_BASE}/api/auth/update-profile`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    bio,
                    profilePic,
                    coverPic,
                }),
            });

            const data = await res.json();

            if (data.success) {
                await getUserData?.();
                await fetchMyProfile();
                alert("บันทึกโปรไฟล์สำเร็จ");
            } else {
                alert(data.message || "อัปเดตโปรไฟล์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("UPDATE PROFILE ERROR:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleSendFriendRequest = async () => {
        if (!profile?._id || isMyProfile || isFriend || isRequestSent) return;

        try {
            setSendingRequest(true);

            const res = await fetch(`${API_BASE}/api/friends/request`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    receiverId: profile._id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "ส่งคำขอเป็นเพื่อนไม่สำเร็จ");
            }

            await fetchFriendStatus();
            alert(data.message || "ส่งคำขอเป็นเพื่อนสำเร็จ");
        } catch (error) {
            console.error("SEND FRIEND REQUEST ERROR:", error);
            alert(error.message);
        } finally {
            setSendingRequest(false);
        }
    };

    const handleStartChat = async () => {
        if (!profile?._id || isMyProfile) return;

        try {
            setStartingChat(true);

            const res = await fetch(`${API_BASE}/api/chat/conversation/private`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    friendId: profile._id,
                }),
            });

            const data = await res.json();

            if (data.success && data.conversation?._id) {
                navigate(`/chat/${data.conversation._id}`);
            } else {
                alert(data.message || "ไม่สามารถเริ่มแชตได้");
            }
        } catch (error) {
            console.error("START CHAT ERROR:", error);
            alert("ไม่สามารถเริ่มแชตได้");
        } finally {
            setStartingChat(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await fetch(`${API_BASE}/api/posts/like/${postId}`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                fetchPostsByUser(profile._id);
            }
        } catch (error) {
            console.error("LIKE ERROR:", error);
        }
    };

    const handleComment = async (postId) => {
        const text = commentText[postId];
        if (!text || !text.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/api/posts/comment/${postId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            const data = await res.json();

            if (data.success) {
                setCommentText((prev) => ({ ...prev, [postId]: "" }));
                setPosts((prev) =>
                    prev.map((p) => (p._id === postId ? data.post : p))
                );
            }
        } catch (error) {
            console.error("COMMENT ERROR:", error);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            const res = await fetch(
                `${API_BASE}/api/posts/comment/${postId}/${commentId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (data.success) {
                setPosts((prev) =>
                    prev.map((p) => (p._id === postId ? data.post : p))
                );
            }
        } catch (error) {
            console.error("DELETE COMMENT ERROR:", error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) => prev.filter((p) => p._id !== postId));
            } else {
                alert(data.message || "ลบโพสต์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("DELETE POST ERROR:", error);
        }
    };

    if (isLoading || loadingProfile) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-6xl mx-auto p-6">กำลังโหลดโปรไฟล์...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-6xl mx-auto p-6">ไม่พบข้อมูลโปรไฟล์</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <div className="bg-white rounded-3xl shadow overflow-hidden">
                    <div className="h-56 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 relative">
                        {profile.coverPic && (
                            <img
                                src={`http://localhost:5000/${profile.coverPic}`}
                                alt="cover"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    <div className="px-6 pb-6 relative">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-20 gap-4 relative z-20">
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                {profile.profilePic ? (
                                    <img
                                        src={`http://localhost:5000/${profile.profilePic}`}
                                        alt={profile.name}
                                        className="relative z-30 w-36 h-36 rounded-full border-4 border-white object-cover bg-white shadow-lg"
                                    />
                                ) : (
                                    <div className="relative z-30 w-36 h-36 rounded-full border-4 border-white bg-blue-500 text-white flex items-center justify-center text-4xl font-bold shadow-lg">
                                        {profile.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                )}

                                <div className="pb-2">
                                    <h1 className="text-3xl font-bold text-gray-800">
                                        {profile.name}
                                    </h1>
                                    <p className="text-gray-500">{profile.email}</p>
                                    {profile.bio && (
                                        <p className="mt-2 text-gray-700 max-w-2xl">{profile.bio}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pb-2 flex flex-wrap gap-3">
                                {isMyProfile ? (
                                    <Link
                                        to="/profilepage"
                                        className="inline-block bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl"
                                    >
                                        หน้าโปรไฟล์ของฉัน
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleFollow}
                                            className={`px-5 py-2.5 rounded-xl text-white ${isFollowing ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                                                }`}
                                        >
                                            {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
                                        </button>

                                        <button
                                            onClick={handleStartChat}
                                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl"
                                        >
                                            ส่งข้อความ
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-800">
                                    {profile.postsCount ?? posts.length ?? 0}
                                </p>
                                <p className="text-sm text-gray-500">posts</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-800">
                                    <p>{profile.followersCount || 0}</p>
                                </p>
                                <p className="text-sm text-gray-500">followers</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-800">
                                    <p>{profile.followingCount || 0}</p>
                                </p>
                                <p className="text-sm text-gray-500">following</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {isMyProfile ? "โพสต์ของฉัน" : `โพสต์ของ ${profile.name}`}
                        </h2>

                        {loadingPosts ? (
                            <div className="bg-white rounded-2xl shadow p-6">กำลังโหลดโพสต์...</div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow p-6 text-gray-500">
                                ยังไม่มีโพสต์
                            </div>
                        ) : (
                            posts.map((post) => (
                                <ProfilePostCard
                                    key={post._id}
                                    post={post}
                                    userData={userData}
                                    commentText={commentText}
                                    setCommentText={setCommentText}
                                    handleLike={handleLike}
                                    handleComment={handleComment}
                                    handleDeleteComment={handleDeleteComment}
                                    handleDeletePost={handleDeletePost}
                                />
                            ))
                        )}
                    </div>

                    <div>
                        {isMyProfile ? (
                            <div className="bg-white rounded-3xl shadow p-5 sticky top-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    แก้ไขโปรไฟล์
                                </h2>

                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ชื่อ
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="ชื่อของคุณ"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bio
                                        </label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows="4"
                                            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="แนะนำตัวสั้น ๆ"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            รูปโปรไฟล์
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePicChange}
                                            className="w-full"
                                        />
                                        {profilePic && (
                                            <img
                                                src={`http://localhost:5000/${profilePic}`}
                                                alt="profile preview"
                                                className="mt-3 w-24 h-24 rounded-full object-cover border"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            รูปปก
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverPicChange}
                                            className="w-full"
                                        />
                                        {coverPic && (
                                            <img
                                                src={`http://localhost:5000/${coverPic}`}
                                                alt="cover preview"
                                                className="mt-3 w-full h-32 rounded-xl object-cover border"
                                            />
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium"
                                    >
                                        {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow p-5 sticky top-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    ข้อมูลเพิ่มเติม
                                </h2>

                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="font-semibold text-gray-800">ชื่อ</p>
                                        <p>{profile.name || "-"}</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="font-semibold text-gray-800">อีเมล</p>
                                        <p>{profile.email || "-"}</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="font-semibold text-gray-800">Bio</p>
                                        <p>{profile.bio || "ยังไม่มีข้อมูล"}</p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-3">
                                    {loadingFriendStatus ? (
                                        <button
                                            disabled
                                            className="w-full bg-gray-300 text-gray-700 py-2.5 rounded-xl"
                                        >
                                            กำลังตรวจสอบ...
                                        </button>
                                    ) : isFriend ? (
                                        <button
                                            disabled
                                            className="w-full bg-green-500 text-white py-2.5 rounded-xl cursor-default"
                                        >
                                            เป็นเพื่อนกันแล้ว
                                        </button>
                                    ) : isRequestSent ? (
                                        <button
                                            disabled
                                            className="w-full bg-yellow-500 text-white py-2.5 rounded-xl cursor-default"
                                        >
                                            ส่งคำขอแล้ว
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSendFriendRequest}
                                            disabled={sendingRequest}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl"
                                        >
                                            {sendingRequest ? "กำลังส่งคำขอ..." : "เพิ่มเพื่อน"}
                                        </button>
                                    )}

                                    <button
                                        onClick={handleStartChat}
                                        disabled={startingChat}
                                        className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl"
                                    >
                                        {startingChat ? "กำลังเปิดแชต..." : "ส่งข้อความ"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;