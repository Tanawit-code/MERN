import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { getMediaUrl } from "../utils/media";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { isLoggedIn, isLoading, userData, getUserData } =
        useContext(AppContext);

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [commentText, setCommentText] = useState({});
    const [openMenu, setOpenMenu] = useState(null);

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingFriendStatus, setLoadingFriendStatus] = useState(false);

    const [saving, setSaving] = useState(false);
    const [posting, setPosting] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [startingChat, setStartingChat] = useState(false);

    const [friends, setFriends] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);

    // แก้ไขโปรไฟล์
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [coverPic, setCoverPic] = useState("");

    // กล่องโพสต์ แบบเดียวกับ Home
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);

    const isMyProfile = !userId || userId === userData?._id;

    const isFriend = useMemo(
        () => friends.some((friend) => friend._id === profile?._id),
        [friends, profile]
    );

    const isRequestSent = useMemo(
        () => sentRequests.some((request) => request.receiver?._id === profile?._id),
        [sentRequests, profile]
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
                await fetchPostsByUser(profileData._id);
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
                await fetchPostsByUser(profileData._id);
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

            setFriends(friendsData.success ? friendsData.friends || [] : []);
            setSentRequests(sentData.success ? sentData.requests || [] : []);
        } catch (error) {
            console.error("FETCH FRIEND STATUS ERROR:", error);
            setFriends([]);
            setSentRequests([]);
        } finally {
            setLoadingFriendStatus(false);
        }
    };

    const handleFollow = async () => {
        if (!profile?._id || isMyProfile) return;

        try {
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

    // ========== โพสต์แบบเดียวกับ Home ==========
    const resetPostForm = () => {
        setContent("");
        setImage(null);
        setPreview(null);
        setVideo(null);
        setVideoPreview(null);
    };

    const handlePost = async () => {
        if ((!content.trim() && !image && !video) || posting || !userData?._id) {
            return;
        }

        setPosting(true);

        try {
            const res = await fetch(`${API_BASE}/api/posts/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userData._id,
                    name: userData.name || profile?.name || "",
                    profilePic: userData.profilePic || profile?.profilePic || "",
                    content,
                    image,
                    video,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "โพสต์ไม่สำเร็จ");
            }

            resetPostForm();
            await fetchPostsByUser(profile._id);

            if (isMyProfile) {
                await fetchMyProfile();
            } else {
                await fetchUserProfile(profile._id);
            }
        } catch (error) {
            console.error("POST ERROR:", error);
            alert(error.message || "โพสต์ไม่สำเร็จ");
        } finally {
            setPosting(false);
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

    const handleLike = async (postId) => {
        try {
            const res = await fetch(`${API_BASE}/api/posts/like/${postId}`, {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                await fetchPostsByUser(profile._id);
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
                setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
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
                setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
            }
        } catch (error) {
            console.error("DELETE COMMENT ERROR:", error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("รูปใหญ่เกิน 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
            setPreview(reader.result);
            setVideo(null);
            setVideoPreview(null);
        };
        reader.readAsDataURL(file);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            alert("วิดีโอใหญ่เกิน 20MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setVideo(reader.result);
            setVideoPreview(reader.result);
            setImage(null);
            setPreview(null);
        };
        reader.readAsDataURL(file);
    };

    // ========== แก้ไขโปรไฟล์ ==========
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

    const renderComment = (post, c) => {
        return (
            <div key={c._id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                        {c.profilePic ? (
                            <img
                                src={getMediaUrl(c.profilePic)}
                                alt={c.name}
                                className="w-9 h-9 rounded-full object-cover border"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-semibold">
                                {c.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                        )}

                        <div>
                            <p className="font-medium text-sm text-gray-800">{c.name}</p>
                            <p className="text-sm text-gray-700">{c.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(c.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {c.userId === userData?._id && (
                        <div className="relative">
                            <button
                                onClick={() => setOpenMenu(openMenu === c._id ? null : c._id)}
                                className="text-gray-500 hover:text-black cursor-pointer"
                            >
                                ⋯
                            </button>

                            {openMenu === c._id && (
                                <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow z-10">
                                    <button
                                        onClick={() => handleDeleteComment(post._id, c._id)}
                                        className="block px-3 py-2 text-red-500 hover:bg-gray-100 w-full text-left text-xs"
                                    >
                                        ลบ Comment
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPost = (post) => {
        const author = post.userId || {};

        return (
            <div key={post._id} className="bg-white rounded-2xl shadow p-4">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                        <Link to={`/profile/${author?._id}`}>
                            {author?.profilePic ? (
                                <img
                                    src={getMediaUrl(author.profilePic)}
                                    alt={author?.name}
                                    className="w-12 h-12 rounded-full object-cover border"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                    {author?.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                            )}
                        </Link>

                        <div>
                            <Link
                                to={`/profile/${author?._id}`}
                                className="font-semibold text-gray-800 hover:text-blue-600"
                            >
                                {author?.name}
                            </Link>
                            <p className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {(author?._id === userData?._id || post.userId === userData?._id) && (
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setOpenMenu(openMenu === post._id ? null : post._id)
                                }
                                className="text-gray-500 hover:text-black cursor-pointer"
                            >
                                ⋯
                            </button>

                            {openMenu === post._id && (
                                <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow z-10">
                                    <button
                                        onClick={() => handleDeletePost(post._id)}
                                        className="block px-3 py-2 text-red-500 hover:bg-gray-100 w-full text-left"
                                    >
                                        ลบโพสต์
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {post.content && (
                    <p className="mt-4 text-gray-800 whitespace-pre-wrap">{post.content}</p>
                )}

                {post.image && (
                    <img
                        src={post.image}
                        alt="post"
                        className="mt-4 w-full rounded-xl max-h-[500px] object-cover border"
                    />
                )}

                {post.video && (
                    <video
                        controls
                        className="mt-4 w-full rounded-xl max-h-[500px] border bg-black"
                    >
                        <source src={post.video} />
                    </video>
                )}

                <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 border-t pt-3">
                    <button
                        onClick={() => handleLike(post._id)}
                        className={`hover:text-blue-600 cursor-pointer ${post.likes?.includes(userData?._id)
                            ? "text-blue-600 font-semibold"
                            : ""
                            }`}
                    >
                        ถูกใจ {post.likes?.length || 0}
                    </button>
                    <div>ความคิดเห็น {post.comments?.length || 0}</div>
                </div>

                <div className="mt-3 flex gap-2">
                    <input
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                            setCommentText({
                                ...commentText,
                                [post._id]: e.target.value,
                            })
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleComment(post._id)}
                        className="flex-1 border rounded px-3 py-2"
                        placeholder="เขียนความคิดเห็น..."
                    />
                    <button
                        onClick={() => handleComment(post._id)}
                        className="bg-blue-500 text-white px-4 rounded"
                    >
                        ส่ง
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {(Array.isArray(post.comments) ? post.comments : [])
                        .filter((c) => c?.name && c?.text)
                        .map((c) => renderComment(post, c))}
                </div>
            </div>
        );
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
                        {coverPic ? (
                            <img
                                src={getMediaUrl(coverPic)}
                                alt="cover"
                                className="w-full h-full object-cover"
                            />
                        ) : null}
                    </div>

                    <div className="px-6 pb-6 relative">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-20 gap-4 relative z-20">
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                {(profilePic || profile?.profilePic) ? (
                                    <img
                                        src={getMediaUrl(profilePic || profile?.profilePic)}
                                        alt={profile.name}
                                        className="relative z-30 w-36 h-36 rounded-full border-4 border-white object-cover bg-white shadow-lg"
                                    />
                                ) : (
                                    <div className="relative z-30 w-36 h-36 rounded-full border-4 border-white bg-blue-500 text-white flex items-center justify-center text-4xl font-bold shadow-lg">
                                        {profile?.name?.charAt(0)?.toUpperCase() || "U"}
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
                                            className={`px-5 py-2.5 rounded-xl text-white cursor-pointer ${isFollowing
                                                ? "bg-gray-500"
                                                : "bg-blue-500 hover:bg-blue-600"
                                                }`}
                                        >
                                            {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
                                        </button>

                                        <button
                                            onClick={handleStartChat}
                                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl cursor-pointer"
                                        >
                                            {startingChat ? "กำลังเปิดแชต..." : "ส่งข้อความ"}
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
                                    {profile.followersCount || 0}
                                </p>
                                <p className="text-sm text-gray-500">followers</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-800">
                                    {profile.followingCount || 0}
                                </p>
                                <p className="text-sm text-gray-500">following</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {isMyProfile && (
                            <div className="bg-white rounded-2xl shadow p-4">
                                <div className="flex items-center gap-3">
                                    {(userData?.profilePic || profile?.profilePic) ? (
                                        <img
                                            src={getMediaUrl(
                                                userData?.profilePic || profile?.profilePic
                                            )}
                                            alt={userData?.name}
                                            className="w-12 h-12 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                            {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                    )}

                                    <input
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handlePost()}
                                        placeholder="คุณกำลังคิดอะไรอยู่..."
                                        className="w-full bg-gray-100 rounded-full px-4 py-2 outline-none"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    <label className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl cursor-pointer">
                                        เพิ่มรูป
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <label className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl cursor-pointer">
                                        เพิ่มวิดีโอ
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        onClick={handlePost}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl"
                                    >
                                        {posting ? "กำลังโพสต์..." : "โพสต์"}
                                    </button>
                                </div>

                                {preview && (
                                    <div className="mt-4">
                                        <img
                                            src={preview}
                                            alt="preview"
                                            className="w-full max-h-96 object-cover rounded-xl border"
                                        />
                                        <button
                                            onClick={() => {
                                                setImage(null);
                                                setPreview(null);
                                            }}
                                            className="text-red-500 text-sm mt-2"
                                        >
                                            ลบรูป
                                        </button>
                                    </div>
                                )}

                                {videoPreview && (
                                    <div className="mt-4">
                                        <video controls className="w-full max-h-96 rounded-xl border">
                                            <source src={videoPreview} />
                                        </video>
                                        <button
                                            onClick={() => {
                                                setVideo(null);
                                                setVideoPreview(null);
                                            }}
                                            className="text-red-500 text-sm mt-2"
                                        >
                                            ลบวิดีโอ
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                {isMyProfile ? "โพสต์ของฉัน" : `โพสต์ของ ${profile.name}`}
                            </h2>

                            {loadingPosts ? (
                                <div className="bg-white rounded-2xl shadow p-6">
                                    กำลังโหลดโพสต์...
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow p-6 text-gray-500">
                                    ยังไม่มีโพสต์
                                </div>
                            ) : (
                                <div className="space-y-6">{posts.map((post) => renderPost(post))}</div>
                            )}
                        </div>
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
                                            className="w-full cursor-pointer"
                                        />
                                        {profilePic && (
                                            <img
                                                src={getMediaUrl(profilePic)}
                                                alt="profile preview"
                                                className="mt-3 w-24 h-24 rounded-full object-cover border"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            รูปหน้าปก
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverPicChange}
                                            className="w-full cursor-pointer"
                                        />
                                        {coverPic && (
                                            <img
                                                src={getMediaUrl(coverPic)}
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