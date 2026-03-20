import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/user",
    withCredentials: true,
});

export const getMyProfileApi = () => API.get("/me");
export const updateProfileApi = (formData) => API.put("/me", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});