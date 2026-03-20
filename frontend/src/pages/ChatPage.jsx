import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMessagesApi, sendMessageApi, } from "../services/chatApi";
import Navbar from "../components/Navbar";

function ChatPage({ currentUserId, currentUserName }) {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [friendName, setFriendName] = useState("เพื่อน"); // ชื่อเพื่อน
    const messagesEndRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const res = await getMessagesApi(conversationId);
            const msgs = res.data.messages || [];
            setMessages(msgs);

            // หาเพื่อนจาก messages
            const friendMsg = msgs.find((m) => m.sender._id !== currentUserId);
            setFriendName(friendMsg?.sender?.name || "เพื่อน");
        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    };

    const fetchConversation = async () => {
        try {
            const res = await getConversationApi(conversationId);
            const members = res.data.conversation.members || [];
            const friend = members.find((m) => m._id !== currentUserId);
            setFriendName(friend?.name || "เพื่อน");
        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchConversation();
    }, [conversationId]);

    // scroll อัตโนมัติ
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ส่งข้อความ
    const handleSend = async () => {
        if (!text.trim()) return;

        try {
            const res = await sendMessageApi(conversationId, text);

            const newMessage = {
                ...res.data.data,
                sender: {
                    _id: currentUserId,
                    name: currentUserName || "คุณ",
                },
            };

            setMessages((prev) => [...prev, newMessage]);
            setText("");
        } catch (error) {
            alert(error.response?.data?.message || "ส่งข้อความไม่สำเร็จ");
        }
    };
    // ฟังก์ชัน format เวลา
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "Arial, sans-serif", paddingTop: "80px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "20px", }}>
                    ห้องแชทกับ
                    <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{friendName}</h1>
                </h2>

                {/* กล่องข้อความ */}
                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        height: "500px",
                        padding: "10px",
                        marginBottom: "10px",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        overflowY: "auto",
                    }}
                >
                    {messages.map((msg) => {
                        const isMe = msg.sender?._id === currentUserId;
                        return (
                            <div
                                key={msg._id}
                                style={{
                                    alignSelf: isMe ? "flex-end" : "flex-start",
                                    maxWidth: "70%",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* แสดงชื่อผู้ส่งเฉพาะเพื่อน */}
                                {!isMe && msg.sender?.name && (
                                    <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "2px" }}>
                                        {msg.sender.name}
                                    </div>
                                )}

                                {/* ข้อความ */}
                                <div
                                    style={{
                                        backgroundColor: isMe ? "#dcf8c6" : "#fff",
                                        padding: "10px 14px",
                                        borderRadius: "16px",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {msg.text}
                                </div>

                                {/* เวลาใต้ข้อความ */}
                                <div
                                    style={{
                                        fontSize: "11px",
                                        color: "#999",
                                        textAlign: isMe ? "right" : "left",
                                        marginTop: "2px",
                                    }}
                                >
                                    {formatTime(msg.createdAt)}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* input ส่งข้อความ */}
                <div style={{ display: "flex", gap: "8px" }}>
                    <input
                        type="text"
                        placeholder="พิมพ์ข้อความ..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
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
                            padding: "10px 20px",
                            borderRadius: "20px",
                            border: "none",
                            backgroundColor: "#4CAF50",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        ส่ง
                    </button>
                </div>
            </div>
        </div >
    );
}

export default ChatPage;    