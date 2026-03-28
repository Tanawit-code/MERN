import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getImageUrl } from "../config/api";
import {
    getNotificationsApi,
    getUnreadNotificationCountApi,
    markNotificationAsReadApi,
    markAllNotificationsAsReadApi,
    clearAllNotificationsApi,
} from "../services/notificationApi";

const NotificationBell = ({ mobile = false, onItemClick = () => { } }) => {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const prevCountRef = useRef(0);

    const fetchNotifications = async (showToast = false) => {
        try {
            const [listRes, countRes] = await Promise.all([
                getNotificationsApi(),
                getUnreadNotificationCountApi(),
            ]);

            const list = listRes.data.notifications || [];
            const count = countRes.data.count || 0;

            setNotifications(list);
            setUnreadCount(count);

            if (showToast && count > prevCountRef.current) {
                const latestUnread = list.find((item) => !item.isRead);
                if (latestUnread) {
                    toast.info(latestUnread.title || "มีการแจ้งเตือนใหม่");
                }
            }

            prevCountRef.current = count;
        } catch (error) {
            console.log(
                "fetchNotifications error:",
                error.response?.data || error.message
            );
        }
    };

    useEffect(() => {
        fetchNotifications(false);

        const interval = setInterval(() => {
            fetchNotifications(true);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const handleClickNotification = async (item) => {
        try {
            if (!item.isRead) {
                await markNotificationAsReadApi(item._id);
            }

            setOpen(false);
            onItemClick();

            if (item.type === "friend_request") {
                navigate("/friend-requests");
            } else if (item.type === "new_message" && item.conversationId) {
                navigate(`/chat/${item.conversationId}`);
            }

            fetchNotifications(false);
        } catch (error) {
            console.log(
                "handleClickNotification error:",
                error.response?.data || error.message
            );
        }
    };

    const handleReadAll = async () => {
        try {
            await markAllNotificationsAsReadApi();
            fetchNotifications(false);
        } catch (error) {
            console.log(
                "handleReadAll error:",
                error.response?.data || error.message
            );
        }
    };

    const handleClearAll = async () => {
        try {
            await clearAllNotificationsApi();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.log(
                "clearAll error:",
                error.response?.data || error.message
            );
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                style={{
                    border: "none",
                    background: mobile ? "#1f2937" : "#111827",
                    color: "#fff",
                    width: mobile ? "100%" : "42px",
                    height: mobile ? "48px" : "42px",
                    borderRadius: mobile ? "12px" : "50%",
                    cursor: "pointer",
                    fontSize: "18px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: mobile ? "flex-start" : "center",
                    gap: mobile ? "10px" : 0,
                    padding: mobile ? "0 14px" : 0,
                    fontWeight: 600,
                }}
            >
                <span>🔔</span>
                {mobile && <span>การแจ้งเตือน</span>}

                {unreadCount > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: mobile ? "8px" : "-4px",
                            right: mobile ? "10px" : "-4px",
                            background: "#ef4444",
                            color: "#fff",
                            borderRadius: "999px",
                            minWidth: "20px",
                            height: "20px",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 6px",
                            fontWeight: "700",
                        }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: mobile ? "56px" : "52px",
                        width: mobile ? "100%" : "340px",
                        maxHeight: "420px",
                        overflowY: "auto",
                        background: "#fff",
                        borderRadius: "14px",
                        boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
                        zIndex: 9999,
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <div
                        style={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #e5e7eb",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <strong style={{ fontSize: "16px", color: "#111827" }}>
                            การแจ้งเตือน
                        </strong>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={handleReadAll}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#2563eb",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                อ่านทั้งหมด
                            </button>

                            <button
                                onClick={handleClearAll}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                ล้างทั้งหมด
                            </button>
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: "18px", color: "#6b7280" }}>
                            ยังไม่มีการแจ้งเตือน
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => handleClickNotification(item)}
                                style={{
                                    padding: "12px 16px",
                                    borderBottom: "1px solid #f1f5f9",
                                    cursor: "pointer",
                                    background: item.isRead ? "#fff" : "#eff6ff",
                                    display: "flex",
                                    gap: "12px",
                                    alignItems: "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        background: "#dbeafe",
                                        flexShrink: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {item.sender?.profilePic ? (
                                        <img
                                            src={getImageUrl(item.sender.profilePic)}
                                            alt="sender"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <span style={{ color: "#1d4ed8", fontWeight: 700 }}>
                                            {item.sender?.name?.charAt(0)?.toUpperCase() || "U"}
                                        </span>
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontWeight: "700",
                                            color: "#111827",
                                        }}
                                    >
                                        {item.title}
                                    </div>

                                    <div
                                        style={{
                                            color: "#4b5563",
                                            fontSize: "14px",
                                            marginTop: "4px",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {item.body}
                                    </div>

                                    <div
                                        style={{
                                            color: "#9ca3af",
                                            fontSize: "12px",
                                            marginTop: "6px",
                                        }}
                                    >
                                        {new Date(item.createdAt).toLocaleString("th-TH")}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;