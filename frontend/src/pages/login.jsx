import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { BackendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowResend(false);
  };

  const validatePassword = (value) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasMinLength = value.length >= 8;

    if (!hasMinLength) {
      return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    }

    if (!hasUpperCase) {
      return "รหัสผ่านต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว";
    }

    return null;
  };

  const handleResendVerification = async () => {
    try {
      const { data } = await axios.post(
        `${BackendUrl}/api/auth/resend-verification`,
        { email },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "ส่งอีเมลยืนยันใหม่แล้ว");
      } else {
        toast.error(data.message || "ส่งอีเมลยืนยันใหม่ไม่สำเร็จ");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "ส่งอีเมลยืนยันใหม่ไม่สำเร็จ"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowResend(false);

    try {
      setLoading(true);

      if (mode === "signup") {
        if (!name.trim()) {
          toast.error("กรุณากรอกชื่อ");
          setLoading(false);
          return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
          toast.error(passwordError);
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast.error("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
          setLoading(false);
          return;
        }

        const { data } = await axios.post(
          `${BackendUrl}/api/auth/register`,
          {
            name,
            email,
            password,
            confirmPassword,
          },
          { withCredentials: true }
        );

        if (data.success) {
          if (data.token) localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
          await getUserData?.();

          toast.success("สมัครสมาชิกสำเร็จ และจำลองส่งอีเมลแล้ว");

          resetForm();
          navigate("/");
          return;
        }

        toast.error(data.message || "สมัครสมาชิกไม่สำเร็จ");
        return;
      }

      const { data } = await axios.post(
        `${BackendUrl}/api/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      if (data.success) {
        if (data.token) localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        await getUserData?.();
        toast.success(data.message || "สมัครสมาชิกสำเร็จ");
        resetForm();
        navigate("/");
        return;
      }

      toast.error(data.message || "เข้าสู่ระบบไม่สำเร็จ");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาดในการเชื่อมต่อ";

      toast.error(message);

      if (mode === "login" && message.includes("ยืนยันอีเมล")) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm text-gray-500 hover:text-blue-600 mb-4 cursor-pointer"
        >
          ← กลับหน้าแรก
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {mode === "login"
              ? "ยินดีต้อนรับกลับ เข้าสู่ระบบเพื่อใช้งานต่อ"
              : "สร้างบัญชีใหม่เพื่อเริ่มใช้งาน"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ชื่อ
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              รหัสผ่าน
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 cursor-pointer"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {mode === "signup" && (
              <p className="text-xs text-slate-500 mt-1">
                รหัสผ่านต้องมีอย่างน้อย 8 ตัว และมีตัวพิมพ์ใหญ่ 1 ตัว
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ยืนยันรหัสผ่าน
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 cursor-pointer"
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition disabled:opacity-60 cursor-pointer"
          >
            {loading
              ? "กำลังดำเนินการ..."
              : mode === "login"
                ? "เข้าสู่ระบบ"
                : "สมัครสมาชิก"}
          </button>
        </form>

        {showResend && (
          <button
            type="button"
            onClick={handleResendVerification}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-2xl transition cursor-pointer"
          >
            ส่งลิงก์ยืนยันอีเมลใหม่
          </button>
        )}

        <div className="mt-6 text-center text-sm text-slate-500">
          {mode === "login" ? (
            <>
              ยังไม่มีบัญชี?
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setShowResend(false);
                }}
                className="ml-1 text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
              >
                สมัครสมาชิก
              </button>
            </>
          ) : (
            <>
              มีบัญชีอยู่แล้ว?
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setShowResend(false);
                }}
                className="ml-1 text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;