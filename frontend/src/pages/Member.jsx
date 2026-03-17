import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";

const Member = () => {

    const navigate = useNavigate();
    const { isLoggedIn, userData, logout, isLoading } = useContext(AppContext);

    // ✅ ต้องอยู่ตรงนี้
    const [content, setContent] = useState("");
    const [posts, setPosts] = useState([]);

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
        if (!content || loadingPost) return;

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
                    content
                })
            });

            const data = await res.json();

            if (data.success) {
                setContent("");
                fetchPosts();
            }
        } catch (err) {
            console.error(err);
        }

        setLoadingPost(false);
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
                        <ul className="mt-2 space-y-2">
                            <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">🏠 หน้าแรก</li>
                            <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">👤 โปรไฟล์</li>
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

                        <button
                            onClick={handlePost}
                            disabled={loadingPost}
                            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {loadingPost ? "กำลังโพสต์..." : "โพสต์"}
                        </button>

                    </div>



                    {/* Posts */}
                    {posts.map((post) => (
                        <div key={post._id} className="bg-white p-4 rounded-xl shadow mb-4">
                            <p className="font-semibold">{post.name}</p>

                            <p className="text-xs text-gray-400">
                                {new Date(post.createdAt).toLocaleString()}
                            </p>

                            <p className="mt-2 text-gray-600">{post.content}</p>
                        </div>
                    ))}
                </div>

                {/* Sidebar ขวา */}
                <div className="w-1/4 p-4 hidden lg:block">
                    <div className="bg-white p-4 rounded-xl shadow">
                        <p>เพื่อนออนไลน์</p>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Member;