import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, ArrowLeft } from 'lucide-react'

export default function Reviews() {
    const [reviews] = useState([
        {
            id: '1',
            reviewer: 'Alice Johnson',
            recipient: 'Bob Smith',
            skill: 'Figma & UI Design',
            rating: 5,
            comment: 'Bob explained wireframing and design systems so clearly! Our skill swap was super productive.',
            date: '2026-10-15'
        },
        {
            id: '2',
            reviewer: 'Bob Smith',
            recipient: 'Alice Johnson',
            skill: 'Java & Spring Boot 3',
            rating: 5,
            comment: 'Alice taught me how REST controllers and service layers work. Fantastic exchange partner!',
            date: '2026-10-16'
        }
    ])

    return (
        <main className="ss-page">
            <div className="ss-container">
                <header className="ss-header">
                    <div>
                        <Link to="/dashboard" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#6366f1', textDecoration: 'none' }}>
                            <ArrowLeft size={16} /> Back to dashboard
                        </Link>
                        <h1 className="ss-title">Peer Reviews & Endorsements</h1>
                        <p className="ss-subtitle">Community feedback from completed student skill exchanges.</p>
                    </div>
                </header>

                <div className="ss-list">
                    {reviews.map(r => (
                        <article key={r.id} className="ss-booking-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <h3 className="ss-card-title">{r.skill}</h3>
                                <div style={{ display: 'flex', color: '#f59e0b' }}>
                                    {[...Array(r.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#f59e0b" />
                                    ))}
                                </div>
                            </div>
                            <p className="ss-card-text" style={{ fontStyle: 'italic', marginBottom: 12 }}>"{r.comment}"</p>
                            <p className="ss-card-text" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                From <strong>{r.reviewer}</strong> to <strong>{r.recipient}</strong> · {r.date}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    )
}
