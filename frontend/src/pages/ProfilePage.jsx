import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

// ใช้แสดงและแก้ไขข้อมูลโปรไฟล์ของผู้ใช้ เช่นชื่อ อีเมล รูปโปรไฟล์

const ProfilePage = () => {
    const { BackendUrl, userData, setUserData, isLoading } = useContext(AppContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userData) {
            setName(userData.name || "");
            setEmail(userData.email || "");

            if (userData.profilePic) {
                setPreview(`${BackendUrl}/${userData.profilePic}`);
            } else {
                setPreview("");
            }
        }
    }, [userData, BackendUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("รูปใหญ่เกิน 5MB");
            return;
        }

        setProfilePic(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);

            if (profilePic) {
                formData.append("profilePic", profilePic);
            }

            const { data } = await axios.put(
                `${BackendUrl}/api/auth/update-profile`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (data.success) {
                setUserData(data.user);
                toast.success(data.message || "อัปเดตโปรไฟล์สำเร็จ");
            } else {
                toast.error(data.message || "อัปเดตโปรไฟล์ไม่สำเร็จ");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "อัปเดตโปรไฟล์ไม่สำเร็จ"
            );
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg font-semibold animate-pulse">กำลังโหลด...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-2xl mx-auto px-6 py-24">
                <div className="bg-white rounded-2xl shadow p-8">
                    <h1 className="text-2xl font-bold mb-6">แก้ไขโปรไฟล์</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-28 h-28 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-gray-500">
                                        {name?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>

                            <label className="mt-4 cursor-pointer text-blue-500">
                                เปลี่ยนรูปโปรไฟล์
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">ชื่อ</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded-lg px-4 py-3 outline-none"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block mb-2 font-medium">อีเมล</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border rounded-lg px-4 py-3 outline-none"
                                required
                            />
                        </div>

                        <div className="mb-6 text-sm text-gray-600">
                            สถานะยืนยันอีเมล:{" "}
                            <span className={userData?.isVerified ? "text-green-600" : "text-red-500"}>
                                {userData?.isVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;