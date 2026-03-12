import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {

  const navigate = useNavigate()
  const { BackendUrl, setIsLoggedIn, getUserData } = useContext(AppContext)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
          navigate('/member')
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
          navigate('/member')
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
}

return (
  <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>

    <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>

      <p onClick={() => Navigate('/')} className='cursor-pointer'> กลับหน้าแรก</p>

      <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign Up' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h2>

      <p className='text-center text-sm'>
        {state === 'Sign Up'
          ? 'กรุณากรอกข้อมูลเพื่อเข้าสู่สมาชิก'
          : 'กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ'}
      </p>

      <form>
        {state === 'Sign Up' && (

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <label className="text-gray-400">ชื่อ-นามสกุล</label>
            <input
              onChange={e => setName(e.target.value)}
              value={name}
              className='bg-transparent outline-none' type='text' placeholder='ระบุชื่อ-นามสกุล' required />
          </div>
        )}

        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
          <label className="text-gray-400">อีเมล</label>
          <input
            onChange={e => setEmail(e.target.value)}
            value={email}
            className='bg-transparent outline-none' type='email' placeholder='ระบุอีเมล' required />
        </div>

        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
          <label className="text-gray-400">รหัสผ่าน</label>
          <input
            onChange={e => setPassword(e.target.value)}
            value={password}
            className='bg-transparent outline-none' type='text' placeholder='ระบุรหัสผ่าน' required />
        </div>



      </form>

      <button onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}>
        คลิกเพื่อกรอกข้อมูลเพื่อเข้าสู่ระบบ {state === 'Sign Up' ? 'Login' : 'Sign Up'}
      </button>

      <form onSubmit={onSubmitHandler}>
        <button
          type="submit"
          className="w-full py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition"
        >
          {state === "Sign Up" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </button>
      </form>

      {state === "Sign Up" ? (
        <p className='text-center text-sm text-gray-400'>

          มีบัญชีอยู่แล้ว <span onClick={() => setState('login')} className='text-indigo-500 cursor-pointer hover:text-indigo-300'></span>

        </p>
      ) : (
        <p className='text-center text-sm text-gray-400'>
          ยังไม่มีบัญชี? <span onClick={() => setState('Sign Up')} className='text-indigo-500 cursor-pointer hover:text-indigo-300'></span>
        </p>

      )}
    </div>

  </div>
)



export default Login