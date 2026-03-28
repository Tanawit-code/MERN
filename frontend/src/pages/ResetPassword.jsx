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
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validatePassword = (value) => {
        if (value.length < 8) {
            return "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร";
        }

        if (!/[A-Z]/.test(value)) {
            return "รหัสผ่านใหม่ต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน");
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            toast.error(passwordError);
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
            } else {
                toast.error(data.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
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
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-red-100 to-pink-200 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-sm text-gray-500 hover:text-red-600 mb-4 cursor-pointer"
                >
                    ← กลับหน้าเข้าสู่ระบบ
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">ตั้งรหัสผ่านใหม่</h2>
                    <p className="text-sm text-slate-500 mt-2">
                        กรุณากรอกรหัสผ่านใหม่ของคุณให้ปลอดภัย
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            รหัสผ่านใหม่
                        </label>

                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="กรอกรหัสผ่านใหม่"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-red-400"
                            />

                            <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 cursor-pointer"
                            >
                                {showNewPassword ? "🙈" : "👁"}
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                            รหัสผ่านต้องมีอย่างน้อย 8 ตัว และมีตัวพิมพ์ใหญ่ 1 ตัว
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            ยืนยันรหัสผ่านใหม่
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-red-400"
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 cursor-pointer"
                            >
                                {showConfirmPassword ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition disabled:opacity-50 cursor-pointer font-semibold"
                    >
                        {loading ? "กำลังเปลี่ยนรหัสผ่าน..." : "บันทึกรหัสผ่านใหม่"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;