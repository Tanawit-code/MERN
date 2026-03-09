import React, { useState } from 'react'

const Login = () => {

  const [state, setState] = useState('Sign Up')

  return(
    <div className='flex'>

      <div>

        <h2>{state === 'Sign Up' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h2>

        <p>
          {state === 'Sign Up'
            ? 'กรุณากรอกข้อมูลเพื่อเข้าสู่สมาชิก'
            : 'กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ'}
        </p>

        <form>
          {state ==='Sign Up' && (

          <div className='mb-4 items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <label className="text-gray-400">ชื่อ-นามสกุล</label>
            <input
              className='bg-transparent outline-none'type='text'placeholder='' required/> 
          </div>
          )}
          <div className='mb-4 items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <label className="text-gray-400">รหัสผ่าน</label>
            <input
              className='bg-transparent outline-none'type='text'
              placeholder='' required
            />
          </div>

          <div className='mb-4 items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <label className="text-gray-400">อีเมล</label>
            <input
              className='bg-transparent outline-none'type='text'
              placeholder='' required
            />
          </div>

        </form>

        <button onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}>
          คลิกเพื่อกรอกข้อมูลเพื่อเข้าสู่ระบบ {state === 'Sign Up' ? 'Login' : 'Sign Up'}
        </button>

        <button onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}>
          คลิกเพื่อเพื่อเข้าสู่สมาชิก {state === 'Sign Up' ? 'Login' : 'Sign Up'}
        </button>

      </div>

    </div>
  )
}

export default Login