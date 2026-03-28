// รวมฟังก์ชันเรียก API กลุ่ม เช่น:
// getGroups
// getGroupById
// createGroup
// deleteGroup
// joinGroup
// leaveGroup
// getGroupPosts

// ไฟล์นี้ทำให้หน้า frontend ไม่ต้องเขียน fetch(...) ซ้ำเยอะ ๆ
import { API_URL } from "../config/api";

const GROUP_API_URL = `${API_URL}/groups`;

const handleResponse = async (res) => {
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาด");
    }

    return data;
};

export const getGroups = async () => {
    const res = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(res);
};

export const getGroupById = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(res);
};

export const createGroup = async (formData) => {
    const res = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    return handleResponse(res);
};

export const updateGroup = async (groupId, formData) => {
    const res = await fetch(`${API_URL}/${groupId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
    });
    return handleResponse(res);
};

export const deleteGroup = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse(res);
};

export const joinGroup = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}/join`, {
        method: "POST",
        credentials: "include",
    });
    return handleResponse(res);
};

export const leaveGroup = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}/leave`, {
        method: "POST",
        credentials: "include",
    });
    return handleResponse(res);
};

export const getGroupPosts = async (groupId) => {
    const res = await fetch(`${API_URL}/${groupId}/posts`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(res);
};