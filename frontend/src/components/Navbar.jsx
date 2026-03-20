import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";


const Navbar = () => {
    const { userData } = useContext(AppContext);

    return (
        <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6 fixed top-0 z-50">

            <div className="flex items-center gap-6">
                <Link to="/member" className="font-medium hover:text-blue-500">
                    หน้าแรก
                </Link>
                <Link to="/search" className="font-medium hover:text-blue-500">
                    ค้นหา
                </Link>
                <Link to="/requests" className="font-medium hover:text-blue-500">
                    คำขอเพื่อน
                </Link>
                <Link to="/friends" className="font-medium hover:text-blue-500">
                    เพื่อน
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <p className="font-medium">{userData?.name || "User"}</p>

                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </div>
            </div>
        </div>
    );
};

export default Navbar;  