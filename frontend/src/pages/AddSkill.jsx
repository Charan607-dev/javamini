import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import skillService from '../services/skillService'
import authService from '../services/authService'

export default function AddSkill() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        title: '', category: 'Technology', description: '',
        level: 'Beginner', wants: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function update(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function submit(e) {
        e.preventDefault()
        setError('')

        const user = authService.getCurrentUser()
        if (!user) {
            navigate('/login')
            return
        }

        setLoading(true)
        try {
            await skillService.createSkill({
                ...form,
                userId: user.id || user.email,
                ownerEmail: user.email,
                ownerName: user.name
            })
            navigate('/explore')
        } catch (err) {
            setError(err.message || 'Failed to publish skill. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <main className="inner-page">
                <div className="auth-card skill-form-card">
                    <Link to="/dashboard" className="back-link"><ArrowLeft size={16} /> Dashboard</Link>
                    <div className="add-skill-icon"><PlusCircle size={25} /></div>
                    <span className="section-kicker">SHARE WHAT YOU KNOW</span>
                    <h1>Offer a <span className="gradient-text">skill.</span></h1>
                    <p className="auth-subtitle">Tell other students what you can teach and what you want to learn in return.</p>

                    {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

                    <form onSubmit={submit}>
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

                        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                            {loading ? 'Publishing...' : 'Publish my skill'}
                        </button>
                    </form>
                </div>
            </main>
        </>
    )
}
