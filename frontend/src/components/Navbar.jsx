import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { API_BASE } from "../config/api";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

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

const Navbar = () => {
    const { userData, logout } = useContext(AppContext);
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            if (!mobile) {
                setIsOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const linkStyle = (path) => ({
        color: "#fff",
        textDecoration: "none",
        padding: "10px 16px",
        borderRadius: "12px",
        background: location.pathname === path ? "#2563eb" : "transparent",
        fontWeight: "600",
        whiteSpace: "nowrap",
        transition: "0.2s",
    });

    const mobileLinkStyle = (path) => ({
        color: "#fff",
        textDecoration: "none",
        padding: "12px 14px",
        borderRadius: "10px",
        background: location.pathname === path ? "#2563eb" : "#1f2937",
        fontWeight: "500",
        display: "block",
    });

    return (
        <nav
            style={{
                background: "linear-gradient(90deg, #0f172a, #0b1324)",
                color: "#fff",
                padding: "14px 24px",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
            }}
        >
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                }}
            >
                {!isMobile ? (
                    <>
                        {/* ซ้าย: Logo */}
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <Link
                                to="/"
                                style={{
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontSize: "20px",
                                    fontWeight: "800",
                                    letterSpacing: "-0.3px",
                                }}
                            >
                                EyesNote
                            </Link>
                        </div>

                        {/* กลาง: Menu */}
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "10px",
                            }}
                        >
                            <Link to="/" style={linkStyle("/")}>หน้าแรก</Link>
                            <Link to="/search" style={linkStyle("/search")}>ค้นหาผู้ใช้</Link>
                            <Link to="/friend-requests" style={linkStyle("/friend-requests")}>คำขอเพื่อน</Link>
                            <Link to="/friends" style={linkStyle("/friends")}>เพื่อน</Link>
                            <Link to="/groups" style={linkStyle("/groups")}>ค้นหากลุ่ม</Link>
                        </div>

                        {/* ขวา: Profile + Logout */}
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: "12px",
                            }}
                        >
                            <Link
                                to="/profilepage"
                                style={{
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontWeight: "700",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {userData?.name || "User"}
                            </Link>



                            <Link
                                to="/profilepage"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    background: "#2563eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                    flexShrink: 0,
                                }}
                            >
                                {userData?.profilePic ? (
                                    <img
                                        src={getImageUrl(userData?.profilePic)}
                                        alt="profile"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    userData?.name?.charAt(0).toUpperCase() || "U"
                                )}
                            </Link>

                            <button
                                onClick={logout}
                                style={{
                                    border: "none",
                                    background: "#ef4444",
                                    color: "#fff",
                                    padding: "10px 16px",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    fontWeight: "700",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                ออกจากระบบ
                            </button>

                            <Link
                                to="/settings"
                                style={{
                                    background: "#374151",
                                    color: "#fff",
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                    fontWeight: "600"
                                }}
                            >
                                ⚙️ ตั้งค่า
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mobile top bar */}
                        <Link
                            to="/"
                            style={{
                                color: "#fff",
                                textDecoration: "none",
                                fontSize: "20px",
                                fontWeight: "800",
                                letterSpacing: "-0.3px",
                            }}
                        >
                            MySocial
                        </Link>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#fff",
                                fontSize: "28px",
                                cursor: "pointer",
                                lineHeight: 1,
                                marginLeft: "auto",
                            }}
                        >
                            ☰
                        </button>
                    </>
                )}
            </div>

            {/* Mobile Menu */}
            {isMobile && isOpen && (
                <div
                    style={{
                        maxWidth: "1400px",
                        margin: "14px auto 0",
                        background: "#111827",
                        borderRadius: "16px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "6px 4px 12px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            marginBottom: "4px",
                        }}
                    >
                        <Link
                            to="/profilepage"
                            onClick={() => setIsOpen(false)}
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                background: "#2563eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                textDecoration: "none",
                                fontWeight: "bold",
                                flexShrink: 0,
                            }}
                        >
                            {userData?.profilePic ? (
                                <img
                                    src={getImageUrl(userData?.profilePic)}
                                    alt="profile"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                userData?.name?.charAt(0).toUpperCase() || "U"
                            )}
                        </Link>

                        <div>
                            <Link
                                to="/profilepage"
                                onClick={() => setIsOpen(false)}
                                style={{
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontWeight: "700",
                                    display: "block",
                                }}
                            >
                                {userData?.name || "User"}
                            </Link>
                        </div>
                    </div>

                    <Link to="/" style={mobileLinkStyle("/")} onClick={() => setIsOpen(false)}>
                        หน้าแรก
                    </Link>
                    <Link to="/search" style={mobileLinkStyle("/search")} onClick={() => setIsOpen(false)}>
                        ค้นหาผู้ใช้
                    </Link>
                    <Link
                        to="/friend-requests"
                        style={mobileLinkStyle("/friend-requests")}
                        onClick={() => setIsOpen(false)}
                    >
                        คำขอเพื่อน
                    </Link>
                    <Link to="/friends" style={mobileLinkStyle("/friends")} onClick={() => setIsOpen(false)}>
                        เพื่อน
                    </Link>
                    <Link to="/groups" style={mobileLinkStyle("/groups")} onClick={() => setIsOpen(false)}>
                        ค้นหากลุ่ม
                    </Link>

                    <button
                        onClick={logout}
                        style={{
                            border: "none",
                            background: "#ef4444",
                            color: "#fff",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "600",
                            marginTop: "6px",
                        }}
                    >
                        ออกจากระบบ
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;