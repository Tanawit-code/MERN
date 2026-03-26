import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";

const API_BASE = "http://localhost:5000";

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

  const [friends, setFriends] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      fetchPosts();
      fetchFriends();
      fetchSuggestedUsers();
    }
  }, [isLoading, isLoggedIn]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/all`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("โหลดโพสต์ไม่ได้:", err);
    }
  };

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const res = await fetch(`${API_BASE}/api/friends`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setFriends(data.friends || []);
      } else {
        setFriends([]);
      }
    } catch (err) {
      console.error("โหลดรายชื่อเพื่อนไม่ได้:", err);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await fetch(`${API_BASE}/api/profile/suggestions`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setSuggestedUsers(data.users || []);
      } else {
        setSuggestedUsers([]);
      }
    } catch (err) {
      console.error("โหลดคนแนะนำไม่ได้:", err);
      setSuggestedUsers([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleToggleFollow = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        fetchSuggestedUsers();
      } else {
        alert(data.message || "ติดตามไม่สำเร็จ");
      }
    } catch (err) {
      console.error("FOLLOW ERROR:", err);
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

    setLoadingPost(true);

    try {
      const res = await fetch(`${API_BASE}/api/posts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
    } catch (err) {
      console.error("DELETE POST ERROR:", err);
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
    } catch (err) {
      console.error("LIKE ERROR:", err);
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
    } catch (err) {
      console.error("COMMENT ERROR:", err);
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
    return <div className="p-6">กำลังโหลดข้อมูลผู้ใช้...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
        <h1 className="text-3xl font-bold mb-3">ยินดีต้อนรับ</h1>
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center gap-3">
              {userData?.profilePic ? (
                <img
                  src={userData.profilePic}
                  alt={userData?.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  {userData?.name?.charAt(0)?.toUpperCase()}
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
                {loadingPost ? "กำลังโพสต์..." : "โพสต์"}
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

          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-2xl shadow p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <Link to={`/profile/${post.userId?._id}`}>
                    {post.userId?.profilePic ? (
                      <img
                        src={post.userId.profilePic}
                        alt={post.userId?.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {post.userId?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </Link>

                  <div>
                    <Link
                      to={`/profile/${post.userId?._id}`}
                      className="font-semibold text-gray-800 hover:text-blue-600"
                    >
                      {post.userId?.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {(post.userId?._id === userData?._id ||
                  post.userId === userData?._id) && (
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
                <p className="mt-4 text-gray-800 whitespace-pre-wrap">
                  {post.content}
                </p>
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
                  className={`hover:text-blue-600 ${post.likes?.includes(userData._id)
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
                  .map((c) => (
                    <div key={c._id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex gap-3">
                          {c.profilePic ? (
                            <img
                              src={c.profilePic}
                              alt={c.name}
                              className="w-9 h-9 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-semibold">
                              {c.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-sm text-gray-800">
                              {c.name}
                            </p>
                            <p className="text-sm text-gray-700">{c.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(c.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {c.userId === userData._id && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenu(openMenu === c._id ? null : c._id)
                              }
                              className="text-gray-500 hover:text-black cursor-pointer"
                            >
                              ⋯
                            </button>

                            {openMenu === c._id && (
                              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow z-10">
                                <button
                                  onClick={() =>
                                    handleDeleteComment(post._id, c._id)
                                  }
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
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="font-bold text-lg mb-4">ข้อมูลผู้ใช้</h2>

            <div className="flex items-center gap-3">
              {userData?.profilePic ? (
                <img
                  src={userData.profilePic}
                  alt={userData?.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  {userData?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div>
                <p className="font-semibold">{userData?.name}</p>
                <p className="text-sm text-gray-500">{userData?.email}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/profilepage"
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-center"
              >
                โปรไฟล์ของฉัน
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">รายชื่อเพื่อน</h2>
              <Link to="/friends" className="text-blue-500 text-sm">
                ดูทั้งหมด
              </Link>
            </div>

            {loadingFriends ? (
              <p className="text-gray-500">กำลังโหลด...</p>
            ) : friends.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีเพื่อน</p>
            ) : (
              <div className="space-y-3">
                {friends.slice(0, 5).map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Link
                      to={`/profile/${friend._id}`}
                      className="flex items-center gap-3 min-w-0"
                    >
                      {friend.profilePic ? (
                        <img
                          src={friend.profilePic}
                          alt={friend.name}
                          className="w-11 h-11 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold">
                          {friend.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-medium truncate">{friend.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {friend.email}
                        </p>
                      </div>
                    </Link>

                    <Link
                      to={`/profile/${friend._id}`}
                      className="text-sm text-blue-500"
                    >
                      ดู
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">คนที่แนะนำ</h2>
              <Link to="/search" className="text-blue-500 text-sm">
                ค้นหาเพิ่ม
              </Link>
            </div>

            {loadingSuggestions ? (
              <p className="text-gray-500">กำลังโหลด...</p>
            ) : suggestedUsers.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีคำแนะนำ</p>
            ) : (
              <div className="space-y-3">
                {suggestedUsers.slice(0, 5).map((user) => (
                  <div
                    key={user._id}
                    className="border rounded-2xl p-3 bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/profile/${user._id}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.name}
                            className="w-11 h-11 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            ผู้ติดตาม {user.followersCount || 0}
                          </p>
                        </div>
                      </Link>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleToggleFollow(user._id)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-lg"
                      >
                        Follow
                      </button>
                      <Link
                        to={`/profile/${user._id}`}
                        className="flex-1 bg-white border hover:bg-gray-100 text-center text-sm px-3 py-2 rounded-lg"
                      >
                        ดูโปรไฟล์
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;