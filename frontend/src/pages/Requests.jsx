import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRightLeft, Check, X, Calendar } from 'lucide-react'
import requestService from '../services/requestService'
import authService from '../services/authService'
import { pageVariants, pageTransition, staggerContainer, staggerChild, fadeUp } from '../utils/animations'

function StatusBadge({ status }) {
    const colour = {
        Accepted:  'var(--success)',
        Confirmed: 'var(--success)',
        Rejected:  'var(--error)',
        Requested: 'var(--warning)',
    }[status] || 'var(--text-secondary)'

    return (
        <motion.span
            style={{ fontWeight: 600, color: colour }}
            key={status}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
            {status}
        </motion.span>
    )
}

export default function Requests() {
    const navigate = useNavigate()
    const [user]     = useState(() => authService.getCurrentUser())
    const [incoming, setIncoming] = useState([])
    const [outgoing, setOutgoing] = useState([])
    const [loading,  setLoading]  = useState(true)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        async function fetchRequests() {
            setLoading(true)
            try {
                const inReqs  = await requestService.getRequestsByTeacher(user.email)
                const outReqs = await requestService.getRequestsByStudent(user.email)
                setIncoming(inReqs)
                setOutgoing(outReqs)
            } catch (err) {
                console.warn('Could not fetch requests:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchRequests()
    }, [user, navigate])

    async function handleStatus(id, newStatus) {
        try {
            await requestService.updateStatus(id, newStatus)
            setIncoming(incoming.map(r => r.id === id ? { ...r, status: newStatus } : r))
        } catch (err) {
            alert(err.message || 'Could not update status.')
        }
    }

    const loadingEl = (
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
            <span style={{ marginLeft: 6 }}>Loading requests...</span>
        </motion.div>
    )

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
                        <h1 className="ss-title">Exchange Requests</h1>
                        <p className="ss-subtitle">Manage skill swap proposals from fellow students.</p>
                    </div>
                </motion.header>

                {/* Incoming */}
                <motion.section
                    className="ss-panel"
                    style={{ marginBottom: 32 }}
                    {...fadeUp}
                    transition={{ duration: 0.42, delay: 0.1 }}
                >
                    <h2 className="ss-panel-title" style={{ marginBottom: 16 }}>
                        Incoming Requests for Your Skills
                    </h2>

                    {loading ? loadingEl : incoming.length === 0 ? (
                        <motion.p
                            style={{ color: 'var(--text-secondary)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            No incoming requests right now.
                        </motion.p>
                    ) : (
                        <motion.div
                            className="ss-list"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {incoming.map(req => (
                                <motion.article
                                    key={req.id}
                                    className="ss-booking-card"
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    variants={staggerChild}
                                    whileHover={{ y: -2, scale: 1.005, transition: { duration: 0.18 } }}
                                    layout
                                >
                                    <div>
                                        <h3 className="ss-card-title">{req.title}</h3>
                                        <p className="ss-card-text">From: <strong>{req.student}</strong> ({req.studentEmail})</p>
                                        <p className="ss-card-text">Offered in exchange: <strong>{req.exchangeSkill}</strong></p>
                                        <p className="ss-card-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Date: {req.date} at {req.time} · Status: <StatusBadge status={req.status} />
                                        </p>
                                    </div>
                                    <AnimatePresence>
                                        {req.status === 'Requested' && (
                                            <motion.div
                                                style={{ display: 'flex', gap: 8 }}
                                                initial={{ opacity: 0, scale: 0.85 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                            >
                                                <motion.button
                                                    onClick={() => handleStatus(req.id, 'Accepted')}
                                                    className="ss-button ss-button-primary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px' }}
                                                    whileHover={{ scale: 1.06, y: -1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Check size={16} /> Accept
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleStatus(req.id, 'Rejected')}
                                                    className="ss-button"
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', color: 'var(--error)' }}
                                                    whileHover={{ scale: 1.06, y: -1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <X size={16} /> Reject
                                                </motion.button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </motion.section>

                {/* Outgoing */}
                <motion.section
                    className="ss-panel"
                    {...fadeUp}
                    transition={{ duration: 0.42, delay: 0.2 }}
                >
                    <h2 className="ss-panel-title" style={{ marginBottom: 16 }}>Your Outgoing Requests</h2>

                    {loading ? loadingEl : outgoing.length === 0 ? (
                        <motion.p
                            style={{ color: 'var(--text-secondary)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            You haven't requested any skills yet.
                        </motion.p>
                    ) : (
                        <motion.div
                            className="ss-list"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {outgoing.map(req => (
                                <motion.article
                                    key={req.id}
                                    className="ss-booking-card"
                                    variants={staggerChild}
                                    whileHover={{ y: -2, scale: 1.005, transition: { duration: 0.18 } }}
                                    layout
                                >
                                    <h3 className="ss-card-title">{req.title}</h3>
                                    <p className="ss-card-text">Teacher: <strong>{req.teacher}</strong></p>
                                    <p className="ss-card-text">Your offer: <strong>{req.exchangeSkill}</strong></p>
                                    <p className="ss-card-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Date: {req.date} at {req.time} · Status: <StatusBadge status={req.status} />
                                    </p>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </motion.section>
            </div>
        </motion.main>
    )
}
