import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

function ResetPassword() {
    const { BackendUrl } = useContext(AppContext);
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
            return;
        }

        try {
            setLoading(true);

            const { data } = await axios.post(`${BackendUrl}/api/auth/reset-password`, {
                token,
                newPassword,
            });

            if (data.success) {
                toast.success(data.message || "เปลี่ยนรหัสผ่านสำเร็จ");
                navigate("/login");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
            <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">ตั้งรหัสผ่านใหม่</h2>
                <p className="text-gray-600 mb-6 text-center">
                    กรุณากรอกรหัสผ่านใหม่ของคุณ
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="รหัสผ่านใหม่"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full border rounded-lg px-4 py-3 mb-4 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full border rounded-lg px-4 py-3 mb-4 outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        {loading ? "กำลังเปลี่ยนรหัสผ่าน..." : "บันทึกรหัสผ่านใหม่"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;