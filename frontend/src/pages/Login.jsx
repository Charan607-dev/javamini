
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'

export default function Login() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const navigate = useNavigate()

    function handleSubmit(e) {
        e.preventDefault()
        localStorage.setItem('skillswap_user', JSON.stringify({
            name: name.trim(),
            email: email.trim()
        }))
        navigate('/dashboard')
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

                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Your name</label>
                    <input id="name" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Enter your name" required />

                    <label htmlFor="email">Email address</label>
                    <input id="email" type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@college.edu" required />

                    <button className="btn btn-primary auth-submit" type="submit">
                        Open dashboard <ArrowLeft className="button-arrow" size={17} />
                    </button>
                </form>

                <p className="auth-switch">New to SkillSwap? <Link to="/register">Create an account</Link></p>
                <p className="demo-note">Prototype login · Not real authentication</p>
            </div>
        </div>
    )
}
