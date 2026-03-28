import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

const SettingsPage = () => {
    const { BackendUrl, userData, getUserData } = useContext(AppContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingSecurity, setSavingSecurity] = useState(false);
    const [sendingVerify, setSendingVerify] = useState(false);

    useEffect(() => {
        setName(userData?.name || "");
        setEmail(userData?.email || "");
    }, [userData]);

    const emailChanged = useMemo(() => {
        return (email || "").trim().toLowerCase() !== (userData?.email || "").trim().toLowerCase();
    }, [email, userData]);

    const passwordChanged = useMemo(() => {
        return newPassword.trim() !== "";
    }, [newPassword]);

    const handleSaveName = async (e) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            return toast.error("กรุณากรอกชื่อ");
        }

        if (trimmedName === (userData?.name || "").trim()) {
            return toast.info("ยังไม่มีการเปลี่ยนชื่อ");
        }

        try {
            setSavingProfile(true);

            const { data } = await axios.put(
                `${BackendUrl}/api/auth/update-profile`,
                { name: trimmedName },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success(data.message || "อัปเดตชื่อสำเร็จ");
                await getUserData?.();
            } else {
                toast.error(data.message || "อัปเดตชื่อไม่สำเร็จ");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "เกิดข้อผิดพลาดในการอัปเดตชื่อ"
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handleRequestChange = async (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim().toLowerCase();

        if (!emailChanged && !passwordChanged) {
            return toast.info("ยังไม่มีการเปลี่ยนอีเมลหรือรหัสผ่าน");
        }

        if (passwordChanged) {
            if (newPassword.length < 6) {
                return toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
            }

            if (newPassword !== confirmPassword) {
                return toast.error("ยืนยันรหัสผ่านไม่ตรงกัน");
            }
        }

        try {
            setSavingSecurity(true);

            const payload = {};
            if (emailChanged) payload.email = trimmedEmail;
            if (passwordChanged) payload.password = newPassword;

            const { data } = await axios.put(
                `${BackendUrl}/api/auth/request-account-change`,
                payload,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success(
                    data.message || "ส่งอีเมลยืนยันการเปลี่ยนข้อมูลแล้ว"
                );

                setNewPassword("");
                setConfirmPassword("");

                if (!emailChanged) {
                    await getUserData?.();
                }
            } else {
                toast.error(data.message || "ส่งคำขอเปลี่ยนข้อมูลไม่สำเร็จ");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "เกิดข้อผิดพลาดในการส่งคำขอ"
            );
        } finally {
            setSavingSecurity(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            setSendingVerify(true);

            const { data } = await axios.post(
                `${BackendUrl}/api/auth/resend-verification`,
                { email: userData?.email || email },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success(data.message || "ส่งอีเมลยืนยันใหม่แล้ว");
            } else {
                toast.error(data.message || "ส่งอีเมลยืนยันใหม่ไม่สำเร็จ");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "ส่งอีเมลยืนยันใหม่ไม่สำเร็จ"
            );
        } finally {
            setSendingVerify(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">ตั้งค่าบัญชี</h1>
                    <p className="text-gray-500 mt-2">
                        จัดการชื่อ อีเมล รหัสผ่าน และสถานะการยืนยันอีเมล
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow p-5 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                ข้อมูลปัจจุบัน
                            </h2>

                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-sm text-gray-500">ชื่อ</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {userData?.name || "-"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-sm text-gray-500">อีเมล</p>
                                    <p className="text-lg font-semibold text-gray-800 break-all">
                                        {userData?.email || "-"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-sm text-gray-500">สถานะอีเมล</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userData?.isVerified
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {userData?.isVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
                                        </span>
                                    </div>

                                    {!userData?.isVerified && (
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={sendingVerify}
                                            className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl transition disabled:opacity-60 cursor-pointer"
                                        >
                                            {sendingVerify
                                                ? "กำลังส่ง..."
                                                : "ส่งอีเมลยืนยันใหม่"}
                                        </button>
                                    )}
                                </div>

                                <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
                                    การเปลี่ยนอีเมลหรือรหัสผ่านจะต้องกดยืนยันผ่านอีเมลก่อน จึงจะมีผล
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                เปลี่ยนชื่อ
                            </h2>
                            <p className="text-gray-500 mb-5">
                                ชื่อสามารถบันทึกได้ทันทีโดยไม่ต้องยืนยันอีเมล
                            </p>

                            <form onSubmit={handleSaveName} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ชื่อใหม่
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="กรอกชื่อใหม่"
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-2xl transition disabled:opacity-60 cursor-pointer"
                                >
                                    {savingProfile ? "กำลังบันทึก..." : "บันทึกชื่อ"}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-3xl shadow p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                เปลี่ยนอีเมล / รหัสผ่าน
                            </h2>
                            <p className="text-gray-500 mb-5">
                                เมื่อกดบันทึก ระบบจะส่งอีเมลยืนยันให้ก่อน อีเมลหรือรหัสผ่านใหม่จะมีผลหลังจากยืนยันแล้วเท่านั้น
                            </p>

                            <form onSubmit={handleRequestChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        อีเมลใหม่
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="กรอกอีเมลใหม่"
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    {emailChanged && (
                                        <p className="text-sm text-amber-600 mt-2">
                                            คุณกำลังเปลี่ยนอีเมลจาก {userData?.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        รหัสผ่านใหม่
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="กรอกรหัสผ่านใหม่"
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ยืนยันรหัสผ่านใหม่
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-700">
                                    หลังจากกดบันทึก กรุณาเปิดอีเมลและกดลิงก์ยืนยันการเปลี่ยนข้อมูล
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingSecurity}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl transition disabled:opacity-60 cursor-pointer"
                                >
                                    {savingSecurity
                                        ? "กำลังส่งคำขอ..."
                                        : "บันทึกและส่งอีเมลยืนยัน"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;