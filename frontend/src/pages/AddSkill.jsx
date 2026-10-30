import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import skillService from '../services/skillService'
import authService from '../services/authService'
import { pageVariants, pageTransition, staggerContainer, staggerChild } from '../utils/animations'

export default function AddSkill() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        title: '', category: 'Technology', description: '',
        level: 'Beginner', wants: ''
    })
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState('')

    function update(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function submit(e) {
        e.preventDefault()
        setError('')
        const user = authService.getCurrentUser()
        if (!user) { navigate('/login'); return }
        setLoading(true)
        try {
            await skillService.createSkill({
                ...form,
                userId:    user.id || user.email,
                ownerEmail: user.email,
                ownerName:  user.name
            })
            navigate('/explore')
        } catch (err) {
            setError(err.message || 'Failed to publish skill. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
        >
            <main className="inner-page">
                <motion.div
                    className="auth-card skill-form-card"
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Link to="/dashboard" className="back-link"><ArrowLeft size={16} /> Dashboard</Link>

                    <motion.div
                        className="add-skill-icon"
                        whileHover={{ rotate: 8, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 250 }}
                    >
                        <PlusCircle size={25} />
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.span variants={staggerChild} className="section-kicker">SHARE WHAT YOU KNOW</motion.span>
                        <motion.h1 variants={staggerChild}>
                            Offer a <span className="gradient-text">skill.</span>
                        </motion.h1>
                        <motion.p variants={staggerChild} className="auth-subtitle">
                            Tell other students what you can teach and what you want to learn in return.
                        </motion.p>
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                key="skill-error"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem', padding: '10px 14px', background: 'var(--error-faint)', borderRadius: 8, border: '1px solid var(--error-light)' }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.form
                        onSubmit={submit}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28, duration: 0.38 }}
                    >
                        <label htmlFor="skill-title">Skill you can teach</label>
                        <input id="skill-title" name="title" value={form.title} onChange={update}
                            placeholder="e.g. Python programming" required maxLength={70} />

                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={form.category} onChange={update}>
                            <option>Technology</option>
                            <option>Design</option>
                            <option>Creative</option>
                            <option>Business</option>
                            <option>Academics</option>
                            <option>Languages</option>
                            <option>Other</option>
                        </select>

                        <label htmlFor="description">What can you teach?</label>
                        <textarea id="description" name="description" value={form.description}
                            onChange={update} placeholder="Describe the topics or experience you can share..."
                            required rows={3} maxLength={500} />

                        <label htmlFor="level">Your experience level</label>
                        <select id="level" name="level" value={form.level} onChange={update}>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>

                        <label htmlFor="wants">What would you like to learn in return?</label>
                        <input id="wants" name="wants" value={form.wants} onChange={update}
                            placeholder="e.g. UI/UX design" required maxLength={100} />

                        <motion.button
                            className="btn btn-primary auth-submit"
                            type="submit"
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.03, y: -1 } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            animate={loading ? { opacity: 0.75 } : { opacity: 1 }}
                        >
                            {loading ? (
                                <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                >
                                    Publishing...
                                </motion.span>
                            ) : 'Publish my skill'}
                        </motion.button>
                    </motion.form>
                </motion.div>
            </main>
        </motion.div>
    )
}
