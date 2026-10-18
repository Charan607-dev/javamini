import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, School, ArrowLeft, LogOut } from 'lucide-react'
import authService from '../services/authService'
import skillService from '../services/skillService'

export default function Profile() {
    const navigate = useNavigate()
    const [user] = useState(() => authService.getCurrentUser())
    const [skillsCount, setSkillsCount] = useState(0)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        skillService.getSkillsByOwner(user.email).then(list => {
            if (Array.isArray(list)) setSkillsCount(list.length)
        }).catch(() => {})
    }, [user, navigate])

    function handleLogout() {
        authService.logout()
        navigate('/login')
    }

    if (!user) return null

    return (
        <main className="ss-page">
            <div className="ss-container" style={{ maxWidth: 640 }}>
                <header className="ss-header">
                    <div>
                        <Link to="/dashboard" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#6366f1', textDecoration: 'none' }}>
                            <ArrowLeft size={16} /> Back to dashboard
                        </Link>
                        <h1 className="ss-title">Student Profile</h1>
                        <p className="ss-subtitle">Your SkillSwap account details and community presence.</p>
                    </div>
                </header>

                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {(user.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0 0 4px' }}>{user.name}</h2>
                            <span style={{ fontSize: '0.85rem', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 12 }}>Active Student</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4b5563' }}>
                            <User size={18} style={{ color: '#6366f1' }} />
                            <div>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', display: 'block' }}>Full Name</span>
                                <strong>{user.name}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4b5563' }}>
                            <Mail size={18} style={{ color: '#6366f1' }} />
                            <div>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', display: 'block' }}>Email Address</span>
                                <strong>{user.email}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4b5563' }}>
                            <School size={18} style={{ color: '#6366f1' }} />
                            <div>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', display: 'block' }}>College / University</span>
                                <strong>{user.college || 'Registered University'}</strong>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Skills offered:</span>
                            <strong style={{ marginLeft: 6, color: '#4338ca' }}>{skillsCount}</strong>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="ss-button"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#dc2626' }}
                        >
                            <LogOut size={16} /> Log out
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}
