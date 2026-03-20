import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");
  const message = searchParams.get("message");

  const isSuccess = status === "success";

  const getErrorText = () => {
    if (message === "missing-token") return "ไม่พบ token สำหรับยืนยันอีเมล";
    if (message === "invalid-or-expired")
      return "ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว";
    return "เกิดข้อผิดพลาดในการยืนยันอีเมล";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              ยืนยันอีเมลสำเร็จ
            </h2>
            <p className="text-gray-600 mb-6">
              ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600"
            >
              ไปหน้าเข้าสู่ระบบ
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ยืนยันอีเมลไม่สำเร็จ
            </h2>
            <p className="text-gray-600 mb-6">{getErrorText()}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;