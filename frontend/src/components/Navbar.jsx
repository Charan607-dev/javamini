import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Zap,
    CalendarDays,
    LayoutDashboard,
    ArrowUpRight,
    LogOut,
    UserRound,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// ─── Animated Sun / Moon SVG toggle ──────────────────────────────────────────
// Inspired by the dhxwhy/sun-moon-theme-toggle from 21st.dev.
// Pure SVG + Framer Motion — no external dependency needed.

const sunVariants = {
    hidden:  { opacity: 0, rotate: -90, scale: 0.5 },
    visible: { opacity: 1, rotate: 0,   scale: 1   },
    exit:    { opacity: 0, rotate: 90,  scale: 0.5 },
}

const moonVariants = {
    hidden:  { opacity: 0, rotate: 90,  scale: 0.5 },
    visible: { opacity: 1, rotate: 0,   scale: 1   },
    exit:    { opacity: 0, rotate: -90, scale: 0.5 },
}

const iconTransition = {
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1],
}

// Inline SVG sun with animated rays
function SunIcon() {
    const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315]
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {/* Centre circle */}
            <circle cx="12" cy="12" r="4" />
            {/* Animated rays */}
            {rayAngles.map((angle, i) => {
                const rad = (angle * Math.PI) / 180
                const x1 = 12 + 7.5 * Math.cos(rad)
                const y1 = 12 + 7.5 * Math.sin(rad)
                const x2 = 12 + 10 * Math.cos(rad)
                const y2 = 12 + 10 * Math.sin(rad)
                return (
                    <motion.line
                        key={angle}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.03, ease: 'easeOut' }}
                    />
                )
            })}
        </svg>
    )
}

// Inline SVG moon with animated crescent
function MoonIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <motion.path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            />
        </svg>
    )
}

function ThemeToggle({ theme, toggleTheme }) {
    const isDark = theme === 'dark'

    return (
        <motion.button
            type="button"
            className="nav-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Dark mode — click to switch to light mode' : 'Light mode — click to switch to dark mode'}
            whileHover={{ scale: 1.1, rotate: isDark ? -15 : 15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.span
                        key="moon"
                        variants={moonVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={iconTransition}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <MoonIcon />
                    </motion.span>
                ) : (
                    <motion.span
                        key="sun"
                        variants={sunVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={iconTransition}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <SunIcon />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
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
                {/* Animated sun / moon theme toggle */}
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

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
