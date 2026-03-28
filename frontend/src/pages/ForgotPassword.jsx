import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const { BackendUrl } = useContext(AppContext);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("กรุณากรอกอีเมล");
            return;
        }

        try {
            setLoading(true);

            const { data } = await axios.post(`${BackendUrl}/api/auth/forgot-password`, {
                email: email.trim().toLowerCase(),
            });

            if (data.success) {
                toast.success(
                    data.message || "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว"
                );
                navigate("/login");
            } else {
                toast.error(data.message || "ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ"
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
                    <h2 className="text-3xl font-bold text-slate-800">ลืมรหัสผ่าน</h2>
                    <p className="text-sm text-slate-500 mt-2">
                        กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            อีเมล
                        </label>
                        <input
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
                        />
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700">
                        ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณ หากบัญชีนี้มีอยู่ในระบบ
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition disabled:opacity-50 cursor-pointer font-semibold"
                    >
                        {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;