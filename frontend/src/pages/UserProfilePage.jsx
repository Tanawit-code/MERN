import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import ProfilePostCard from "../components/ProfilePostCard";

const API_BASE = "http://localhost:5000";

const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, isLoading, userData } = useContext(AppContext);

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [commentText, setCommentText] = useState({});
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            navigate("/login");
            return;
        }

        if (!isLoading && isLoggedIn && userId) {
            fetchProfile();
            fetchPosts();
        }
    }, [isLoading, isLoggedIn, userId]);

    const fetchProfile = async () => {
        try {
            setLoadingProfile(true);
            const res = await fetch(`${API_BASE}/api/profile/${userId}`, {
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                setProfile(data.profile);
            } else {
                alert(data.message || "โหลดโปรไฟล์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("FETCH PROFILE ERROR:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoadingPosts(true);
            const res = await fetch(`${API_BASE}/api/posts/user/${userId}`, {
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

    const handleToggleFollow = async () => {
        if (!profile?._id || followLoading) return;

        try {
            setFollowLoading(true);

            const res = await fetch(`${API_BASE}/api/profile/follow/${profile._id}`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                setProfile(data.profile);
            } else {
                alert(data.message || "ติดตามไม่สำเร็จ");
            }
        } catch (error) {
            console.error("FOLLOW ERROR:", error);
        } finally {
            setFollowLoading(false);
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
                fetchPosts();
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
                <div className="max-w-5xl mx-auto p-6">กำลังโหลดโปรไฟล์...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-5xl mx-auto p-6">ไม่พบข้อมูลโปรไฟล์</div>
            </div>
        );
    }

    const isMyProfile = profile._id === userData?._id;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="bg-white rounded-3xl shadow overflow-hidden">
                    <div className="h-52 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 relative">
                        {profile.coverPic && (
                            <img
                                src={profile.coverPic}
                                alt="cover"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    <div className="px-6 pb-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 gap-4">
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                {profile.profilePic ? (
                                    <img
                                        src={profile.profilePic}
                                        alt={profile.name}
                                        className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-500 text-white flex items-center justify-center text-4xl font-bold">
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

                            <div className="pb-2">
                                {isMyProfile ? (
                                    <Link
                                        to="/profilepage"
                                        className="inline-block bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl"
                                    >
                                        แก้ไขโปรไฟล์
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleToggleFollow}
                                        disabled={followLoading}
                                        className={`px-5 py-2.5 rounded-xl font-medium ${profile.isFollowing
                                                ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                            }`}
                                    >
                                        {followLoading
                                            ? "กำลังดำเนินการ..."
                                            : profile.isFollowing
                                                ? "Following"
                                                : "Follow"}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-800">
                                    {profile.postsCount || 0}
                                </p>
                                <p className="text-sm text-gray-500">โพสต์</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-800">
                                    {profile.followersCount || 0}
                                </p>
                                <p className="text-sm text-gray-500">ผู้ติดตาม</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-800">
                                    {profile.followingCount || 0}
                                </p>
                                <p className="text-sm text-gray-500">กำลังติดตาม</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">โพสต์ทั้งหมด</h2>

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
            </div>
        </div>
    );
};

export default UserProfilePage;