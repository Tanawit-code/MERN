import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function CheckEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
            <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
                <h2 className="text-2xl font-bold mb-4">ตรวจสอบอีเมลของคุณ</h2>
                <p className="text-gray-600 mb-3">
                    เราได้ส่งลิงก์ยืนยันบัญชีไปที่อีเมลแล้ว
                </p>
                {email && <p className="font-semibold text-blue-600 mb-6">{email}</p>}

                <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600"
                >
                    กลับไปหน้าเข้าสู่ระบบ
                </button>
            </div>
        </div>
    );
}

export default CheckEmail;