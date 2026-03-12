import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Member from "./pages/Member"

import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<Member />} />

      </Routes>
    </div>
  )
}

export default App