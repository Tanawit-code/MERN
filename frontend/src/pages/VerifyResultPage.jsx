import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    const isSuccess = status === "success";

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => navigate("/login"), 4000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f1f5f9, #e0e7ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Arial, sans-serif",
        }}>
            <div style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "48px 40px",
                maxWidth: "420px",
                width: "90%",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}>
                {/* Icon */}
                <div style={{
                    width: "72px", height: "72px",
                    borderRadius: "50%",
                    background: isSuccess ? "#dcfce7" : "#fee2e2",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px",
                    fontSize: "36px",
                }}>
                    {isSuccess ? "✅" : "❌"}
                </div>

                {/* Title */}
                <h1 style={{
                    margin: "0 0 12px",
                    fontSize: "22px",
                    fontWeight: "700",
                    color: isSuccess ? "#166534" : "#991b1b",
                }}>
                    {isSuccess ? "ยืนยันสำเร็จ!" : "เกิดข้อผิดพลาด"}
                </h1>

                {/* Message */}
                <p style={{ margin: "0 0 32px", color: "#64748b", fontSize: "15px", lineHeight: "1.6" }}>
                    {message || (isSuccess ? "บัญชีของคุณได้รับการยืนยันแล้ว" : "ลิงก์ไม่ถูกต้องหรือหมดอายุ")}
                </p>

                {/* Button */}
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        background: isSuccess
                            ? "linear-gradient(135deg, #2563eb, #4f46e5)"
                            : "linear-gradient(135deg, #ef4444, #dc2626)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "12px 32px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: "100%",
                    }}
                >
                    {isSuccess ? "ไปหน้าเข้าสู่ระบบ" : "ลองใหม่อีกครั้ง"}
                </button>

                {isSuccess && (
                    <p style={{ margin: "16px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                        จะพาไปหน้าเข้าสู่ระบบอัตโนมัติใน 4 วินาที...
                    </p>
                )}
            </div>
        </div>
    );
};

export default VerifyResultPage;