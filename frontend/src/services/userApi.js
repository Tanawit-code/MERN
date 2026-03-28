import axios from "axios";
import { API_URL } from "../config/api";

const API = axios.create({
    baseURL: `${API_URL}/profile`,
    withCredentials: true,
});

export const getMyProfileApi = () => API.get("/me");
export const updateProfileApi = (formData) => API.put("/me", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});