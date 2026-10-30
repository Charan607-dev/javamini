import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, GraduationCap, TrendingUp, BookOpen } from 'lucide-react'
import skillService from '../services/skillService'
import authService from '../services/authService'
import { pageVariants, pageTransition, staggerContainer, staggerChild, fadeUp } from '../utils/animations'

const USER_KEY   = 'skillswap_user'
const SKILLS_KEY = 'skillswap_skills'

function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || 'null')
        return value ?? fallback
    } catch {
        return fallback
    }
}

// Animated counter hook
function useCounter(target, duration = 900) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (target === 0) { setCount(0); return }
        const step = Math.max(1, Math.floor(target / (duration / 30)))
        let current = 0
        const timer = setInterval(() => {
            current = Math.min(current + step, target)
            setCount(current)
            if (current >= target) clearInterval(timer)
        }, 30)
        return () => clearInterval(timer)
    }, [target, duration])
    return count
}

function StatCard({ label, value, icon: Icon, delay = 0 }) {
    const displayValue = useCounter(value)
    return (
        <motion.div
            className="ss-stat"
            variants={staggerChild}
            whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.18 } }}
        >
            {Icon && <Icon size={18} style={{ color: 'var(--primary)', marginBottom: 8 }} />}
            <span className="ss-stat-label">{label}</span>
            <motion.strong
                className="ss-stat-value"
                key={displayValue}
            >
                {displayValue}
            </motion.strong>
        </motion.div>
    )
}

export default function Dashboard() {
    const navigate = useNavigate()
    const [user,   setUser]   = useState(() => readJSON(USER_KEY, null))
    const [skills, setSkills] = useState(() => readJSON(SKILLS_KEY, []))

    const refresh = useCallback(async () => {
        setUser(readJSON(USER_KEY, null))
        try {
            const liveSkills = await skillService.getAllSkills()
            if (Array.isArray(liveSkills) && liveSkills.length > 0) {
                setSkills(liveSkills)
            } else {
                setSkills(readJSON(SKILLS_KEY, []))
            }
        } catch {
            setSkills(readJSON(SKILLS_KEY, []))
        }
    }, [])

    useEffect(() => {
        refresh()
        window.addEventListener('storage', refresh)
        window.addEventListener('skillswap-skills-updated', refresh)
        return () => {
            window.removeEventListener('storage', refresh)
            window.removeEventListener('skillswap-skills-updated', refresh)
        }
    }, [refresh])

    useEffect(() => {
        if (!readJSON(USER_KEY, null)) navigate('/login')
    }, [navigate])

    if (!user) return null

    const email      = (user.email || '').toLowerCase()
    const mySkills   = skills.filter(s => (s.ownerEmail || '').toLowerCase() === email)
    const otherSkills= skills.filter(s => (s.ownerEmail || '').toLowerCase() !== email)

    function logout() {
        localStorage.removeItem(USER_KEY)
        navigate('/login')
    }

    return (
        <motion.main
            className="ss-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
        >
            <div className="ss-container">

                {/* Header */}
                <motion.header
                    className="ss-header"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <div>
                        <p className="ss-eyebrow">Student Dashboard</p>
                        <h1 className="ss-title">Welcome, {user.name}</h1>
                        <p className="ss-subtitle">Manage your skills and discover new learning opportunities.</p>
                    </div>
                    <motion.div
                        className="ss-actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                            <Link className="ss-button ss-button-primary" to="/explore">Explore skills</Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link className="ss-button" to="/schedule-calendar">
                                <CalendarDays size={15} /> Schedule Calendar
                            </Link>
                        </motion.div>
                        <motion.button
                            className="ss-button"
                            onClick={logout}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Log out
                        </motion.button>
                    </motion.div>
                </motion.header>

                {/* Stats */}
                <motion.section
                    className="ss-stats"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <StatCard label="My skill listings"   value={mySkills.length}    icon={GraduationCap} delay={0} />
                    <StatCard label="Skills to explore"   value={otherSkills.length} icon={BookOpen}      delay={1} />
                    <StatCard label="Exchange potential"  value={Math.min(mySkills.length * otherSkills.length, 99)} icon={TrendingUp} delay={2} />
                </motion.section>

                {/* My skills panel */}
                <motion.section
                    className="ss-panel"
                    {...fadeUp}
                    transition={{ duration: 0.44, delay: 0.1 }}
                >
                    <div className="ss-panel-heading">
                        <div>
                            <h2 className="ss-panel-title">My skill listings</h2>
                            <p className="ss-panel-description">Skills you have shared with other students.</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                            <Link className="ss-button ss-button-primary" to="/add-skill">+ Add a skill</Link>
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        {mySkills.length === 0 ? (
                            <motion.div
                                className="ss-empty"
                                key="empty-my"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                You haven't listed a skill yet. Add your first skill to start sharing your knowledge.
                                <div style={{ marginTop: 16 }}>
                                    <Link className="ss-button ss-button-primary" to="/add-skill">Add your first skill</Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="ss-list"
                                key="list-my"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                {mySkills.map((skill) => (
                                    <motion.article
                                        className="ss-booking-card"
                                        key={skill.id}
                                        variants={staggerChild}
                                        whileHover={{ y: -2, scale: 1.005, transition: { duration: 0.18 } }}
                                        layout
                                    >
                                        <h3 className="ss-card-title">
                                            <GraduationCap size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                                            {skill.title}
                                        </h3>
                                        <p className="ss-card-text">{skill.category || 'General'}</p>
                                        <p className="ss-card-text">{skill.description || 'No description added.'}</p>
                                        {skill.level && <p className="ss-card-text">Level: {skill.level}</p>}
                                        {skill.wantedSkill && <p className="ss-card-text">Looking to learn: {skill.wantedSkill}</p>}
                                    </motion.article>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* Other skills panel */}
                <motion.section
                    className="ss-panel"
                    {...fadeUp}
                    transition={{ duration: 0.44, delay: 0.2 }}
                >
                    <div className="ss-panel-heading">
                        <div>
                            <h2 className="ss-panel-title">Discover new skills</h2>
                            <p className="ss-panel-description">Find students who can teach you something new.</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                            <Link className="ss-button ss-button-primary" to="/explore">Explore skills</Link>
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        {otherSkills.length === 0 ? (
                            <motion.div
                                className="ss-empty"
                                key="empty-other"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                No other students' skills are available yet. Check back later.
                            </motion.div>
                        ) : (
                            <motion.div
                                className="ss-list"
                                key="list-other"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                {otherSkills.slice(0, 3).map((skill) => (
                                    <motion.article
                                        className="ss-booking-card"
                                        key={skill.id}
                                        variants={staggerChild}
                                        whileHover={{ y: -2, scale: 1.005, transition: { duration: 0.18 } }}
                                        layout
                                    >
                                        <h3 className="ss-card-title">{skill.title}</h3>
                                        <p className="ss-card-text">Category: {skill.category || 'General'}</p>
                                        <p className="ss-card-text">Shared by: {skill.ownerName || 'Student'}</p>
                                        <p className="ss-card-text">{skill.description || 'No description added.'}</p>
                                    </motion.article>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

            </div>
        </motion.main>
    )
}