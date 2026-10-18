import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Explore from './pages/Explore'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import AddSkill from './pages/AddSkill'
import ScheduleCalendar from './pages/ScheduleCalendar'
import FindMatches from './pages/FindMatches'
import MySkills from './pages/MySkills'
import Requests from './pages/Requests'
import Sessions from './pages/Sessions'
import Profile from './pages/Profile'
import Reviews from './pages/Reviews'

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule-calendar" element={<ScheduleCalendar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore-skills" element={<Explore />} />
        <Route path="/find-matches" element={<FindMatches />} />
        <Route path="/my-skills" element={<MySkills />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/add-skill" element={<AddSkill />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
