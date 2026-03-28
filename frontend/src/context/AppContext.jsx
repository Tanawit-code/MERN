import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../config/api";



// เป็นที่เก็บ state กลางของแอป เช่น:
// isLoggedIn
// userData
// isLoading
// ฟังก์ชัน logout

// ทำให้หลายหน้าเข้าถึงข้อมูลผู้ใช้ที่ล็อกอินอยู่ได้โดยไม่ต้องส่ง props ต่อกันยาว ๆ

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const BackendUrl = API_BASE;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    axios.defaults.withCredentials = true;

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${BackendUrl}/api/auth/member`);

            if (data.success) {
                setIsLoggedIn(true);
                setUserData(data.user);
            } else {
                setIsLoggedIn(false);
                setUserData(null);
            }
        } catch (error) {
            setIsLoggedIn(false);
            setUserData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            const { data } = await axios.post(`${BackendUrl}/api/auth/logout`);

            if (data.success) {
                setIsLoggedIn(false);
                setUserData(null);
                toast.success("ออกจากระบบสำเร็จ");
            } else {
                toast.error(data.message || "ผิดพลาดในการออกจากระบบ");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    const value = {
        BackendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData,
        logout,
        isLoading,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;