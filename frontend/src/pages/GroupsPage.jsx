import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getGroups, createGroup, deleteGroup } from "../services/groupApi";
import Navbar from "../components/Navbar";

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");

    const fetchGroups = async () => {
        try {
            setLoadingGroups(true);
            const data = await getGroups();
            if (data.success) {
                setGroups(data.groups || []);
            }
        } catch (error) {
            console.error("โหลดกลุ่มไม่สำเร็จ", error);
        } finally {
            setLoadingGroups(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async () => {
        if (!name.trim()) return alert("กรุณาใส่ชื่อกลุ่ม");

        try {
            setCreating(true);
            const data = await createGroup({
                name: name.trim(),
                description: description.trim(),
            });

            if (data.success) {
                setName("");
                setDescription("");
                fetchGroups();
            } else {
                alert(data.message || "สร้างกลุ่มไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
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

                                <button
                                    onClick={handleCreateGroup}
                                    disabled={creating}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
                                >
                                    {creating ? "กำลังสร้าง..." : "สร้างกลุ่ม"}
                                </button>
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <p className="text-sm text-gray-500">
                                    จำนวนกลุ่มทั้งหมด
                                </p>
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
                                {filteredGroups.map((group) => (
                                    <div
                                        key={group._id}
                                        className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
                                    >
                                        <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-500" />

                                        <div className="p-5 -mt-10">
                                            <div className="w-16 h-16 rounded-2xl bg-white shadow flex items-center justify-center text-2xl">
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
                                                        className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl transition font-medium"
                                                    >
                                                        เข้าดู
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDeleteGroup(group._id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl transition font-medium cursor-pointer"
                                                    >
                                                        ลบ
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupsPage;