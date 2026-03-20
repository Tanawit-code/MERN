import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, logout, isLoading } = useContext(AppContext);

  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [openMenu, setOpenMenu] = useState(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      fetchPosts();
    }
  }, [isLoading, isLoggedIn]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/posts/all");
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("โหลดโพสต์ไม่ได้:", err);
    }
  };

  const resetPostForm = () => {
    setContent("");
    setImage(null);
    setPreview(null);
    setVideo(null);
    setVideoPreview(null);
  };

  const handlePost = async () => {
    if ((!content.trim() && !image && !video) || loadingPost || !userData?._id) {
      return;
    }
    console.log("POST VIDEO:", video ? "HAS VIDEO" : "NO VIDEO");
    console.log("VIDEO LENGTH:", video?.length);

    setLoadingPost(true);

    try {
      const res = await fetch("http://localhost:5000/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData._id,
          name: userData.name,
          profilePic: userData.profilePic || "",
          content,
          image,
          video,
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
      console.error("POST ERROR:", err);
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } else {
        alert(data.message || "ลบโพสต์ไม่สำเร็จ");
      }
    } catch (err) {
      console.error("DELETE POST ERROR:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/like/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        fetchPosts();
      }
    } catch (err) {
      console.error("LIKE ERROR:", err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];

    if (!text || !text.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/comment/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData._id,
            name: userData.name,
            text,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
        setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
      }
    } catch (err) {
      console.error("COMMENT ERROR:", err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/comment/${postId}/${commentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
      }
    } catch (err) {
      console.error("DELETE COMMENT ERROR:", err);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold animate-pulse">
          กำลังโหลดข้อมูลผู้ใช้...
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">ยินดีต้อนรับ</h1>
            <p className="text-gray-600 mb-6">
              กรุณาเข้าสู่ระบบเพื่อใช้งานระบบโพสต์ เพื่อน และห้องแชต
            </p>

            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              ไปหน้า Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="flex pt-16">
        <div className="w-1/4 p-4 hidden md:block">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="font-semibold">เมนู</p>

            <ul className="mt-2 space-y-2 flex flex-col">
              <Link
                to="/profilepage"
                className="hover:bg-gray-100 p-2 rounded cursor-pointer"
              >
                👤 โปรไฟล์
              </Link>

              <Link
                to="/search"
                className="hover:bg-gray-100 p-2 rounded cursor-pointer"
              >
                🔍 ค้นหาผู้ใช้อื่น
              </Link>

              <Link
                to="/friend-requests"
                className="hover:bg-gray-100 p-2 rounded cursor-pointer"
              >
                📨 คำขอเป็นเพื่อน
              </Link>

              <Link
                to="/friends"
                className="hover:bg-gray-100 p-2 rounded cursor-pointer"
              >
                👥 รายชื่อเพื่อน
              </Link>

              <button
                onClick={handleLogout}
                className="text-left hover:bg-gray-100 p-2 rounded cursor-pointer text-red-500"
              >
                🚪 ออกจากระบบ
              </button>
            </ul>
          </div>
        </div>

        <div className="w-full md:w-2/4 p-4">
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold">
                {userData?.profilePic ? (
                  <img
                    src={`http://localhost:5000/${userData.profilePic}`}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userData?.name?.charAt(0).toUpperCase()
                )}
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

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <label className="cursor-pointer text-blue-500 text-sm inline-block">
                📷 เพิ่มรูป
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              <label className="cursor-pointer text-purple-500 text-sm inline-block">
                🎥 เพิ่มวิดีโอ
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoChange}
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
                  className="text-red-500 text-xs mt-2"
                >
                  ลบวิดีโอ
                </button>
              </div>
            )}
          </div>

          {posts.map((post) => (
            <div key={post._id} className="bg-white p-4 rounded-xl shadow mb-4">
              <div className="relative">
                {post.userId === userData._id && (
                  <div className="absolute top-0 right-0">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === post._id ? null : post._id)
                      }
                      className="text-gray-500 hover:text-black"
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold">
                  {post.userId?.profilePic ? (
                    <img
                      src={`http://localhost:5000/${post.userId.profilePic}`}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    post.userId?.name?.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <p className="font-semibold">{post.userId?.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-gray-600">{post.content}</p>

              {post.image && (
                <img
                  src={post.image}
                  alt="post"
                  className="mt-3 w-full max-h-[400px] max-w-[500px] object-cover rounded-xl border"
                />
              )}

              {post.video && (
                <video
                  src={post.video}
                  controls
                  className="mt-3 w-full max-h-[400px] max-w-[500px] object-cover rounded-xl border"
                />
              )}

              <button
                onClick={() => handleLike(post._id)}
                className={`mt-2 transition duration-200 cursor-pointer ${post.likes?.includes(userData._id)
                  ? "text-lg font-bold text-blue-500"
                  : "text-gray-500"
                  }`}
              >
                👍 {post.likes?.length || 0}
              </button>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="เขียนคอมเมนต์..."
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText({
                      ...commentText,
                      [post._id]: e.target.value,
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
                  .filter((c) => c?.name && c?.text)
                  .map((c, i) => (
                    <div
                      key={c._id || i}
                      className="flex gap-2 items-start relative"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="bg-gray-100 p-2 rounded w-full relative">
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-sm text-gray-600">{c.text}</p>

                        <p className="text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>

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

                            {openMenu === c._id && (
                              <div className="absolute right-0 mt-1 bg-white border rounded shadow">
                                <button
                                  onClick={() =>
                                    handleDeleteComment(post._id, c._id)
                                  }
                                  className="block px-3 py-1 text-red-500 hover:bg-gray-100 w-full text-left text-xs"
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

        <div className="w-1/4 p-4 hidden lg:block">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="font-semibold mb-2">ข้อมูลผู้ใช้</p>
            <p className="text-sm text-gray-600">ชื่อ: {userData?.name}</p>
            <p className="text-sm text-gray-600">อีเมล: {userData?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;