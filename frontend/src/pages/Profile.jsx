import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, School, ArrowLeft, LogOut } from 'lucide-react'
import authService from '../services/authService'
import skillService from '../services/skillService'
import { pageVariants, pageTransition, staggerContainer, staggerChild, scaleIn } from '../utils/animations'

export default function Profile() {
    const navigate = useNavigate()
    const [user] = useState(() => authService.getCurrentUser())
    const [skillsCount, setSkillsCount] = useState(0)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        skillService.getSkillsByOwner(user.email).then(list => {
            if (Array.isArray(list)) setSkillsCount(list.length)
        }).catch(() => {})
    }, [user, navigate])

    function handleLogout() {
        authService.logout()
        navigate('/login')
    }

    if (!user) return null

    const initial = (user.name || 'S').charAt(0).toUpperCase()

    const fields = [
        { Icon: User,   label: 'Full Name',           value: user.name },
        { Icon: Mail,   label: 'Email Address',        value: user.email },
        { Icon: School, label: 'College / University', value: user.college || 'Registered University' },
    ]

    return (
        <motion.main
            className="ss-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
        >
            <div className="ss-container" style={{ maxWidth: 640 }}>

                {/* Header */}
                <motion.header
                    className="ss-header"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <div>
                        <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.15 }}>
                            <Link
                                to="/dashboard"
                                className="back-link"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--primary)', textDecoration: 'none' }}
                            >
                                <ArrowLeft size={16} /> Back to dashboard
                            </Link>
                        </motion.div>
                        <h1 className="ss-title">Student Profile</h1>
                        <p className="ss-subtitle">Your SkillSwap account details and community presence.</p>
                    </div>
                </motion.header>

                {/* Profile card */}
                <motion.div
                    {...scaleIn}
                    style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        padding: 32,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                >
                    {/* Avatar row */}
                    <motion.div
                        style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                    >
                        <motion.div
                            style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                                color: '#ffffff', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold',
                            }}
                            whileHover={{ scale: 1.08, rotate: 4 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                        >
                            {initial}
                        </motion.div>
                        <div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-main)' }}>{user.name}</h2>
                            <motion.span
                                style={{ fontSize: '0.85rem', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 12 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                Active Student
                            </motion.span>
                        </div>
                    </motion.div>

                    {/* Info fields */}
                    <motion.div
                        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {fields.map(({ Icon, label, value }) => (
                            <motion.div
                                key={label}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}
                                variants={staggerChild}
                                whileHover={{ x: 4, transition: { duration: 0.15 } }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 8, scale: 1.15 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                >
                                    <Icon size={18} style={{ color: 'var(--primary)' }} />
                                </motion.div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>{label}</span>
                                    <strong style={{ color: 'var(--text-main)' }}>{value}</strong>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Footer row */}
                    <motion.div
                        style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Skills offered:</span>
                            <motion.strong
                                style={{ marginLeft: 6, color: 'var(--primary)' }}
                                key={skillsCount}
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                            >
                                {skillsCount}
                            </motion.strong>
                        </div>

                        <motion.button
                            onClick={handleLogout}
                            className="ss-button"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--error)' }}
                            whileHover={{ scale: 1.04, x: -2 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <LogOut size={16} /> Log out
                        </motion.button>
                    </motion.div>
                </motion.div>

            </div>
        </motion.main>
    )
}
