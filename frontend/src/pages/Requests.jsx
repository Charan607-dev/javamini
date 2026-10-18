import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, Check, X, Calendar } from 'lucide-react'
import requestService from '../services/requestService'
import authService from '../services/authService'

export default function Requests() {
    const navigate = useNavigate()
    const [user] = useState(() => authService.getCurrentUser())
    const [incoming, setIncoming] = useState([])
    const [outgoing, setOutgoing] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        async function fetchRequests() {
            setLoading(true)
            try {
                const inReqs = await requestService.getRequestsByTeacher(user.email)
                const outReqs = await requestService.getRequestsByStudent(user.email)
                setIncoming(inReqs)
                setOutgoing(outReqs)
            } catch (err) {
                console.warn('Could not fetch requests:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchRequests()
    }, [user, navigate])

    async function handleStatus(id, newStatus) {
        try {
            await requestService.updateStatus(id, newStatus)
            setIncoming(incoming.map(r => r.id === id ? { ...r, status: newStatus } : r))
        } catch (err) {
            alert(err.message || 'Could not update status.')
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
                        <h1 className="ss-title">Exchange Requests</h1>
                        <p className="ss-subtitle">Manage skill swap proposals from fellow students.</p>
                    </div>
                </header>

                <section className="ss-panel" style={{ marginBottom: 32 }}>
                    <h2 className="ss-panel-title" style={{ marginBottom: 16 }}>Incoming Requests for Your Skills</h2>
                    {loading ? (
                        <p style={{ color: '#6b7280' }}>Loading requests...</p>
                    ) : incoming.length === 0 ? (
                        <p style={{ color: '#6b7280' }}>No incoming requests right now.</p>
                    ) : (
                        <div className="ss-list">
                            {incoming.map(req => (
                                <article key={req.id} className="ss-booking-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 className="ss-card-title">{req.title}</h3>
                                        <p className="ss-card-text">From: <strong>{req.student}</strong> ({req.studentEmail})</p>
                                        <p className="ss-card-text">Offered in exchange: <strong>{req.exchangeSkill}</strong></p>
                                        <p className="ss-card-text" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                            Date: {req.date} at {req.time} · Status: <span style={{ fontWeight: 600, color: req.status === 'Accepted' || req.status === 'Confirmed' ? '#059669' : '#d97706' }}>{req.status}</span>
                                        </p>
                                    </div>
                                    {req.status === 'Requested' && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleStatus(req.id, 'Accepted')}
                                                className="ss-button ss-button-primary"
                                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px' }}
                                            >
                                                <Check size={16} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatus(req.id, 'Rejected')}
                                                className="ss-button"
                                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', color: '#ef4444' }}
                                            >
                                                <X size={16} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="ss-panel">
                    <h2 className="ss-panel-title" style={{ marginBottom: 16 }}>Your Outgoing Requests</h2>
                    {loading ? (
                        <p style={{ color: '#6b7280' }}>Loading requests...</p>
                    ) : outgoing.length === 0 ? (
                        <p style={{ color: '#6b7280' }}>You haven't requested any skills yet.</p>
                    ) : (
                        <div className="ss-list">
                            {outgoing.map(req => (
                                <article key={req.id} className="ss-booking-card">
                                    <h3 className="ss-card-title">{req.title}</h3>
                                    <p className="ss-card-text">Teacher: <strong>{req.teacher}</strong></p>
                                    <p className="ss-card-text">Your offer: <strong>{req.exchangeSkill}</strong></p>
                                    <p className="ss-card-text" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        Date: {req.date} at {req.time} · Status: <strong style={{ color: req.status === 'Accepted' || req.status === 'Confirmed' ? '#059669' : '#d97706' }}>{req.status}</strong>
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}
