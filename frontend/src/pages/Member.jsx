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
    })
}