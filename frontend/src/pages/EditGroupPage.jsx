import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getGroupById, updateGroup } from "../services/groupApi";
import { API_URL, getImageUrl } from "../config/api";

const EditGroupPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [currentUserId, setCurrentUserId] = useState("");
    const [group, setGroup] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [groupImage, setGroupImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/member`, {
                credentials: "include",
            });

            if (!res.ok) {
                console.error("โหลด member ไม่สำเร็จ:", res.status);
                setCurrentUserId("");
                return "";
            }

            const data = await res.json();

            const userId =
                data.user?._id ||
                data.user?.id ||
                data._id ||
                data.id ||
                "";

            setCurrentUserId(userId);
            return userId;
        } catch (error) {
            console.error("โหลดผู้ใช้ปัจจุบันไม่สำเร็จ", error);
            setCurrentUserId("");
            return "";
        }
    };

    const fetchGroup = async () => {
        try {
            setLoading(true);

            const userId = await fetchCurrentUser();
            const data = await getGroupById(groupId);

            if (!data.success) {
                alert(data.message || "ไม่พบกลุ่ม");
                navigate("/groups");
                return;
            }

            const groupData = data.group;
            const ownerId =
                groupData.owner?._id || groupData.owner?.id || groupData.owner;

            if (!userId || !ownerId || userId !== ownerId) {
                alert("เฉพาะเจ้าของกลุ่มเท่านั้นที่แก้ไขข้อมูลได้");
                navigate("/groups");
                return;
            }

            setGroup(groupData);
            setName(groupData.name || "");
            setDescription(groupData.description || "");
            setPreviewImage(
                groupData.groupImage ? getImageUrl(groupData.groupImage) : ""
            );
        } catch (error) {
            console.error("โหลดข้อมูลกลุ่มไม่สำเร็จ", error);
            alert("โหลดข้อมูลกลุ่มไม่สำเร็จ");
            navigate("/groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [groupId]);

    useEffect(() => {
        return () => {
            if (previewImage && previewImage.startsWith("blob:")) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (previewImage && previewImage.startsWith("blob:")) {
            URL.revokeObjectURL(previewImage);
        }

        setGroupImage(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return alert("กรุณาใส่ชื่อกลุ่ม");
        }

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("description", description.trim());

            if (groupImage) {
                formData.append("groupImage", groupImage);
            }

            const data = await updateGroup(groupId, formData);

            if (data.success) {
                alert("แก้ไขกลุ่มสำเร็จ");
                navigate(`/groups/${groupId}`);
            } else {
                alert(data.message || "แก้ไขกลุ่มไม่สำเร็จ");
            }
        } catch (error) {
            console.error("UPDATE GROUP ERROR:", error);
            alert(error.message || "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-4xl mx-auto pt-24 px-4">
                    <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                        กำลังโหลดข้อมูลกลุ่ม...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-4xl mx-auto pt-24 px-4">
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="relative h-60 bg-gray-200">
                        {previewImage ? (
                            <>
                                <img
                                    src={previewImage}
                                    alt="group preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/25" />
                            </>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                        )}

                        <div className="absolute bottom-5 left-5 text-white">
                            <p className="text-sm text-white/90">แก้ไขข้อมูลกลุ่ม</p>
                            <h1 className="text-3xl font-bold drop-shadow">
                                {name || "ชื่อกลุ่ม"}
                            </h1>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    จัดการข้อมูลกลุ่ม
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    เฉพาะเจ้าของกลุ่มเท่านั้นที่สามารถแก้ไขข้อมูลนี้ได้
                                </p>
                            </div>

                            {group && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/groups/${groupId}`)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl transition"
                                >
                                    กลับไปหน้ากลุ่ม
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ชื่อกลุ่ม
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="กรอกชื่อกลุ่ม"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    รายละเอียดกลุ่ม
                                </label>
                                <textarea
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="กรอกรายละเอียดกลุ่ม"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    เปลี่ยนรูปกลุ่ม
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    รองรับไฟล์รูปตามที่ backend อนุญาต
                                </p>
                            </div>

                            {group?.owner && (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">เจ้าของกลุ่ม</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        {group.owner.profilePic ? (
                                            <img
                                                src={group.owner.profilePic}
                                                alt={group.owner.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {(group.owner.name || "G").charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {group.owner.name || "ไม่ทราบชื่อ"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {group.owner.email || ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
                                >
                                    {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate(`/groups/${groupId}`)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-medium transition"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditGroupPage;