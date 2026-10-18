import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRightLeft, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react'
import matchService from '../services/matchService'
import authService from '../services/authService'
import requestService from '../services/requestService'

export default function FindMatches() {
    const navigate = useNavigate()
    const [user] = useState(() => authService.getCurrentUser())
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [bookingSuccess, setBookingSuccess] = useState('')

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        async function loadMatches() {
            setLoading(true)
            try {
                const results = await matchService.findMatches(user.email)
                setMatches(results)
            } catch (err) {
                console.warn('Could not compute matches:', err)
            } finally {
                setLoading(false)
            }
        }

        loadMatches()
    }, [user, navigate])

    async function handleQuickExchange(candidateSkill, offeredSkill) {
        try {
            const today = new Date()
            today.setDate(today.getDate() + 2)
            const dateStr = today.toISOString().split('T')[0]

            await requestService.createRequest({
                skillId: candidateSkill.id,
                exchangeSkillId: offeredSkill ? offeredSkill.id : '',
                date: dateStr,
                time: '14:00',
                studentId: user.id || user.email,
                notes: `Mutual match exchange offer: ${offeredSkill?.title || 'Knowledge Exchange'}`
            })

            setBookingSuccess(`Exchange request sent to ${candidateSkill.ownerName || 'student'}!`)
            setTimeout(() => setBookingSuccess(''), 4000)
        } catch (err) {
            alert(err.message || 'Could not send request.')
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
                        <p className="ss-eyebrow">SMART SKILL MATCHING</p>
                        <h1 className="ss-title">
                            Mutual <span className="gradient-text">Matches</span>
                        </h1>
                        <p className="ss-subtitle">
                            Students who want to learn what you teach, and can teach what you want to learn.
                        </p>
                    </div>
                </header>

                {bookingSuccess && (
                    <div style={{ padding: '12px 18px', background: '#ecfdf5', color: '#065f46', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={18} /> {bookingSuccess}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                        <Sparkles size={32} style={{ animation: 'spin 2s linear infinite', margin: '0 auto 12px' }} />
                        <p>Computing intelligent skill matches for you...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <section className="explore-empty" style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                        <BookOpen size={40} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: 8 }}>No direct matches yet</h2>
                        <p style={{ color: '#6b7280', maxWidth: 480, margin: '0 auto 20px' }}>
                            Try adding more skills with specific "wants" in your profile, or explore all student listings.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <Link to="/add-skill" className="ss-button ss-button-primary">Add a Skill</Link>
                            <Link to="/explore" className="ss-button">Explore All Skills</Link>
                        </div>
                    </section>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {matches.map(({ candidateSkill, offeredSkill, matchScore, isMutual }) => (
                            <article key={candidateSkill.id} className="explore-skill-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span className="explore-category">{candidateSkill.category || 'General'}</span>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        background: isMutual ? '#ecfdf5' : '#eff6ff',
                                        color: isMutual ? '#059669' : '#2563eb'
                                    }}>
                                        {matchScore}% Match {isMutual && '🔥 Mutual'}
                                    </span>
                                </div>

                                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>{candidateSkill.title}</h2>
                                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: 16 }}>{candidateSkill.description || 'No description provided.'}</p>

                                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>
                                    <p style={{ margin: '0 0 4px', color: '#6b7280' }}>
                                        <strong>Offered by:</strong> {candidateSkill.ownerName || 'Student'}
                                    </p>
                                    <p style={{ margin: 0, color: '#059669' }}>
                                        <strong>They want:</strong> {candidateSkill.wants || 'Open to learn'}
                                    </p>
                                    {offeredSkill && (
                                        <p style={{ margin: '6px 0 0', color: '#4338ca' }}>
                                            <strong>Your exchange:</strong> {offeredSkill.title}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="ss-button ss-button-primary"
                                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                                    onClick={() => handleQuickExchange(candidateSkill, offeredSkill)}
                                >
                                    <ArrowRightLeft size={16} /> Request Exchange
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
