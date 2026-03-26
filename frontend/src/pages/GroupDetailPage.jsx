import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import {
    getGroupById,
    joinGroup,
    leaveGroup,
    getGroupPosts,
    deleteGroup,
} from "../services/groupApi";

const GroupDetailPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { userData, isLoggedIn, isLoading } = useContext(AppContext);

    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);

    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);

    const [loadingPost, setLoadingPost] = useState(false);
    const [commentInputs, setCommentInputs] = useState({});

    const apiBase = "http://localhost:5000";

    const getImageUrl = (path) => {
        if (!path) return "";

        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        if (path.startsWith("data:image") || path.startsWith("data:video")) return path;
        if (path.startsWith("/uploads")) return `${apiBase}${path}`;

        return `${apiBase}/uploads/${path}`;
    };

    const getPostAuthor = (post) => {
        const userObj =
            typeof post.userId === "object" && post.userId !== null
                ? post.userId
                : post.user || post.author || null;

        return {
            id: userObj?._id || userObj?.id || post.userId || "",
            name:
                userObj?.name ||
                userObj?.fullname ||
                post.name ||
                post.fullname ||
                "Unknown User",
            profilePic:
                userObj?.profilePic ||
                userObj?.avatar ||
                post.profilePic ||
                "",
        };
    };

    const getCommentAuthor = (comment) => {
        return {
            id:
                comment.userId?._id ||
                comment.userId?.id ||
                comment.userId ||
                "",
            name:
                comment.userId?.name ||
                comment.userId?.fullname ||
                comment.name ||
                comment.fullname ||
                "Unknown User",
            profilePic:
                comment.userId?.profilePic ||
                comment.profilePic ||
                "",
        };
    };

    const fetchGroup = async () => {
        try {
            const data = await getGroupById(groupId);
            if (data.success) {
                setGroup(data.group);
            }
        } catch (err) {
            console.error("โหลด group ไม่สำเร็จ:", err);
        }
    };

    const fetchPosts = async () => {
        try {
            const data = await getGroupPosts(groupId);
            if (data.success) {
                setPosts(data.posts || []);
            }
        } catch (err) {
            console.error("โหลด post group ไม่สำเร็จ:", err);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchGroup();
            fetchPosts();
        }
    }, [groupId]);

    const ownerId = useMemo(() => {
        return group?.owner?._id || group?.owner?.id || group?.owner || "";
    }, [group]);

    const isGroupOwner = useMemo(() => {
        return ownerId === userData?._id;
    }, [ownerId, userData]);

    const isMember = useMemo(() => {
        return group?.members?.some((member) => {
            const memberId = member?._id || member?.id || member;
            return memberId === userData?._id;
        });
    }, [group, userData]);

    const resetPostForm = () => {
        setContent("");
        setImage(null);
        setPreview(null);
        setVideo(null);
        setVideoPreview(null);
    };

    const handleJoin = async () => {
        try {
            const data = await joinGroup(groupId);
            if (data.success) {
                fetchGroup();
            } else {
                alert(data.message || "เข้าร่วมกลุ่มไม่สำเร็จ");
            }
        } catch (err) {
            console.error("JOIN GROUP ERROR:", err);
        }
    };

    const handleLeave = async () => {
        try {
            const data = await leaveGroup(groupId);
            if (data.success) {
                fetchGroup();
                fetchPosts();
            } else {
                alert(data.message || "ออกจากกลุ่มไม่สำเร็จ");
            }
        } catch (err) {
            console.error("LEAVE GROUP ERROR:", err);
        }
    };

    const handleDeleteGroup = async () => {
        const ok = window.confirm("ต้องการลบกลุ่มนี้ใช่ไหม? การลบจะไม่สามารถกู้คืนได้");
        if (!ok) return;

        try {
            const data = await deleteGroup(groupId);
            if (data.success) {
                alert("ลบกลุ่มสำเร็จ");
                navigate("/groups");
            } else {
                alert(data.message || "ลบกลุ่มไม่สำเร็จ");
            }
        } catch (error) {
            console.error("DELETE GROUP ERROR:", error);
            alert(error.message || "เกิดข้อผิดพลาด");
        }
    };

    const handleCreatePost = async () => {
        if ((!content.trim() && !image && !video) || loadingPost) return;

        setLoadingPost(true);

        try {
            const res = await fetch(`${apiBase}/api/posts/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    content,
                    image,
                    video,
                    groupId,
                }),
            });

            const data = await res.json();

            if (data.success) {
                resetPostForm();
                fetchPosts();
            } else {
                alert(data.message || "โพสต์ไม่สำเร็จ");
            }
        } catch (err) {
            console.error("CREATE GROUP POST ERROR:", err);
        } finally {
            setLoadingPost(false);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const res = await fetch(`${apiBase}/api/posts/${postId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) => prev.filter((post) => post._id !== postId));
                setOpenMenu(null);
            } else {
                alert(data.message || "ลบโพสต์ไม่สำเร็จ");
            }
        } catch (err) {
            console.error("DELETE GROUP POST ERROR:", err);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            const res = await fetch(
                `${apiBase}/api/posts/comment/${postId}/${commentId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (data.success) {
                setPosts((prev) =>
                    prev.map((post) => (post._id === postId ? data.post : post))
                );
                setOpenMenu(null);
            } else {
                alert(data.message || "ลบคอมเมนต์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("DELETE COMMENT ERROR:", error);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const res = await fetch(`${apiBase}/api/posts/like/${postId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) =>
                    prev.map((post) => (post._id === postId ? data.post : post))
                );
            } else {
                alert(data.message || "ไลก์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("LIKE ERROR:", error);
        }
    };

    const handleAddComment = async (postId) => {
        const text = commentInputs[postId];
        if (!text || !text.trim()) return;

        try {
            const res = await fetch(`${apiBase}/api/posts/comment/${postId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) =>
                    prev.map((post) => (post._id === postId ? data.post : post))
                );

                setCommentInputs((prev) => ({
                    ...prev,
                    [postId]: "",
                }));
            } else {
                alert(data.message || "คอมเมนต์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("COMMENT ERROR:", error);
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
        };
        reader.readAsDataURL(file);
    };

    const renderProfileImage = (user, fallback = "U") => {
        if (user?.profilePic) {
            return (
                <img
                    src={getImageUrl(user.profilePic)}
                    alt="profile"
                    className="w-full h-full object-cover"
                />
            );
        }

        return user?.name?.charAt(0).toUpperCase() || fallback;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg font-semibold animate-pulse">กำลังโหลด...</p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 py-16">
                    <div className="bg-white rounded-2xl shadow p-8 text-center">
                        <h1 className="text-3xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
                        <p className="text-gray-600 mb-6">
                            ต้องเข้าสู่ระบบก่อนจึงจะใช้งานกลุ่มได้
                        </p>
                        <Link
                            to="/login"
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                        >
                            ไปหน้า Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="pt-20 text-center">กำลังโหลดข้อมูลกลุ่ม...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />

            <div className="max-w-7xl mx-auto pt-20 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="hidden md:block lg:col-span-1">
                        <div className="bg-white p-4 rounded-2xl shadow">
                            <p className="font-semibold">เมนู</p>

                            <div className="mt-2 space-y-2 flex flex-col">
                                <Link
                                    to="/groups"
                                    className="hover:bg-gray-100 p-2 rounded cursor-pointer"
                                >
                                    👥 กลุ่มทั้งหมด
                                </Link>
                                <Link
                                    to="/"
                                    className="hover:bg-gray-100 p-2 rounded cursor-pointer"
                                >
                                    🏠 กลับหน้า Home
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow overflow-hidden mb-4">
                            <div className="relative h-56 bg-gray-200">
                                {group.groupImage ? (
                                    <>
                                        <img
                                            src={preview}
                                            alt="preview"
                                            className="rounded-xl max-h-60 object-cover border"
                                        />
                                        <div className="absolute inset-0 bg-black/25" />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                                )}

                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                        <div className="text-white">
                                            <h1 className="text-3xl md:text-4xl font-bold drop-shadow">
                                                {group.name}
                                            </h1>

                                            <p className="text-white/90 mt-1 drop-shadow max-w-2xl">
                                                {group.description || "ยังไม่มีรายละเอียดกลุ่ม"}
                                            </p>

                                            <p className="text-sm text-white/80 mt-2 drop-shadow">
                                                สมาชิก {group.members?.length || 0} คน
                                            </p>
                                        </div>

                                        {isGroupOwner && (
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/groups/edit/${group._id}`}
                                                    className="backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2.5 rounded-xl font-medium transition shadow-lg"
                                                >
                                                    ✏️ แก้ไขกลุ่ม
                                                </Link>

                                                <button
                                                    onClick={handleDeleteGroup}
                                                    className="backdrop-blur-md bg-red-500/80 hover:bg-red-600 text-white border border-white/20 px-4 py-2.5 rounded-xl font-medium transition shadow-lg cursor-pointer"
                                                >
                                                    🗑 ลบกลุ่ม
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm text-gray-500">
                                    เจ้าของกลุ่ม:{" "}
                                    <span className="font-medium text-gray-800">
                                        {group.owner?.name || "-"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {isMember ? (
                                        !isGroupOwner && (
                                            <button
                                                onClick={handleLeave}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointer"
                                            >
                                                ออกจากกลุ่ม
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={handleJoin}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
                                        >
                                            เข้าร่วมกลุ่ม
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isMember && (
                            <div className="bg-white p-4 rounded-2xl shadow mb-4">
                                <div className="flex gap-3 items-center">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold">
                                        {renderProfileImage(userData, "U")}
                                    </div>

                                    <input
                                        type="text"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreatePost()}
                                        placeholder="โพสต์อะไรในกลุ่มนี้..."
                                        className="w-full bg-gray-100 rounded-full px-4 py-2 outline-none"
                                    />
                                </div>

                                <div className="mt-3 flex items-center gap-3 flex-wrap">
                                    <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
                                        📷 เพิ่มรูป
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>

                                    <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
                                        🎥 เพิ่มวิดีโอ
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={handleVideoChange}
                                        />
                                    </label>

                                    <button
                                        onClick={handleCreatePost}
                                        disabled={loadingPost}
                                        className="bg-blue-800 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                                    >
                                        {loadingPost ? "กำลังโพสต์..." : "โพสต์"}
                                    </button>
                                </div>

                                {preview && (
                                    <div className="mt-3">
                                        <img
                                            src={`http://localhost:5000${group.groupImage}`}
                                            alt="preview"
                                            className="rounded-xl max-h-60 object-cover border"
                                        />
                                        <button
                                            onClick={() => {
                                                setImage(null);
                                                setPreview(null);
                                            }}
                                            className="text-red-500 text-xs mt-2 cursor-pointer"
                                        >
                                            ลบรูป
                                        </button>
                                    </div>
                                )}

                                {videoPreview && (
                                    <div className="mt-3">
                                        <video
                                            src={videoPreview}
                                            controls
                                            className="rounded-xl max-h-60 object-cover border"
                                        />
                                        <button
                                            onClick={() => {
                                                setVideo(null);
                                                setVideoPreview(null);
                                            }}
                                            className="text-red-500 text-xs mt-2 cursor-pointer"
                                        >
                                            ลบวิดีโอ
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isMember && (
                            <div className="bg-white p-4 rounded-2xl shadow mb-4 text-gray-600">
                                เข้าร่วมกลุ่มก่อน จึงจะสามารถโพสต์ในกลุ่มได้
                            </div>
                        )}

                        {posts.map((post) => {
                            const author = getPostAuthor(post);

                            const isLiked = post.likes?.some(
                                (id) =>
                                    id === userData?._id ||
                                    id?._id === userData?._id ||
                                    id?.toString?.() === userData?._id
                            );

                            const isOwner =
                                author.id === userData?._id ||
                                post.userId === userData?._id;

                            return (
                                <div
                                    key={post._id}
                                    className="bg-white p-4 rounded-2xl shadow mb-4"
                                >
                                    <div className="relative">
                                        {isOwner && (
                                            <div className="absolute top-0 right-0">
                                                <button
                                                    onClick={() =>
                                                        setOpenMenu(openMenu === post._id ? null : post._id)
                                                    }
                                                    className="text-gray-500 hover:text-black cursor-pointer"
                                                >
                                                    ⋯
                                                </button>

                                                {openMenu === post._id && (
                                                    <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10">
                                                        <button
                                                            onClick={() => handleDeletePost(post._id)}
                                                            className="block px-3 py-1 text-red-500 hover:bg-gray-100 w-full text-left cursor-pointer"
                                                        >
                                                            ลบโพสต์
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold">
                                            <Link
                                                to={`/profile/${author.id}`}
                                                className="flex items-center gap-3 mb-2 hover:opacity-80"
                                            >
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold">
                                                    {author.profilePic ? (
                                                        <img
                                                            src={getImageUrl(author.profilePic)}
                                                            alt={author.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        author.name?.charAt(0).toUpperCase() || "U"
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-semibold">{author.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(post.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>

                                        <div>
                                            <p className="font-semibold">{author.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(post.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {post.content && (
                                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                                            {post.content}
                                        </p>
                                    )}

                                    {post.image && (
                                        <img
                                            src={getImageUrl(post.image)}
                                            alt="post"
                                            className="rounded-xl max-h-100 object-cover border"
                                        />
                                    )}

                                    {post.video && (
                                        <video
                                            src={post.video}
                                            controls
                                            className="rounded-xl max-h-100 object-cover border"
                                        />
                                    )}

                                    <div className="mt-3 border-t pt-3">
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                            <button
                                                onClick={() => handleLikePost(post._id)}
                                                className={`hover:text-blue-600 cursor-pointer ${isLiked ? "text-blue-600 font-semibold" : ""
                                                    }`}
                                            >
                                                👍 ถูกใจ {post.likes?.length || 0}
                                            </button>

                                            <span>💬 ความคิดเห็น {post.comments?.length || 0}</span>
                                        </div>

                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={commentInputs[post._id] || ""}
                                                onChange={(e) =>
                                                    setCommentInputs((prev) => ({
                                                        ...prev,
                                                        [post._id]: e.target.value,
                                                    }))
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" && handleAddComment(post._id)
                                                }
                                                placeholder="เขียนความคิดเห็น..."
                                                className="flex-1 border rounded px-3 py-1"
                                            />
                                            <button
                                                onClick={() => handleAddComment(post._id)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-full cursor-pointer"
                                            >
                                                ส่ง
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {post.comments?.map((comment) => {
                                                const commentAuthor = getCommentAuthor(comment);

                                                const isCommentOwner =
                                                    commentAuthor.id === userData?._id ||
                                                    comment.userId === userData?._id;

                                                return (
                                                    <div
                                                        key={comment._id}
                                                        className="flex gap-2 items-start relative"
                                                    >
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                                                            {commentAuthor.profilePic ? (
                                                                <img
                                                                    src={getImageUrl(commentAuthor.profilePic)}
                                                                    alt={commentAuthor.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                commentAuthor.name?.charAt(0).toUpperCase() || "U"
                                                            )}
                                                        </div>

                                                        <div className="bg-gray-100 rounded-xl px-3 py-2 relative flex-1">
                                                            {isCommentOwner && (
                                                                <div className="absolute top-2 right-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            setOpenMenu(
                                                                                openMenu === comment._id
                                                                                    ? null
                                                                                    : comment._id
                                                                            )
                                                                        }
                                                                        className="text-gray-500 hover:text-black cursor-pointer"
                                                                    >
                                                                        ⋯
                                                                    </button>

                                                                    {openMenu === comment._id && (
                                                                        <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDeleteComment(
                                                                                        post._id,
                                                                                        comment._id
                                                                                    )
                                                                                }
                                                                                className="block px-3 py-1 text-red-500 hover:bg-gray-100 w-full text-left text-xs cursor-pointer"
                                                                            >
                                                                                ลบ Comment
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <p className="font-semibold text-sm">
                                                                {commentAuthor.name}
                                                            </p>
                                                            <p className="text-sm text-gray-700">
                                                                {comment.text}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {comment.createdAt
                                                                    ? new Date(comment.createdAt).toLocaleString()
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden lg:block lg:col-span-1">
                        <div className="bg-white p-4 rounded-2xl shadow">
                            <p className="font-semibold mb-2">ข้อมูลกลุ่ม</p>
                            <p className="text-sm text-gray-600">ชื่อกลุ่ม: {group.name}</p>
                            <p className="text-sm text-gray-600">
                                สมาชิก: {group.members?.length || 0} คน
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                เจ้าของ: {group.owner?.name || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;