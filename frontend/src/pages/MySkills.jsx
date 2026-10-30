import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Trash2, PlusCircle, ArrowLeft } from 'lucide-react'
import skillService from '../services/skillService'
import authService from '../services/authService'
import { pageVariants, pageTransition, staggerContainer, staggerChild, fadeUp } from '../utils/animations'

function LoadingDots({ label = 'Loading...' }) {
    return (
        <motion.div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-secondary)', padding: '30px 0' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {[0, 1, 2].map(i => (
                <motion.span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}
                    animate={{ y: [0, -7, 0] }} transition={{ duration: 0.6, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }} />
            ))}
            <span style={{ marginLeft: 6 }}>{label}</span>
        </motion.div>
    )
}

export default function MySkills() {
    const navigate = useNavigate()
    const [user]   = useState(() => authService.getCurrentUser())
    const [skills, setSkills] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        async function fetchSkills() {
            setLoading(true)
            try {
                const userSkills = await skillService.getSkillsByOwner(user.email)
                setSkills(userSkills)
            } catch (err) {
                console.warn('Could not fetch user skills:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchSkills()
    }, [user, navigate])

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to remove this skill listing?')) return
        try {
            await skillService.deleteSkill(id)
            setSkills(skills.filter(s => s.id !== id))
        } catch (err) {
            alert(err.message || 'Could not delete skill.')
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
                        <p className="ss-eyebrow">YOUR TEACHING PORTFOLIO</p>
                        <h1 className="ss-title">My Skills</h1>
                        <p className="ss-subtitle">Skills you currently offer to exchange with other students.</p>
                    </div>
                    <div className="ss-actions">
                        <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                            <Link to="/add-skill" className="ss-button ss-button-primary">
                                <PlusCircle size={16} /> Add new skill
                            </Link>
                        </motion.div>
                    </div>
                </motion.header>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading"><LoadingDots label="Loading your skills..." /></motion.div>
                    ) : skills.length === 0 ? (
                        <motion.div
                            key="empty"
                            className="ss-empty"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            You haven't listed any skills yet.
                            <div style={{ marginTop: 16 }}>
                                <Link to="/add-skill" className="ss-button ss-button-primary">Add your first skill</Link>
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
                            {skills.map(skill => (
                                <motion.article
                                    key={skill.id}
                                    className="ss-booking-card"
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                                    variants={staggerChild}
                                    whileHover={{ y: -2, scale: 1.005, transition: { duration: 0.18 } }}
                                    layout
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.22 } }}
                                >
                                    <div>
                                        <h3 className="ss-card-title">
                                            <GraduationCap size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                                            {skill.title}
                                        </h3>
                                        <p className="ss-card-text"><strong>Category:</strong> {skill.category || 'General'}</p>
                                        <p className="ss-card-text"><strong>Level:</strong> {skill.level || 'Beginner'}</p>
                                        <p className="ss-card-text">{skill.description}</p>
                                        {skill.wants && (
                                            <p className="ss-card-text" style={{ color: 'var(--primary)' }}>
                                                <strong>Looking to learn:</strong> {skill.wants}
                                            </p>
                                        )}
                                    </div>
                                    <motion.button
                                        onClick={() => handleDelete(skill.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 8 }}
                                        title="Delete skill"
                                        whileHover={{ scale: 1.18, rotate: -10 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Trash2 size={18} />
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
