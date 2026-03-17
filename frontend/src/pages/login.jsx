import React, { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import { toast } from "react-toastify"

const Login = () => {

  const navigate = useNavigate()
  const { BackendUrl, setIsLoggedIn, getUserData } = useContext(AppContext)

  const [state, setState] = useState("Sign Up")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {

      setIsSubmitting(true)
      axios.defaults.withCredentials = true

      if (state === "Sign Up") {

        const { data } = await axios.post(`${BackendUrl}/api/auth/register`, {
          name,
          email,
          password
        })

        if (data.success) {
          toast.success("สมัครสมาชิกสำเร็จ")
          setIsLoggedIn(true)
          await getUserData()
          navigate("/member")
        }

      } else {

        const { data } = await axios.post(`${BackendUrl}/api/auth/login`, {
          email,
          password
        })

        if (data.success) {
          toast.success("เข้าสู่ระบบสำเร็จ")
          setIsLoggedIn(true)
          await getUserData()
          navigate("/member")
        }

      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "เกิดปัญหาในการเชื่อมต่อกับ server"
      )

    } finally {

      setIsSubmitting(false)

    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-blue-200 to-purple-400">

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">

        <p
          onClick={() => navigate("/Home")}
          className="cursor-pointer mb-4"
        >
          ← กลับหน้าแรก
        </p>

        <h2 className="text-3xl font-semibold text-white text-center mb-3">

          {state === "Sign Up" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}

        </h2>

        <p className="text-center text-sm mb-6">

          {state === "Sign Up"
            ? "กรุณากรอกข้อมูลเพื่อสมัครสมาชิก"
            : "กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ"}

        </p>

        <form onSubmit={onSubmitHandler}>

          {state === "Sign Up" && (

            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">

              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none w-full"
                type="text"
                placeholder="ชื่อ-นามสกุล"
                required
              />

            </div>

          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">

            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none w-full"
              type="email"
              placeholder="อีเมล"
              required
            />

          </div>

          <div className="mb-6 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">

            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="bg-transparent outline-none w-full"
              type="password"
              placeholder="รหัสผ่าน"
              required
            />

          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition"
          >

            {isSubmitting
              ? "กำลังดำเนินการ..."
              : state === "Sign Up"
                ? "สมัครสมาชิก"
                : "เข้าสู่ระบบ"}

          </button>

        </form>

        <p className="text-center text-sm text-gray-400 mt-6">

          {state === "Sign Up" ? (
            <>
              มีบัญชีอยู่แล้ว ?
              <span
                onClick={() => setState("Login")}
                className="text-indigo-500 cursor-pointer ml-1"
              >
                เข้าสู่ระบบ
              </span>
            </>
          ) : (
            <>
              ยังไม่มีบัญชี ?
              <span
                onClick={() => setState("Sign Up")}
                className="text-indigo-500 cursor-pointer ml-1"
              >
                สมัครสมาชิก
              </span>
            </>
          )}

        </p>

      </div>

    </div>
  )
}

export default Login