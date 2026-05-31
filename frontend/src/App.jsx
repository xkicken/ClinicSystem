import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserDashboard from './pages/UserDashboard'
import Navbar from './navbar'

export default function App() {
  return (
    <BrowserRouter>
        <Navbar></Navbar>
      <Routes>
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
        </BrowserRouter>
  )
}