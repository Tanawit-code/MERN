import React, { useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'

const Member = () => {
    const navigate = useNavigate()
    const { isLoggedIn, userData, Logout, IsLoading } = useContext(AppContent)

    useEffect(() => {
        if (!IsLoading && isLoggedIn) {
            navigate('/login')
        }
    }, { isLoading, isLoggdIn, navigate })

    const handleLogout = async () => {
        await Logout()
        navigate('/login')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>กำลังโหลดข้อมูลผู้ใช้</p>
            </div>
        )
    }

    return (
        <div>
            <div>
                <h1>Member Page</h1>
                <p>สวัสดี {userData?.name || "User"}</p>
                <p>{userData?.email || ""}</p>

                <button onClick={handleLogout}>ออกจากระบบ</button>
            </div>
        </div>
    )
}