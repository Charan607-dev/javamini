import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Zap } from 'lucide-react'
import authService from '../services/authService'
import { scaleIn, staggerContainer, staggerChild } from '../utils/animations'

export default function Login() {
    const [name,     setName]     = useState('')
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('password123')
    const [error,    setError]    = useState('')
    const [loading,  setLoading]  = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            try {
                await authService.login(email, password || 'password123')
            } catch (loginErr) {
                if (name.trim()) {
                    await authService.register({
                        name: name.trim(),
                        email: email.trim(),
                        password: password || 'password123',
                        college: 'Student Institution'
                    })
                } else {
                    throw loginErr
                }
            }
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Login failed. Please check your details.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            className="auth-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
            >
                <Link to="/" className="back-link"><ArrowLeft size={17} /> Back home</Link>
            </motion.div>

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.3 }}
                >
                    <Link to="/" className="brand auth-brand">
                        <motion.span
                            className="brand-icon"
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Zap size={20} />
                        </motion.span>
                        Skill<span className="accent">Swap</span>
                    </Link>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    style={{ marginTop: 8 }}
                >
                    <motion.span variants={staggerChild} className="section-kicker">WELCOME TO SKILLSWAP</motion.span>
                    <motion.h1 variants={staggerChild}>Let's get you<br />back to learning.</motion.h1>
                    <motion.p variants={staggerChild} className="auth-subtitle">
                        Enter your details to open your student dashboard.
                    </motion.p>
                </motion.div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0,  scale: 1 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem', padding: '10px 14px', background: 'var(--error-faint)', borderRadius: 8, border: '1px solid var(--error-light)' }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32, duration: 0.38 }}
                >
                    <label htmlFor="name">Your name</label>
                    <input id="name" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Enter your name" required />

                    <label htmlFor="email">Email address</label>
                    <input id="email" type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@college.edu" required />

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
                                Connecting...
                            </motion.span>
                        ) : (
                            <>Open dashboard <ArrowLeft className="button-arrow" size={17} /></>
                        )}
                    </motion.button>
                </motion.form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="auth-switch">New to SkillSwap? <Link to="/register">Create an account</Link></p>
                    <p className="demo-note">Connected to Spring Boot REST backend</p>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
