
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', college: ''
    })
    const navigate = useNavigate()

    function update(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function handleSubmit(e) {
        e.preventDefault()
        localStorage.setItem('skillswap_user', JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            college: form.college.trim()
        }))
        navigate('/dashboard')
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

                    <button className="btn btn-primary auth-submit" type="submit">
                        Create student profile <ArrowLeft className="button-arrow" size={17} />
                    </button>
                </form>

                <p className="auth-switch">Already started? <Link to="/login">Log in</Link></p>
                <p className="demo-note">Prototype registration · No account is created on a server</p>
            </div>
        </div>
    )
}
