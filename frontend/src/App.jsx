import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Member from "./pages/Member"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/member" element={<Member />} />
    </Routes>
  )
}

export default App