import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import {
    getConversationApi,
    getMessagesApi,
    sendMessageApi,
} from "../services/chatApi";

function ChatPage() {
    const { conversationId } = useParams();
    const { userData } = useContext(AppContext);

    const currentUserId = userData?._id;

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [friendName, setFriendName] = useState("เพื่อน");
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
                <h2 style={{ marginBottom: "16px" }}>ห้องแชทกับ {friendName}</h2>

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
                                            maxWidth: "70%",
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