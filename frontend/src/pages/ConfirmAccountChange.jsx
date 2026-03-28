import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ConfirmAccountChange = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const confirmChange = async () => {
            try {
                const token = searchParams.get("token");

                if (!token) {
                    toast.error("ไม่พบ token สำหรับยืนยัน");
                    navigate("/login");
                    return;
                }

                const { data } = await axios.get(
                    `http://localhost:5000/api/auth/confirm-change?token=${token}`
                );

                if (data.success) {
                    toast.success(data.message || "ยืนยันการเปลี่ยนข้อมูลสำเร็จ");
                    navigate("/login");
                } else {
                    toast.error(data.message || "ยืนยันไม่สำเร็จ");
                    navigate("/settings");
                }
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "เกิดข้อผิดพลาดในการยืนยัน"
                );
                navigate("/settings");
            }
        };

        confirmChange();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg">
            กำลังยืนยันการเปลี่ยนข้อมูล...
        </div>
    );
};

export default ConfirmAccountChange;