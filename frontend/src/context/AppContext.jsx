import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {

    const BackendUrl = "http://localhost:5000";

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

            const { data } = await axios.get(`${BackendUrl}/api/auth/logout`);

            if (data.success) {
                setIsLoggedIn(false);
                setUserData(null);
                toast.success("ออกจากระบบสำเร็จ");
            } else {
                toast.error(data.message || "ผิดพลาดในการออกจากระบบ");
            }

        } catch (error) {

            toast.error("Logout failed");

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
        isLoading
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );

};

export default AppContextProvider;