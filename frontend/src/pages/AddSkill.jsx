
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, PlusCircle } from 'lucide-react'

export default function AddSkill() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        title: '', category: 'Technology', description: '',
        level: 'Beginner', wants: ''
    })

    function update(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function submit(e) {
        e.preventDefault()

        const user = JSON.parse(localStorage.getItem('skillswap_user') || 'null')
        if (!user) {
            navigate('/login')
            return
        }

        const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]')
        skills.push({
            id: crypto.randomUUID(),
            ownerEmail: user.email,
            ownerName: user.name,
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            wants: form.wants.trim(),
            createdAt: new Date().toISOString()
        })

        localStorage.setItem('skillswap_skills', JSON.stringify(skills))
        navigate('/explore')
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

                        <button className="btn btn-primary auth-submit" type="submit">
                            Publish my skill
                        </button>
                    </form>
                </div>
            </main>
        </>
    )
}
