// รวมฟังก์ชันเรียก API กลุ่ม เช่น:
// getGroups
// getGroupById
// createGroup
// deleteGroup
// joinGroup
// leaveGroup
// getGroupPosts

// ไฟล์นี้ทำให้หน้า frontend ไม่ต้องเขียน fetch(...) ซ้ำเยอะ ๆ

const API_URL = "http://localhost:5000/api/groups";

export const getGroups = async () => {
    const res = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
    });
    return res.json();
};

export const getGroupById = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}`, {
        method: "GET",
        credentials: "include",
    });
    return res.json();
};

export const createGroup = async (groupData) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(groupData),
    });
    return res.json();
};

export const deleteGroup = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}`, {
        method: "DELETE",
        credentials: "include",
    });
    return res.json();
};

export const joinGroup = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}/join`, {
        method: "POST",
        credentials: "include",
    });
    return res.json();
};

export const leaveGroup = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}/leave`, {
        method: "POST",
        credentials: "include",
    });
    return res.json();
};

export const getGroupPosts = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}/posts`, {
        method: "GET",
        credentials: "include",
    });
    return res.json();
};