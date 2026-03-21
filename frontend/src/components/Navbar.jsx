import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
    const { userData, logout } = useContext(AppContext);
    const location = useLocation();

    const linkStyle = (path) => ({
        color: "#fff",
        textDecoration: "none",
        padding: "8px 12px",
        borderRadius: "8px",
        background: location.pathname === path ? "#2563eb" : "transparent",
    });

    return (
        <nav
            style={{
                background: "#111827",
                color: "#fff",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
            }}
        >
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to="/" style={linkStyle("/")}>หน้าแรก</Link>
                <Link to="/search" style={linkStyle("/search")}>ค้นหาผู้ใช้</Link>
                <Link to="/friend-requests" style={linkStyle("/friend-requests")}>คำขอเพื่อน</Link>
                <Link to="/friends" style={linkStyle("/friends")}>เพื่อน</Link>
                <Link to="/groups" style={linkStyle("/group ")}>ค้นหากลุ่ม</Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link to="/profilepage" style={{ color: "#fff", textDecoration: "none" }}>
                    {userData?.name || "User"}
                </Link>

                <div
                    style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "#2563eb",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                    }}
                >
                    <Link to="/profilepage">
                        {userData?.profilePic ? (
                            <img
                                src={`http://localhost:5000/${userData.profilePic}`}
                                alt="profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            userData?.name?.charAt(0).toUpperCase() || "U"
                        )}
                    </Link>
                </div>

                <button
                    onClick={logout}
                    style={{
                        border: "none",
                        background: "#dc2626",
                        color: "#fff",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                >
                    ออกจากระบบ
                </button>
            </div>
        </nav>
    );
};

export default Navbar;