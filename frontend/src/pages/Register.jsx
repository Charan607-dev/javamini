import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import authService from '../services/authService'

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', college: '', password: 'password123'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    function update(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await authService.register({
                name: form.name.trim(),
                email: form.email.trim(),
                college: form.college.trim(),
                password: form.password || 'password123'
            })
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Registration failed. Please check your details.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <Link to="/" className="back-link"><ArrowLeft size={17} /> Back home</Link>
            <div className="auth-card register-card">
                <Link to="/" className="brand auth-brand">
                    <span className="brand-icon"><Zap size={20} /></span>
                    Skill<span className="accent">Swap</span>
                </Link>

                <span className="section-kicker">JOIN THE COMMUNITY</span>
                <h1>Every skill has<br />something to offer.</h1>
                <p className="auth-subtitle">Create your student profile to get started.</p>

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="reg-name">Full name</label>
                    <input id="reg-name" name="name" value={form.name}
                        onChange={update} placeholder="Your full name" required />

                    <label htmlFor="reg-email">Email address</label>
                    <input id="reg-email" name="email" type="email" value={form.email}
                        onChange={update} placeholder="you@college.edu" required />

                    <label htmlFor="college">College / University</label>
                    <input id="college" name="college" value={form.college}
                        onChange={update} placeholder="Your institution" required />

                    <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create student profile'} <ArrowLeft className="button-arrow" size={17} />
                    </button>
                </form>

                <p className="auth-switch">Already started? <Link to="/login">Log in</Link></p>
                <p className="demo-note">Connected to Spring Boot REST backend</p>
            </div>
        </div>
    )
}
