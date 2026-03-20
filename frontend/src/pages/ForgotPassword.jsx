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

        try {
            setLoading(true);

            const { data } = await axios.post(`${BackendUrl}/api/auth/forgot-password`, {
                email,
            });

            if (data.success) {
                toast.success(data.message);
                navigate("/login");
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
            <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">ลืมรหัสผ่าน</h2>
                <p className="text-gray-600 mb-6 text-center">
                    กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="อีเมล"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border rounded-lg px-4 py-3 mb-4 outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;