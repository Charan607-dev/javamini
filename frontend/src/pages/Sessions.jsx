import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react'
import sessionService from '../services/sessionService'
import authService from '../services/authService'

export default function Sessions() {
    const navigate = useNavigate()
    const [user] = useState(() => authService.getCurrentUser())
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        async function fetchSessions() {
            setLoading(true)
            try {
                const upcoming = await sessionService.getUpcomingSessions()
                setSessions(upcoming)
            } catch (err) {
                console.warn('Could not fetch sessions:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchSessions()
    }, [user, navigate])

    return (
        <main className="ss-page">
            <div className="ss-container">
                <header className="ss-header">
                    <div>
                        <Link to="/dashboard" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#6366f1', textDecoration: 'none' }}>
                            <ArrowLeft size={16} /> Back to dashboard
                        </Link>
                        <h1 className="ss-title">Confirmed Study Sessions</h1>
                        <p className="ss-subtitle">Upcoming skill exchange lessons and peer mentoring appointments.</p>
                    </div>

                    <div className="ss-actions">
                        <Link to="/calendar" className="ss-button ss-button-primary">
                            <Calendar size={16} /> Booking Calendar
                        </Link>
                    </div>
                </header>

                {loading ? (
                    <p style={{ color: '#6b7280' }}>Loading sessions...</p>
                ) : sessions.length === 0 ? (
                    <div className="ss-empty" style={{ background: '#ffffff', borderRadius: 12, padding: 32, border: '1px solid #e5e7eb' }}>
                        No upcoming sessions yet. Accept exchange requests to schedule sessions.
                        <div style={{ marginTop: 16 }}>
                            <Link to="/explore" className="ss-button ss-button-primary">Find Skills to Learn</Link>
                        </div>
                    </div>
                ) : (
                    <div className="ss-list">
                        {sessions.map(s => (
                            <article key={s.id} className="ss-booking-card" style={{ borderLeft: '4px solid #10b981' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                                    <h3 className="ss-card-title" style={{ margin: 0 }}>{s.title}</h3>
                                </div>
                                <p className="ss-card-text">
                                    <strong>Partner:</strong> {s.teacherEmail === user.email ? s.student : s.teacher}
                                </p>
                                <p className="ss-card-text">
                                    <strong>Exchange:</strong> {s.exchangeSkill}
                                </p>
                                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.85rem', color: '#4b5563' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={14} /> {s.date}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={14} /> {s.time}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
