import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRightLeft, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react'
import matchService from '../services/matchService'
import authService from '../services/authService'
import requestService from '../services/requestService'
import { pageVariants, pageTransition, staggerContainer, staggerChild } from '../utils/animations'

function SpinningSparkles() {
    return (
        <motion.div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ marginBottom: 16 }}
            >
                <Sparkles size={36} style={{ color: 'var(--primary)' }} />
            </motion.div>
            <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity }}
            >
                Computing intelligent skill matches for you...
            </motion.p>
        </motion.div>
    )
}

export default function FindMatches() {
    const navigate = useNavigate()
    const [user]           = useState(() => authService.getCurrentUser())
    const [matches,        setMatches]        = useState([])
    const [loading,        setLoading]        = useState(true)
    const [bookingSuccess, setBookingSuccess] = useState('')

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        async function loadMatches() {
            setLoading(true)
            try {
                const results = await matchService.findMatches(user.email)
                setMatches(results)
            } catch (err) {
                console.warn('Could not compute matches:', err)
            } finally {
                setLoading(false)
            }
        }
        loadMatches()
    }, [user, navigate])

    async function handleQuickExchange(candidateSkill, offeredSkill) {
        try {
            const today = new Date()
            today.setDate(today.getDate() + 2)
            const dateStr = today.toISOString().split('T')[0]
            await requestService.createRequest({
                skillId: candidateSkill.id,
                exchangeSkillId: offeredSkill ? offeredSkill.id : '',
                date: dateStr,
                time: '14:00',
                studentId: user.id || user.email,
                notes: `Mutual match exchange offer: ${offeredSkill?.title || 'Knowledge Exchange'}`
            })
            setBookingSuccess(`Exchange request sent to ${candidateSkill.ownerName || 'student'}!`)
            setTimeout(() => setBookingSuccess(''), 4000)
        } catch (err) {
            alert(err.message || 'Could not send request.')
        }
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
                        <p className="ss-eyebrow">SMART SKILL MATCHING</p>
                        <h1 className="ss-title">
                            Mutual <span className="gradient-text">Matches</span>
                        </h1>
                        <p className="ss-subtitle">
                            Students who want to learn what you teach, and can teach what you want to learn.
                        </p>
                    </div>
                </motion.header>

                {/* Success toast */}
                <AnimatePresence>
                    {bookingSuccess && (
                        <motion.div
                            key="toast"
                            initial={{ opacity: 0, y: -16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0,   scale: 1 }}
                            exit={{ opacity: 0, y: -16, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                            style={{ padding: '12px 18px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--success-faint)' }}
                        >
                            <CheckCircle size={18} /> {bookingSuccess}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SpinningSparkles />
                        </motion.div>
                    ) : matches.length === 0 ? (
                        <motion.section
                            key="empty"
                            className="explore-empty"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ textAlign: 'center', padding: '60px 20px' }}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                            >
                                <BookOpen size={40} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                            </motion.div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>No direct matches yet</h2>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 20px' }}>
                                Try adding more skills with specific "wants" in your profile, or explore all student listings.
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                                    <Link to="/add-skill" className="ss-button ss-button-primary">Add a Skill</Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Link to="/explore" className="ss-button">Explore All Skills</Link>
                                </motion.div>
                            </div>
                        </motion.section>
                    ) : (
                        <motion.div
                            key="matches"
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {matches.map(({ candidateSkill, offeredSkill, matchScore, isMutual }) => (
                                <motion.article
                                    key={candidateSkill.id}
                                    className="ss-booking-card"
                                    variants={staggerChild}
                                    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.18 } }}
                                    layout
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span className="explore-category">{candidateSkill.category || 'General'}</span>
                                        <motion.span
                                            style={{
                                                fontSize: '0.8rem', fontWeight: 700,
                                                padding: '4px 10px', borderRadius: 20,
                                                background: isMutual ? 'var(--success-light)' : 'var(--primary-light)',
                                                color:      isMutual ? 'var(--success)' : 'var(--primary)',
                                            }}
                                            initial={{ scale: 0.85 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 380 }}
                                        >
                                            {matchScore}% Match {isMutual && '🔥 Mutual'}
                                        </motion.span>
                                    </div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>{candidateSkill.title}</h2>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                                        {candidateSkill.description || 'No description provided.'}
                                    </p>
                                    <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                                        <p style={{ margin: '0 0 4px', color: 'var(--text-secondary)' }}>
                                            <strong>Offered by:</strong> {candidateSkill.ownerName || 'Student'}
                                        </p>
                                        <p style={{ margin: 0, color: 'var(--success)' }}>
                                            <strong>They want:</strong> {candidateSkill.wants || 'Open to learn'}
                                        </p>
                                        {offeredSkill && (
                                            <p style={{ margin: '6px 0 0', color: 'var(--primary)' }}>
                                                <strong>Your exchange:</strong> {offeredSkill.title}
                                            </p>
                                        )}
                                    </div>
                                    <motion.button
                                        type="button"
                                        className="ss-button ss-button-primary"
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                                        onClick={() => handleQuickExchange(candidateSkill, offeredSkill)}
                                        whileHover={{ scale: 1.03, y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <ArrowRightLeft size={16} /> Request Exchange
                                    </motion.button>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.main>
    )
}
