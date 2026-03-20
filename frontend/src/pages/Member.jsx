import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import FriendsList from "./FriendsList";
import { Link } from "react-router-dom";

const Member = () => {

    const navigate = useNavigate();
    const { isLoggedIn, userData, logout, isLoading } = useContext(AppContext);


    const [content, setContent] = useState("");
    const [posts, setPosts] = useState([]);
    const [commentText, setCommentText] = useState({});
    const [openMenu, setOpenMenu] = useState(null);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            navigate("/login");
        }
    }, [isLoading, isLoggedIn, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // ✅ โหลดโพสต์
    const fetchPosts = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/posts/all");
            const data = await res.json();

            if (data.success) {
                setPosts(data.posts.reverse()); // 🔥 โพสต์ใหม่ขึ้นก่อน
            }
        } catch (err) {
            console.error("โหลดโพสต์ไม่ได้:", err);
        }
    };

    const [loadingPost, setLoadingPost] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    // ✅ สร้างโพสต์
    const handlePost = async () => {
        if ((!content && !image) || loadingPost) return;

        setLoadingPost(true);

        try {
            const res = await fetch("http://localhost:5000/api/posts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userData._id,
                    name: userData.name,
                    content,
                    image // 🔥 ต้องมี
                })
            });

            const data = await res.json();

            if (data.success) {
                setContent("");
                setImage(null);
                setPreview(null);
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
        }

        setLoadingPost(false);
    };

    //ลบ post
    const handleDeletePost = async (postId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: "DELETE"
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) => prev.filter((p) => p._id !== postId));
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleLike = async (postId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/posts/like/${postId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userData._id
                })
            });

            const data = await res.json();

            if (data.success) {
                fetchPosts(); // โหลดใหม่
            }
        } catch (err) {
            console.error(err);
        }
    };
    // คอมเม้น
    const handleComment = async (postId) => {
        const text = commentText[postId];

        // ✅ กันเคสว่างจริง ๆ
        if (!text || !text.trim()) return;

        try {
            const res = await fetch(`http://localhost:5000/api/posts/comment/${postId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userData._id,
                    name: userData.name,
                    text
                })
            });

            const data = await res.json();

            console.log("COMMENT RESPONSE:", data);

            if (data.success) {
                setCommentText({ ...commentText, [postId]: "" });

                setPosts((prev) =>
                    prev.map((p) => (p._id === postId ? data.post : p))
                );
            }

        } catch (err) {
            console.error("COMMENT ERROR:", err);
        }
    };
    //ลบเม้น
    const handleDeleteComment = async (postId, commentId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/posts/comment/${postId}/${commentId}`, {
                method: "DELETE"
            });

            const data = await res.json();

            if (data.success) {
                setPosts((prev) =>
                    prev.map((p) =>
                        p._id === postId ? data.post : p
                    )
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg font-semibold animate-pulse">
                    กำลังโหลดข้อมูลผู้ใช้...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">

            <Navbar />

            <div className="flex pt-16">

                {/* Sidebar ซ้าย */}
                <div className="w-1/4 p-4 hidden md:block">
                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="font-semibold">เมนู</p>
                        <ul className="mt-2 space-y-2 flex flex-col" >
                            <Link to="/Profilepage" className="hover:bg-gray-100 p-2 rounded cursor-pointer">
                                👤 โปรไฟล์
                            </Link>
                            <Link to="/member" className="hover:bg-gray-100 p-2 rounded cursor-pointer">
                                🔍ค้นหาผู้ใช้อื่น
                            </Link>
                        </ul>
                    </div>
                </div>

                {/* Feed */}
                <div className="w-full md:w-2/4 p-4">

                    {/* Create Post */}
                    <div className="bg-white p-4 rounded-xl shadow mb-4">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                {userData?.name?.charAt(0).toUpperCase()}
                            </div>

                            <input
                                type="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handlePost()}
                                placeholder="คุณกำลังคิดอะไรอยู่..."
                                className="w-full bg-gray-100 rounded-full px-4 py-2 outline-none"
                            />
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                            <label className="cursor-pointer text-blue-500 text-sm inline-block">
                                📷 เพิ่มรูป
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setImage(reader.result);
                                            setPreview(reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                />
                            </label>

                            <button
                                onClick={handlePost}
                                disabled={loadingPost}
                                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                            >
                                {loadingPost ? "กำลังโพสต์..." : "โพสต์"}
                            </button>
                        </div>

                        {preview && (
                            <div className="mt-3">
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="rounded-xl max-h-60 object-cover border"
                                />

                                <button
                                    onClick={() => {
                                        setImage(null);
                                        setPreview(null);
                                    }}
                                    className="text-red-500 text-xs mt-2"
                                >
                                    ลบรูป
                                </button>
                            </div>
                        )}
                    </div>



                    {/* Posts */}
                    {posts.map((post) => (
                        <div key={post._id} className="bg-white p-4 rounded-xl shadow mb-4">
                            <div className="relative">
                                {post.userId === userData._id && (
                                    <div className="absolute top-0 right-0 ">
                                        <button
                                            onClick={() =>
                                                setOpenMenu(openMenu === post._id ? null : post._id)
                                            }
                                            className=" text-gray-500 hover:text-black "
                                        >
                                            ⋯
                                        </button>

                                        {openMenu === post._id && (
                                            <div className="absolute right-0 mt-1 bg-white border rounded shadow">
                                                <button
                                                    onClick={() => handleDeletePost(post._id)}
                                                    className="block px-3 py-1 text-red-500 hover:bg-gray-100 w-full text-left"
                                                >
                                                    ลบโพสต์
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="font-semibold">{post.name}</p>

                            <p className="text-xs text-gray-400">
                                {new Date(post.createdAt).toLocaleString()}
                            </p>

                            <p className="mt-2 text-gray-600">{post.content}</p>

                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="post"
                                    className="mt-3 w-full max-h-[400px] max-w-[400px] object-cover rounded-xl border"
                                />
                            )}
                            {/* กด like */}
                            <button
                                onClick={() => handleLike(post._id)}
                                className={`mt-2 transition duration-200 cursor-pointer ${post.likes?.includes(userData._id) ? "text-lg font-bold text-blue-500 text " : "text-gray-500"
                                    }`}
                            >
                                👍 {post.likes?.length || 0}
                            </button>

                            {/* Comment Input */}
                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="เขียนคอมเมนต์..."
                                    value={commentText[post._id] || ""}
                                    onChange={(e) =>
                                        setCommentText({
                                            ...commentText,
                                            [post._id]: e.target.value
                                        })
                                    }
                                    onKeyDown={(e) => e.key === "Enter" && handleComment(post._id)}
                                    className="flex-1 border rounded px-3 py-1"
                                />

                                <button
                                    onClick={() => handleComment(post._id)}
                                    className="bg-blue-500 text-white px-3 rounded"
                                >
                                    ส่ง
                                </button>
                            </div>


                            <div className="mt-3 space-y-2">
                                {(Array.isArray(post.comments) ? post.comments : [])
                                    .filter(c => c?.name && c?.text)
                                    .map((c, i) => (
                                        <div key={c._id || i} className="flex gap-2 items-start relative">

                                            {/* Avatar */}
                                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Content */}
                                            <div className="bg-gray-100 p-2 rounded w-full relative">
                                                <p className="text-sm font-semibold">{c.name}</p>
                                                <p className="text-sm text-gray-600">{c.text}</p>

                                                <p className="text-xs text-gray-400">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </p>

                                                {/* ⋯ menu (แสดงเฉพาะเจ้าของ) */}
                                                {c.userId === userData._id && (
                                                    <div className="absolute top-1 right-2">
                                                        <button
                                                            onClick={() =>
                                                                setOpenMenu(openMenu === c._id ? null : c._id)
                                                            }
                                                            className="text-gray-500 hover:text-black"
                                                        >
                                                            ⋯
                                                        </button>

                                                        {/* dropdown */}
                                                        {openMenu === c._id && (
                                                            <div className="absolute right-0 mt-1 bg-white border rounded shadow">
                                                                <button
                                                                    onClick={() => handleDeleteComment(post._id, c._id)}
                                                                    className="block px-3 py-1 text-red-500 hover:bg-gray-100 w-full text-left text-xs "
                                                                >
                                                                    ลบ Comment
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>



                {/* Sidebar ขวา */}
                <div className="w-1/4 p-4 hidden lg:block">
                    <div className="bg-white p-4 rounded-xl shadow">
                        <FriendsList />
                    </div>
                </div>

            </div>

        </div >
    );
};

export default Member;