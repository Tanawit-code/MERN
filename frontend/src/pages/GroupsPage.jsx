import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getGroups, createGroup, deleteGroup } from "../services/groupApi";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (path.startsWith("data:image") || path.startsWith("data:video")) {
        return path;
    }

    if (path.startsWith("/")) {
        return `${API_BASE}${path}`;
    }

    return `${API_BASE}/${path}`;
};

const normalizeGroup = (group) => ({
    ...group,
    groupImage: group?.groupImage || group?.coverImage || group?.image || "",
});

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [groupImage, setGroupImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");
    const [currentUserId, setCurrentUserId] = useState("");

    const fetchGroups = async () => {
        try {
            setLoadingGroups(true);
            const data = await getGroups();

            if (data.success) {
                const normalizedGroups = (data.groups || []).map(normalizeGroup);
                setGroups(normalizedGroups);
            } else {
                setGroups([]);
            }
        } catch (error) {
            console.error("โหลดกลุ่มไม่สำเร็จ", error);
            setGroups([]);
        } finally {
            setLoadingGroups(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/member`, {
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

    useEffect(() => {
        fetchGroups();
        fetchCurrentUser();
    }, []);

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

    const handleCreateGroup = async () => {
        if (!name.trim()) {
            return alert("กรุณาใส่ชื่อกลุ่ม");
        }

        try {
            setCreating(true);

            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("description", description.trim());

            if (groupImage) {
                formData.append("groupImage", groupImage);
            }

            const data = await createGroup(formData);

            if (data.success) {
                setName("");
                setDescription("");
                setGroupImage(null);

                if (previewImage && previewImage.startsWith("blob:")) {
                    URL.revokeObjectURL(previewImage);
                }
                setPreviewImage("");

                fetchGroups();
            } else {
                alert(data.message || "สร้างกลุ่มไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            alert(error.message || "เกิดข้อผิดพลาด");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        const ok = window.confirm("ต้องการลบกลุ่มนี้ใช่ไหม?");
        if (!ok) return;

        try {
            const data = await deleteGroup(groupId);

            if (data.success) {
                setGroups((prev) => prev.filter((group) => group._id !== groupId));
            } else {
                alert(data.message || "ลบกลุ่มไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            alert(error.message || "เกิดข้อผิดพลาด");
        }
    };

    const filteredGroups = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return groups;

        return groups.filter((group) => {
            const groupName = group.name?.toLowerCase() || "";
            const groupDescription = group.description?.toLowerCase() || "";
            return (
                groupName.includes(keyword) || groupDescription.includes(keyword)
            );
        });
    }, [groups, search]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-6xl mx-auto pt-20 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow p-5 sticky top-24">
                            <div className="mb-5">
                                <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    สร้างกลุ่มของคุณ หรือเข้าดูกลุ่มที่มีอยู่
                                </p>
                            </div>

                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="ชื่อกลุ่ม"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                                />

                                <textarea
                                    placeholder="รายละเอียดกลุ่ม"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-400"
                                />

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none cursor-pointer"
                                />

                                {previewImage && (
                                    <img
                                        src={previewImage}
                                        alt="preview"
                                        className="w-full h-44 object-cover rounded-xl border"
                                    />
                                )}

                                <button
                                    onClick={handleCreateGroup}
                                    disabled={creating}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
                                >
                                    {creating ? "กำลังสร้าง..." : "สร้างกลุ่ม"}
                                </button>
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <p className="text-sm text-gray-500">จำนวนกลุ่มทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {groups.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow p-4 mb-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        รายการกลุ่ม
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        ค้นหาและเข้าดูกลุ่มที่คุณสนใจ
                                    </p>
                                </div>

                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อกลุ่ม..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-72 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        {loadingGroups ? (
                            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                                กำลังโหลดกลุ่ม...
                            </div>
                        ) : filteredGroups.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow p-10 text-center">
                                <div className="text-5xl mb-3">👥</div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    ยังไม่มีกลุ่มที่แสดง
                                </h3>
                                <p className="text-gray-500 mt-2">
                                    ลองสร้างกลุ่มใหม่ หรือค้นหาด้วยคำอื่น
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredGroups.map((group) => {
                                    const ownerId =
                                        group.owner?._id || group.owner?.id || group.owner;
                                    const isOwner = ownerId === currentUserId;

                                    return (
                                        <div
                                            key={group._id}
                                            className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
                                        >
                                            <div className="relative h-32 rounded-t-2xl overflow-hidden bg-gray-200">
                                                {group.groupImage ? (
                                                    <>
                                                        <img
                                                            src={getImageUrl(group.groupImage)}
                                                            alt={group.name}
                                                            className="w-full h-full object-cover object-top"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20" />
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <div className="w-16 h-16 -mt-12 rounded-2xl bg-white shadow flex items-center justify-center text-2xl border relative z-10">
                                                    👥
                                                </div>

                                                <div className="mt-4">
                                                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                                                        {group.name}
                                                    </h3>

                                                    <p className="text-sm text-gray-500 mt-1 min-h-[40px] line-clamp-2">
                                                        {group.description || "ยังไม่มีรายละเอียดกลุ่ม"}
                                                    </p>

                                                    <div className="mt-3 flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">
                                                            สมาชิก {group.members?.length || 0} คน
                                                        </span>

                                                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                                            Group
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex gap-2">
                                                        <Link
                                                            to={`/groups/${group._id}`}
                                                            className={`text-center text-white px-4 py-2.5 rounded-xl transition font-medium ${isOwner ? "flex-1" : "w-full"
                                                                } bg-green-500 hover:bg-green-600`}
                                                        >
                                                            เข้าดู
                                                        </Link>

                                                        {isOwner && (
                                                            <>
                                                                <Link
                                                                    to={`/groups/edit/${group._id}`}
                                                                    className="flex-1 text-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl transition font-medium"
                                                                >
                                                                    แก้ไข
                                                                </Link>

                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteGroup(group._id)
                                                                    }
                                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl transition font-medium cursor-pointer"
                                                                >
                                                                    ลบ
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupsPage;