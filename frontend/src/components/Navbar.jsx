import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
    Zap,
    CalendarDays,
    LayoutDashboard,
    ArrowUpRight,
    LogOut,
    UserRound,
    Sun,
    Moon,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()

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

                        <NavLink to="/find-matches">
                            Matches
                        </NavLink>

                        <NavLink to="/calendar">
                            <CalendarDays size={16} />
                            Bookings
                        </NavLink>
                    </>
                )}
            </div>

            <div className="nav-actions">
                {/* Theme toggle */}
                <button
                    type="button"
                    className="nav-theme-toggle"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={theme === 'dark' ? 'Dark mode (click to switch to light mode)' : 'Light mode (click to switch to dark mode)'}
                >
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

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
