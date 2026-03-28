import React from "react";
import { getImageUrl } from "../config/api";



const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/40";

    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads")) return `${API_BASE}${path}`;

    return `${API_BASE}/uploads/${path}`;
};

const ProfilePostCard = ({
    post,
    userData,
    commentText,
    setCommentText,
    handleLike,
    handleComment,
    handleDeleteComment,
    handleDeletePost,
}) => {
    return (
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <div className="flex items-start justify-between">
                <div className="flex gap-3 items-center">
                    {post.userId?.profilePic ? (
                        <img
                            src={getImageUrl(post.userId?.profilePic)}
                            alt={post.userId?.name}
                            className="w-12 h-12 rounded-full object-cover border"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {post.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-gray-800">
                            {post.userId?.name || "ไม่ทราบชื่อ"}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                {(post.userId?._id === userData?._id || post.userId === userData?._id) && (
                    <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                        ลบโพสต์
                    </button>
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
                    เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
                </video>
            )}

            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 border-t pt-3">
                <button
                    onClick={() => handleLike(post._id)}
                    className={`hover:text-blue-600 cursor-pointer ${post.likes?.includes(userData?._id) ? "text-blue-600 font-semibold cursor-pointer  " : ""
                        }`}
                >
                    ถูกใจ {post.likes?.length || 0}
                </button>

                <div>ความคิดเห็น {post.comments?.length || 0}</div>
            </div>

            <div className="mt-3 flex gap-2">
                <input
                    type="text"
                    value={commentText[post._id] || ""}
                    onChange={(e) =>
                        setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleComment(post._id)}
                    placeholder="เขียนความคิดเห็น..."
                    className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                    onClick={() => handleComment(post._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                    ส่ง
                </button>
            </div>

            <div className="mt-4 space-y-3">
                {(Array.isArray(post.comments) ? post.comments : [])
                    .filter((c) => c?.name && c?.text)
                    .map((c) => (
                        <div
                            key={c._id || `${post._id}-${c.createdAt}-${c.name}`}
                            className="bg-gray-50 rounded-xl p-3"
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex gap-3">
                                    {c.profilePic ? (
                                        <img
                                            src={getImageUrl(c.profilePic)}
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
                                    <button
                                        onClick={() => handleDeleteComment(post._id, c._id)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        ลบ
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default ProfilePostCard;