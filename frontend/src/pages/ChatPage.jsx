import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import {
    getConversationApi,
    getMessagesApi,
    sendMessageApi,
} from "../services/chatApi";
const API_BASE = "http://localhost:5000";

const getImageUrl = (path) => {
    if (!path) return "";

    // ถ้าเป็น full URL
    if (path.startsWith("http")) return path;

    // ถ้าเป็น base64
    if (path.startsWith("data:image") || path.startsWith("data:video")) {
        return path;
    }

    // ถ้ามี uploads อยู่แล้ว
    if (path.includes("uploads")) {
        return `${API_BASE}/${path}`;
    }

    // default
    return `${API_BASE}/uploads/${path}`;
};

// เป็นหน้าห้องแชต

// โหลดข้อมูลห้องสนทนา
// โหลดข้อความ
// ส่งข้อความ
// ส่งรูป/วิดีโอในแชต
// แสดงชื่อและข้อมูลของคนที่คุยด้วย

// เป็นหน้าหลักของระบบแชตส่วนตัว

function ChatPage() {
    const { conversationId } = useParams();
    const { userData } = useContext(AppContext);

    const currentUserId = userData?._id;

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [friendName, setFriendName] = useState("เพื่อน");
    const [friendProfilePic, setFriendProfilePic] = useState("");
    const [loading, setLoading] = useState(true);

    const [media, setMedia] = useState(null);
    const [mediaType, setMediaType] = useState("");
    const [mediaPreview, setMediaPreview] = useState(null);

    const messagesEndRef = useRef(null);

    const fetchConversation = async () => {
        if (!conversationId || !currentUserId) return;

        try {
            const res = await getConversationApi(conversationId);
            const members = res.data.conversation?.members || [];
            const friend = members.find((m) => m._id !== currentUserId);
            setFriendName(friend?.name || "เพื่อน");
            setFriendProfilePic(friend?.profilePic || "");
        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    };

    const fetchMessages = async () => {
        if (!conversationId) return;

        try {
            const res = await getMessagesApi(conversationId);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.log(error.response?.data || error.message);
            alert(error.response?.data?.message || "โหลดข้อความไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!conversationId || !currentUserId) return;
        fetchConversation();
        fetchMessages();
    }, [conversationId, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("รูปใหญ่เกิน 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setMedia(reader.result);
            setMediaPreview(reader.result);
            setMediaType("image");
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
            setMedia(reader.result);
            setMediaPreview(reader.result);
            setMediaType("video");
        };
        reader.readAsDataURL(file);
    };

    const clearMedia = () => {
        setMedia(null);
        setMediaType("");
        setMediaPreview(null);
    };

    const handleSend = async () => {
        if (!conversationId) {
            alert("ไม่พบ conversationId");
            return;
        }

        if (!text.trim() && !media) return;

        try {
            const res = await sendMessageApi(
                conversationId,
                text,
                media,
                mediaType
            );

            const newMessage = res.data.data;

            setMessages((prev) => [...prev, newMessage]);
            setText("");
            clearMedia();
        } catch (error) {
            alert(error.response?.data?.message || "ส่งข้อความไม่สำเร็จ");
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
            <Navbar />

            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    height: "calc(100vh - 90px)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                        background: "#fff",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <div
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "#2563eb",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "18px",
                            flexShrink: 0,
                        }}
                    >
                        {friendProfilePic ? (
                            <img
                                src={getImageUrl(friendProfilePic)}
                                alt="friend-profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            friendName?.charAt(0).toUpperCase() || "F"
                        )}
                    </div>

                    <div>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                            {friendName}
                        </h2>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                            ห้องแชทส่วนตัว
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        background: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        marginBottom: "16px",
                    }}
                >
                    {loading ? (
                        <p>กำลังโหลดข้อความ...</p>
                    ) : messages.length === 0 ? (
                        <p style={{ color: "#666" }}>ยังไม่มีข้อความ</p>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender?._id === currentUserId;

                            return (
                                <div
                                    key={msg._id}
                                    style={{
                                        display: "flex",
                                        justifyContent: isMe ? "flex-end" : "flex-start",
                                        marginBottom: "12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-end",
                                            gap: "8px",
                                            flexDirection: isMe ? "row-reverse" : "row",
                                            maxWidth: "80%",
                                        }}
                                    >
                                        {!isMe && (
                                            <div
                                                style={{
                                                    width: "34px",
                                                    height: "34px",
                                                    borderRadius: "50%",
                                                    overflow: "hidden",
                                                    background: "#2563eb",
                                                    color: "#fff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "bold",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {msg.sender?.profilePic ? (
                                                    <img
                                                        src={getImageUrl(msg.serder?.profilePic)}
                                                        alt="sender-profile"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    msg.sender?.name?.charAt(0).toUpperCase() || "U"
                                                )}
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                maxWidth: "100%",
                                                background: isMe ? "#2563eb" : "#e5e7eb",
                                                color: isMe ? "#fff" : "#111827",
                                                padding: "10px 14px",
                                                borderRadius: "14px",
                                            }}
                                        >
                                            {!isMe && msg.sender?.name && (
                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        fontWeight: "bold",
                                                        marginBottom: "4px",
                                                    }}
                                                >
                                                    {msg.sender.name}
                                                </div>
                                            )}

                                            {msg.text && <div>{msg.text}</div>}

                                            {msg.media && msg.mediaType === "image" && (
                                                <img
                                                    src={msg.media}
                                                    alt="chat-media"
                                                    style={{
                                                        marginTop: "8px",
                                                        maxWidth: "220px",
                                                        borderRadius: "10px",
                                                        display: "block",
                                                    }}
                                                />
                                            )}

                                            {msg.media && msg.mediaType === "video" && (
                                                <video
                                                    src={msg.media}
                                                    controls
                                                    style={{
                                                        marginTop: "8px",
                                                        maxWidth: "220px",
                                                        borderRadius: "10px",
                                                        display: "block",
                                                    }}
                                                />
                                            )}

                                            <div
                                                style={{
                                                    fontSize: "11px",
                                                    opacity: 0.8,
                                                    marginTop: "6px",
                                                    textAlign: "right",
                                                }}
                                            >
                                                {formatTime(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {mediaPreview && (
                    <div style={{ marginBottom: "10px" }}>
                        {mediaType === "image" ? (
                            <img
                                src={mediaPreview}
                                alt="preview"
                                style={{ maxWidth: "220px", borderRadius: "10px" }}
                            />
                        ) : (
                            <video
                                src={mediaPreview}
                                controls
                                style={{ maxWidth: "220px", borderRadius: "10px" }}
                            />
                        )}

                        <div>
                            <button
                                onClick={clearMedia}
                                style={{
                                    marginTop: "8px",
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#fff",
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                ลบไฟล์
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="พิมพ์ข้อความ..."
                        style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "20px",
                            border: "1px solid #ccc",
                            outline: "none",
                            fontSize: "14px",
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />

                    <button
                        onClick={handleSend}
                        style={{
                            padding: "10px 18px",
                            borderRadius: "20px",
                            border: "none",
                            background: "#2563eb",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        ส่ง
                    </button>

                    <label
                        style={{
                            padding: "8px 12px",
                            background: "#e5e7eb",
                            borderRadius: "10px",
                            cursor: "pointer",
                        }}
                    >
                        รูป
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                        />
                    </label>

                    <label
                        style={{
                            padding: "8px 12px",
                            background: "#e5e7eb",
                            borderRadius: "10px",
                            cursor: "pointer",
                        }}
                    >
                        วิดีโอ
                        <input
                            type="file"
                            accept="video/*"
                            style={{ display: "none" }}
                            onChange={handleVideoChange}
                        />
                    </label>

                </div>
            </div>
        </div>
    );
}

export default ChatPage;