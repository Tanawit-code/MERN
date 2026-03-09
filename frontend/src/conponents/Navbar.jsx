import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ()=> {
    const navigate = useNavigate()

    return(
        <diV className="items-center p-4 sm:p-6 sm:px-24 absolute top-0 ">
            <button onClick={()=> navigate('/login')}></button>
            <button className="flex items-center gap-2 border border-gray-500 rounded-fukk px-6 py-2 text-gray-800 hover:bg:gray-100">
             Login </button>
        </diV>
    )
}

export default Navbar