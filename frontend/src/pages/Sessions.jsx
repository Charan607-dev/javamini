import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react'
import sessionService from '../services/sessionService'
import authService from '../services/authService'
import { pageVariants, pageTransition, staggerContainer, staggerChild, fadeUp } from '../utils/animations'

// Animated dot loading indicator
function LoadingDots({ label = 'Loading...' }) {
    return (
        <motion.div
            style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {[0, 1, 2].map(i => (
                <motion.span
                    key={i}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
            <span style={{ marginLeft: 6 }}>{label}</span>
        </motion.div>
    )
}

export default function Sessions() {
    const navigate = useNavigate()
    const [user]     = useState(() => authService.getCurrentUser())
    const [sessions, setSessions] = useState([])
    const [loading,  setLoading]  = useState(true)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        async function fetchSessions() {
            setLoading(true)
            try {
                const upcoming = await sessionService.getUpcomingSessions()
                setSessions(upcoming)
            } catch (err) {
                console.warn('Could not fetch sessions:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchSessions()
    }, [user, navigate])

    return (
        <motion.main
            className="ss-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
        >
            <div className="ss-container">
                <motion.header
                    className="ss-header"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div>
                        <Link to="/dashboard" className="ss-back-link">
                            <ArrowLeft size={16} /> Back to dashboard
                        </Link>
                        <h1 className="ss-title">Confirmed Study Sessions</h1>
                        <p className="ss-subtitle">Upcoming skill exchange lessons and peer mentoring appointments.</p>
                    </div>
                    <div className="ss-actions">
                        <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                            <Link to="/calendar" className="ss-button ss-button-primary">
                                <Calendar size={16} /> Booking Calendar
                            </Link>
                        </motion.div>
                    </div>
                </motion.header>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading">
                            <LoadingDots label="Loading sessions..." />
                        </motion.div>
                    ) : sessions.length === 0 ? (
                        <motion.div
                            key="empty"
                            className="ss-empty"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            No upcoming sessions yet. Accept exchange requests to schedule sessions.
                            <div style={{ marginTop: 16 }}>
                                <Link to="/explore" className="ss-button ss-button-primary">Find Skills to Learn</Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            className="ss-list"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {sessions.map(s => (
                                <motion.article
                                    key={s.id}
                                    className="ss-booking-card"
                                    style={{ borderLeft: '4px solid var(--success)' }}
                                    variants={staggerChild}
                                    whileHover={{ y: -3, scale: 1.005, transition: { duration: 0.18 } }}
                                    layout
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <motion.div
                                            initial={{ scale: 0, rotate: -90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.2 }}
                                        >
                                            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                                        </motion.div>
                                        <h3 className="ss-card-title" style={{ margin: 0 }}>{s.title}</h3>
                                    </div>
                                    <p className="ss-card-text">
                                        <strong>Partner:</strong> {s.teacherEmail === user.email ? s.student : s.teacher}
                                    </p>
                                    <p className="ss-card-text"><strong>Exchange:</strong> {s.exchangeSkill}</p>
                                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Calendar size={14} /> {s.date}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={14} /> {s.time}
                                        </span>
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.main>
    )
}
