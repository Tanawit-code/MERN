import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {

    const BackendUrl = "http://localhost:5000";

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

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
        getUserData
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;