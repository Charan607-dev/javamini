import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Trash2, PlusCircle, ArrowLeft } from 'lucide-react'
import skillService from '../services/skillService'
import authService from '../services/authService'

export default function MySkills() {
    const navigate = useNavigate()
    const [user] = useState(() => authService.getCurrentUser())
    const [skills, setSkills] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

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
        <main className="ss-page">
            <div className="ss-container">
                <header className="ss-header">
                    <div>
                        <Link to="/dashboard" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#6366f1', textDecoration: 'none' }}>
                            <ArrowLeft size={16} /> Back to dashboard
                        </Link>
                        <p className="ss-eyebrow">YOUR TEACHING PORTFOLIO</p>
                        <h1 className="ss-title">My Skills</h1>
                        <p className="ss-subtitle">Skills you currently offer to exchange with other students.</p>
                    </div>

                    <div className="ss-actions">
                        <Link to="/add-skill" className="ss-button ss-button-primary">
                            <PlusCircle size={16} /> Add new skill
                        </Link>
                    </div>
                </header>

                {loading ? (
                    <p style={{ color: '#6b7280', padding: '30px 0' }}>Loading your skills...</p>
                ) : skills.length === 0 ? (
                    <div className="ss-empty" style={{ background: '#ffffff', borderRadius: 12, padding: 32, border: '1px solid #e5e7eb' }}>
                        You haven't listed any skills yet.
                        <div style={{ marginTop: 16 }}>
                            <Link to="/add-skill" className="ss-button ss-button-primary">
                                Add your first skill
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="ss-list">
                        {skills.map(skill => (
                            <article key={skill.id} className="ss-booking-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 className="ss-card-title">
                                        <GraduationCap size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                                        {skill.title}
                                    </h3>
                                    <p className="ss-card-text"><strong>Category:</strong> {skill.category || 'General'}</p>
                                    <p className="ss-card-text"><strong>Level:</strong> {skill.level || 'Beginner'}</p>
                                    <p className="ss-card-text">{skill.description}</p>
                                    {skill.wants && (
                                        <p className="ss-card-text" style={{ color: '#4338ca' }}>
                                            <strong>Looking to learn:</strong> {skill.wants}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(skill.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8 }}
                                    title="Delete skill"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
