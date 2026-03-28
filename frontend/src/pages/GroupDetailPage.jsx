import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

const API_BASE = "http://localhost:5000";

const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (path.startsWith("data:image") || path.startsWith("data:video")) {
        return path;
    }

    if (path.startsWith("/")) {
        return `${API_BASE}${path}`;
    }

    return `${API_BASE}/${path}`;
};

const GroupDetailPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { userData } = useContext(AppContext);

    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);

    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [video, setVideo] = useState("");
    const [preview, setPreview] = useState("");
    const [videoPreview, setVideoPreview] = useState("");

    const [commentInputs, setCommentInputs] = useState({});
    const [openMenu, setOpenMenu] = useState(null);

    const isOwner = useMemo(() => {
        if (!group || !userData?._id) return false;
        const ownerId =
            typeof group.owner === "object" ? group.owner?._id : group.owner;
        return ownerId === userData._id;
    }, [group, userData]);

    const isMember = useMemo(() => {
        if (!group || !userData?._id) return false;
        const members = Array.isArray(group.members) ? group.members : [];
        return members.some((member) => {
            const memberId = typeof member === "object" ? member?._id : member;
            return memberId === userData._id;
        });
    }, [group, userData]);

    useEffect(() => {
        if (groupId) {
            fetchGroupDetail();
            fetchGroupPosts();
        }
    }, [groupId]);

    const fetchGroupDetail = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/groups/${groupId}`, {
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                setGroup(data.group);
            } else {
                alert(data.message || "โหลดข้อมูลกลุ่มไม่สำเร็จ");
            }
        } catch (error) {
            console.error("FETCH GROUP DETAIL ERROR:", error);
            alert("เกิดข้อผิดพลาดในการโหลดข้อมูลกลุ่ม");
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupPosts = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/groups/${groupId}/posts`, {
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                setPosts(data.posts || []);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error("FETCH GROUP POSTS ERROR:", error);
            setPosts([]);
        }
    };

    const handleJoinGroup = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/groups/${groupId}/join`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "เข้าร่วมกลุ่มไม่สำเร็จ");
            }

            alert(data.message || "เข้าร่วมกลุ่มสำเร็จ");
            fetchGroupDetail();
        } catch (error) {
            console.error("JOIN GROUP ERROR:", error);
            alert(error.message || "เข้าร่วมกลุ่มไม่สำเร็จ");
        }
    };

    const handleLeaveGroup = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/groups/${groupId}/leave`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "ออกจากกลุ่มไม่สำเร็จ");
            }

            alert(data.message || "ออกจากกลุ่มสำเร็จ");
            fetchGroupDetail();
        } catch (error) {
            console.error("LEAVE GROUP ERROR:", error);
            alert(error.message || "ออกจากกลุ่มไม่สำเร็จ");
        }
    };

    const handleDeleteGroup = async () => {
        const confirmed = window.confirm("ต้องการลบกลุ่มนี้ใช่หรือไม่?");
        if (!confirmed) return;

        try {
            const res = await fetch(`${API_BASE}/api/groups/${groupId}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "ลบกลุ่มไม่สำเร็จ");
            }

            alert(data.message || "ลบกลุ่มสำเร็จ");
            navigate("/groups");
        } catch (error) {
            console.error("DELETE GROUP ERROR:", error);
            alert(error.message || "ลบกลุ่มไม่สำเร็จ");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
            setPreview(reader.result);
            setVideo("");
            setVideoPreview("");
        };
        reader.readAsDataURL(file);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setVideo(reader.result);
            setVideoPreview(reader.result);
            setImage("");
            setPreview("");
        };
        reader.readAsDataURL(file);
    };

    const handleCreatePost = async () => {
        if (!content.trim() && !image && !video) {
            return alert("กรุณาใส่ข้อความ รูป หรือวิดีโอ");
        }

        try {
            setLoadingPost(true);

            const res = await fetch(`${API_BASE}/api/posts/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userData?._id,
                    name: userData?.name || "",
                    profilePic: userData?.profilePic || "",
                    content,
                    image,
                    video,
                    groupId,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "สร้างโพสต์ไม่สำเร็จ");
            }

            setContent("");
            setImage("");
            setVideo("");
            setPreview("");
            setVideoPreview("");

            await fetchGroupPosts();
            await fetchGroupDetail();
            alert("โพสต์สำเร็จ");
        } catch (error) {
            console.error("CREATE GROUP POST ERROR:", error);
            alert(error.message || "สร้างโพสต์ไม่สำเร็จ");
        } finally {
            setLoadingPost(false);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const res = await fetch(`${API_BASE}/api/posts/like/${postId}`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                fetchGroupPosts();
            }
        } catch (error) {
            console.error("LIKE POST ERROR:", error);
        }
    };

    const handleAddComment = async (postId) => {
        const text = commentInputs[postId];
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
                setCommentInputs((prev) => ({
                    ...prev,
                    [postId]: "",
                }));

                setPosts((prev) =>
                    prev.map((post) => (post._id === postId ? data.post : post))
                );
            }
        } catch (error) {
            console.error("ADD COMMENT ERROR:", error);
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
                    prev.map((post) => (post._id === postId ? data.post : post))
                );
            } else {
                alert(data.message || "ลบคอมเมนต์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("DELETE COMMENT ERROR:", error);
            alert("ลบคอมเมนต์ไม่สำเร็จ");
        }
    };

    const handleDeletePost = async (postId) => {
        const confirmed = window.confirm("ต้องการลบโพสต์นี้ใช่หรือไม่?");
        if (!confirmed) return;

        try {
            const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) => prev.filter((post) => post._id !== postId));
            } else {
                alert(data.message || "ลบโพสต์ไม่สำเร็จ");
            }
        } catch (error) {
            console.error("DELETE POST ERROR:", error);
            alert("ลบโพสต์ไม่สำเร็จ");
        }
    };

    const getPostAuthor = (post) => {
        if (post.userId && typeof post.userId === "object") {
            return {
                id: post.userId._id || "",
                name: post.userId.name || post.name || "Unknown User",
                profilePic: post.userId.profilePic || post.profilePic || "",
            };
        }

        return {
            id: post.userId || "",
            name: post.name || "Unknown User",
            profilePic: post.profilePic || "",
        };
    };

    const getCommentAuthor = (comment) => {
        if (comment.userId && typeof comment.userId === "object") {
            return {
                id: comment.userId._id || "",
                name: comment.userId.name || comment.name || "Unknown User",
                profilePic: comment.userId.profilePic || comment.profilePic || "",
            };
        }

        return {
            id: comment.userId || "",
            name: comment.name || "Unknown User",
            profilePic: comment.profilePic || "",
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-6">กำลังโหลดข้อมูลกลุ่ม...</div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-6">ไม่พบข้อมูลกลุ่ม</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="bg-white rounded-3xl shadow overflow-hidden mb-6">
                    <div className="h-56 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 relative">
                        {group.groupImage && (
                            <img
                                src={getImageUrl(group.groupImage)}
                                alt={group.name}
                                className="w-full h-full object-cover object-center"
                            />
                        )}
                    </div>

                    <div className="px-6 py-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
                                <p className="text-gray-600 mt-2">
                                    {group.description || "ยังไม่มีคำอธิบายกลุ่ม"}
                                </p>
                                <p className="text-sm text-gray-500 mt-3">
                                    สมาชิก {Array.isArray(group.members) ? group.members.length : 0} คน
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {isOwner ? (
                                    <>
                                        <Link
                                            to={`/groups/edit/${group._id}`}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl"
                                        >
                                            แก้ไขกลุ่ม
                                        </Link>

                                        <button
                                            onClick={handleDeleteGroup}
                                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl cursor-pointer"
                                        >
                                            ลบกลุ่ม
                                        </button>
                                    </>
                                ) : isMember ? (
                                    <button
                                        onClick={handleLeaveGroup}
                                        className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl cursor-pointer"
                                    >
                                        ออกจากกลุ่ม
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleJoinGroup}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl cursor-pointer"
                                    >
                                        เข้าร่วมกลุ่ม
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {isMember && (
                            <div className="bg-white rounded-2xl shadow p-4 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Link to="/profilepage">
                                        {userData?.profilePic ? (
                                            <img
                                                src={getImageUrl(userData.profilePic)}
                                                alt={userData?.name}
                                                className="w-12 h-12 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                                {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                        )}
                                    </Link>

                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows="1"
                                        placeholder="คุณกำลังคิดอะไรอยู่..."
                                        className="flex-1 bg-gray-100 rounded-full px-5 py-4 text-lg outline-none resize-none min-h-[56px] max-h-40"
                                    />
                                </div>

                                {(preview || videoPreview) && (
                                    <div className="mb-4 space-y-3">
                                        {preview && (
                                            <div className="relative">
                                                <img
                                                    src={preview}
                                                    alt="preview"
                                                    className="w-full max-h-80 object-cover rounded-2xl border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImage("");
                                                        setPreview("");
                                                    }}
                                                    className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm"
                                                >
                                                    ลบรูป
                                                </button>
                                            </div>
                                        )}

                                        {videoPreview && (
                                            <div className="relative">
                                                <video
                                                    src={videoPreview}
                                                    controls
                                                    className="w-full max-h-80 rounded-2xl border bg-black"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setVideo("");
                                                        setVideoPreview("");
                                                    }}
                                                    className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm"
                                                >
                                                    ลบวิดีโอ
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-semibold text-[18px] px-6 py-3 rounded-2xl transition">
                                        เพิ่มรูป
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black font-semibold text-[18px] px-6 py-3 rounded-2xl transition">
                                        เพิ่มวิดีโอ
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleCreatePost}
                                        disabled={loadingPost}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[18px] px-8 py-3 rounded-2xl transition disabled:opacity-70"
                                    >
                                        {loadingPost ? "กำลังโพสต์..." : "โพสต์"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isMember && (
                            <div className="bg-white rounded-2xl shadow p-6 mb-6 text-gray-600">
                                ต้องเข้าร่วมกลุ่มก่อน จึงจะสามารถโพสต์ได้
                            </div>
                        )}

                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            โพสต์ในกลุ่ม
                        </h2>

                        {posts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow p-6 text-gray-500">
                                ยังไม่มีโพสต์ในกลุ่ม
                            </div>
                        ) : (
                            posts.map((post) => {
                                const author = getPostAuthor(post);

                                const isLiked = (post.likes || []).some((id) => {
                                    if (!id) return false;
                                    if (typeof id === "object") return id._id === userData?._id;
                                    return id.toString() === userData?._id;
                                });

                                const isPostOwner =
                                    author.id === userData?._id ||
                                    post.userId === userData?._id;

                                return (
                                    <div
                                        key={post._id}
                                        className="bg-white rounded-2xl shadow p-4 mb-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3 items-center">
                                                <Link to={`/profile/${author.id}`}>
                                                    {author.profilePic ? (
                                                        <img
                                                            src={getImageUrl(author.profilePic)}
                                                            alt={author.name}
                                                            className="w-12 h-12 rounded-full object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                                            {author.name?.charAt(0)?.toUpperCase() || "U"}
                                                        </div>
                                                    )}
                                                </Link>

                                                <div>
                                                    <Link
                                                        to={`/profile/${author.id}`}
                                                        className="font-semibold text-gray-800 hover:text-blue-600"
                                                    >
                                                        {author.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500">
                                                        {post.createdAt
                                                            ? new Date(post.createdAt).toLocaleString()
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            {isPostOwner && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            setOpenMenu(
                                                                openMenu === post._id ? null : post._id
                                                            )
                                                        }
                                                        className="text-gray-500 hover:text-black cursor-pointer px-2"
                                                    >
                                                        ⋯
                                                    </button>

                                                    {openMenu === post._id && (
                                                        <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow z-10 min-w-[120px]">
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
                                            <p className="mt-4 text-gray-800 whitespace-pre-wrap">
                                                {post.content}
                                            </p>
                                        )}

                                        {post.image && (
                                            <img
                                                src={getImageUrl(post.image)}
                                                alt="post"
                                                className="mt-4 w-full rounded-xl max-h-[500px] object-cover border"
                                            />
                                        )}

                                        {post.video && (
                                            <video
                                                src={getImageUrl(post.video)}
                                                controls
                                                className="mt-4 w-full rounded-xl max-h-[500px] border bg-black"
                                            />
                                        )}

                                        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 border-t pt-3">
                                            <button
                                                onClick={() => handleLikePost(post._id)}
                                                className={`hover:text-blue-600 cursor-pointer ${isLiked ? "text-blue-600 font-semibold" : ""
                                                    }`}
                                            >
                                                ถูกใจ {post.likes?.length || 0}
                                            </button>
                                            <div>ความคิดเห็น {post.comments?.length || 0}</div>
                                        </div>

                                        <div className="mt-3 flex gap-2">
                                            <input
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
                                                className="flex-1 border rounded px-3 py-2"
                                                placeholder="เขียนความคิดเห็น..."
                                            />
                                            <button
                                                onClick={() => handleAddComment(post._id)}
                                                className="bg-blue-500 text-white px-4 rounded cursor-pointer"
                                            >
                                                ส่ง
                                            </button>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {(Array.isArray(post.comments) ? post.comments : []).map(
                                                (comment) => {
                                                    const commentAuthor = getCommentAuthor(comment);

                                                    const isCommentOwner =
                                                        commentAuthor.id === userData?._id ||
                                                        comment.userId === userData?._id;

                                                    return (
                                                        <div
                                                            key={comment._id}
                                                            className="bg-gray-50 rounded-xl p-3"
                                                        >
                                                            <div className="flex justify-between items-start gap-3">
                                                                <div className="flex gap-3">
                                                                    <Link
                                                                        to={`/profile/${commentAuthor.id}`}
                                                                    >
                                                                        {commentAuthor.profilePic ? (
                                                                            <img
                                                                                src={getImageUrl(
                                                                                    commentAuthor.profilePic
                                                                                )}
                                                                                alt={commentAuthor.name}
                                                                                className="w-9 h-9 rounded-full object-cover border"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-semibold">
                                                                                {commentAuthor.name
                                                                                    ?.charAt(0)
                                                                                    ?.toUpperCase() || "U"}
                                                                            </div>
                                                                        )}
                                                                    </Link>

                                                                    <div>
                                                                        <Link
                                                                            to={`/profile/${commentAuthor.id}`}
                                                                            className="font-medium text-sm text-gray-800 hover:text-blue-600"
                                                                        >
                                                                            {commentAuthor.name}
                                                                        </Link>
                                                                        <p className="text-sm text-gray-700">
                                                                            {comment.text}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {comment.createdAt
                                                                                ? new Date(
                                                                                    comment.createdAt
                                                                                ).toLocaleString()
                                                                                : ""}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {isCommentOwner && (
                                                                    <div className="relative">
                                                                        <button
                                                                            onClick={() =>
                                                                                setOpenMenu(
                                                                                    openMenu === comment._id
                                                                                        ? null
                                                                                        : comment._id
                                                                                )
                                                                            }
                                                                            className="text-gray-500 hover:text-black cursor-pointer px-2"
                                                                        >
                                                                            ⋯
                                                                        </button>

                                                                        {openMenu === comment._id && (
                                                                            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow z-10 min-w-[130px]">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleDeleteComment(
                                                                                            post._id,
                                                                                            comment._id
                                                                                        )
                                                                                    }
                                                                                    className="block px-3 py-2 text-red-500 hover:bg-gray-100 w-full text-left text-xs"
                                                                                >
                                                                                    ลบคอมเมนต์
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div>
                        <div className="bg-white rounded-3xl shadow p-5 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                ข้อมูลกลุ่ม
                            </h2>

                            <div className="space-y-3 text-sm text-gray-700">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="font-semibold text-gray-800">ชื่อกลุ่ม</p>
                                    <p>{group.name || "-"}</p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="font-semibold text-gray-800">คำอธิบาย</p>
                                    <p>{group.description || "ยังไม่มีข้อมูล"}</p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="font-semibold text-gray-800">จำนวนสมาชิก</p>
                                    <p>{Array.isArray(group.members) ? group.members.length : 0} คน</p>
                                </div>

                                {group.owner && (
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="font-semibold text-gray-800">เจ้าของกลุ่ม</p>
                                        <p>
                                            {typeof group.owner === "object"
                                                ? group.owner?.name || "-"
                                                : "-"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;