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
                <Link to="/search" style={linkStyle("/search")}>ค้นหา</Link>
                <Link to="/friend-requests" style={linkStyle("/friend-requests")}>คำขอเพื่อน</Link>
                <Link to="/friends" style={linkStyle("/friends")}>เพื่อน</Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>{userData?.name || "User"}</span>
                <div
                    style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                    }}
                >
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;