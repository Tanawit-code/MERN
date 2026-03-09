import React, { useState } from 'react'
import { useNavigate} from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return(
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
          {state ==='Sign Up' && (

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <label className="text-gray-400">ชื่อ-นามสกุล</label>
            <input
              onChange={e => setName(e.target.value)}
              value={name}
              className='bg-transparent outline-none'type='text'placeholder='ระบุชื่อ-นามสกุล' required/> 
          </div>
          )}

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <label className="text-gray-400">อีเมล</label>
            <input
              onChange={e => setEmail(e.target.value)}
              value={email}
              className='bg-transparent outline-none'type='email'placeholder='ระบุอีเมล' required/> 
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <label className="text-gray-400">รหัสผ่าน</label>
            <input
              onChange={e => setPassword(e.target.value)}
              value={password}
              className='bg-transparent outline-none'type='text'placeholder='ระบุรหัสผ่าน' required/> 
          </div>

          

        </form>

        <button onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}>
          คลิกเพื่อกรอกข้อมูลเพื่อเข้าสู่ระบบ {state === 'Sign Up' ? 'Login' : 'Sign Up'}
        </button>



          {state === "Sign Up" ?(
            <p className='text-center text-sm text-gray-400'>

              มีบัญชีอยู่แล้ว <span onClick={()=> setState('login')} className='text-indigo-500 cursor-pointer hover:text-indigo-300'></span>
              
            </p>
           ) : (
            <p className='text-center text-sm text-gray-400'>
              ยังไม่มีบัญชี? <span onClick={()=> setState('Sign Up')} className='text-indigo-500 cursor-pointer hover:text-indigo-300'></span>
            </p>

          )}
      </div>

    </div>
  )
}

export default Login