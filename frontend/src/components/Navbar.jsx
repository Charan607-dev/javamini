
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
    Zap,
    CalendarDays,
    LayoutDashboard,
    ArrowUpRight,
    LogOut,
    UserRound,
} from 'lucide-react'

export default function Navbar() {
    const navigate = useNavigate()

    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem('skillswap_user'))
        } catch {
            return null
        }
    }

    const user = getUser()

    const handleLogout = () => {
        localStorage.removeItem('skillswap_user')
        navigate('/')
        window.location.reload()
    }

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <Zap size={22} />
                <span>SkillSwap</span>
            </Link>

            <div className="nav-links">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/explore">Explore skills</NavLink>

                {user && (
                    <>
                        <NavLink to="/dashboard">
                            <LayoutDashboard size={16} />
                            Dashboard
                        </NavLink>

                        <NavLink to="/calendar">
                            <CalendarDays size={16} />
                            Bookings
                        </NavLink>
                    </>
                )}
            </div>

            <div className="nav-actions">
                {user ? (
                    <>
                        <span className="nav-user">
                            <UserRound size={16} />
                            {user.name}
                        </span>

                        <button className="nav-logout" onClick={handleLogout}>
                            <LogOut size={16} />
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="nav-cta">
                        Log in / Get started
                        <ArrowUpRight size={18} />
                    </Link>
                )}
            </div>
        </nav>
    )
}
