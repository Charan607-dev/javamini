import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import authService from '../services/authService'

export default function Login() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('password123')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            try {
                // First try standard login
                await authService.login(email, password || 'password123')
            } catch (loginErr) {
                // If not found or credentials mismatch, register automatically if name provided
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
        <div className="auth-page">
            <Link to="/" className="back-link"><ArrowLeft size={17} /> Back home</Link>

            <div className="auth-card">
                <Link to="/" className="brand auth-brand">
                    <span className="brand-icon"><Zap size={20} /></span>
                    Skill<span className="accent">Swap</span>
                </Link>

                <span className="section-kicker">WELCOME TO SKILLSWAP</span>
                <h1>Let's get you<br />back to learning.</h1>
                <p className="auth-subtitle">Enter your details to open your student dashboard.</p>

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Your name</label>
                    <input id="name" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Enter your name" required />

                    <label htmlFor="email">Email address</label>
                    <input id="email" type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@college.edu" required />

                    <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                        {loading ? 'Connecting...' : 'Open dashboard'} <ArrowLeft className="button-arrow" size={17} />
                    </button>
                </form>

                <p className="auth-switch">New to SkillSwap? <Link to="/register">Create an account</Link></p>
                <p className="demo-note">Connected to Spring Boot REST backend</p>
            </div>
        </div>
    )
}
