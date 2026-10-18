import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, GraduationCap } from 'lucide-react'

import skillService from '../services/skillService'
import authService from '../services/authService'

const USER_KEY = 'skillswap_user'
const SKILLS_KEY = 'skillswap_skills'

function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || 'null')
        return value ?? fallback
    } catch {
        return fallback
    }
}

export default function Dashboard() {
    const navigate = useNavigate()

    const [user, setUser] = useState(() => readJSON(USER_KEY, null))
    const [skills, setSkills] = useState(() => readJSON(SKILLS_KEY, []))

    const refresh = useCallback(async () => {
        setUser(readJSON(USER_KEY, null))
        try {
            const liveSkills = await skillService.getAllSkills()
            if (Array.isArray(liveSkills) && liveSkills.length > 0) {
                setSkills(liveSkills)
            } else {
                setSkills(readJSON(SKILLS_KEY, []))
            }
        } catch {
            setSkills(readJSON(SKILLS_KEY, []))
        }
    }, [])

    useEffect(() => {
        refresh()

        window.addEventListener('storage', refresh)
        window.addEventListener('skillswap-skills-updated', refresh)

        return () => {
            window.removeEventListener('storage', refresh)
            window.removeEventListener('skillswap-skills-updated', refresh)
        }
    }, [refresh])

    useEffect(() => {
        if (!readJSON(USER_KEY, null)) {
            navigate('/login')
        }
    }, [navigate])

    if (!user) return null

    const email = (user.email || '').toLowerCase()

    const mySkills = skills.filter(
        (skill) => (skill.ownerEmail || '').toLowerCase() === email
    )

    const otherSkills = skills.filter(
        (skill) => (skill.ownerEmail || '').toLowerCase() !== email
    )

    function logout() {
        localStorage.removeItem(USER_KEY)
        navigate('/login')
    }

    return (
        <main className="ss-page">
            <div className="ss-container">

                {/* Dashboard header */}
                <header className="ss-header">
                    <div>
                        <p className="ss-eyebrow">Student Dashboard</p>

                        <h1 className="ss-title">
                            Welcome, {user.name}
                        </h1>

                        <p className="ss-subtitle">
                            Manage your skills and discover new learning opportunities.
                        </p>
                    </div>

                    <div className="ss-actions">
                        <Link
                            className="ss-button ss-button-primary"
                            to="/explore"
                        >
                            Explore skills
                        </Link>
                        <Link
                            className="ss-button"
                            to="/schedule-calendar"
                        >
                            <CalendarDays size={15} />
                            Schedule Calendar
                        </Link>

                        <button
                            className="ss-button"
                            onClick={logout}
                        >
                            Log out
                        </button>
                    </div>
                </header>

                {/* Skills overview only */}
                <section className="ss-stats">
                    <div className="ss-stat">
                        <span className="ss-stat-label">
                            My skill listings
                        </span>

                        <strong className="ss-stat-value">
                            {mySkills.length}
                        </strong>
                    </div>

                    <div className="ss-stat">
                        <span className="ss-stat-label">
                            Skills to explore
                        </span>

                        <strong className="ss-stat-value">
                            {otherSkills.length}
                        </strong>
                    </div>
                </section>

                {/* My skill listings */}
                <section className="ss-panel">
                    <div className="ss-panel-heading">
                        <div>
                            <h2 className="ss-panel-title">
                                My skill listings
                            </h2>

                            <p className="ss-panel-description">
                                Skills you have shared with other students.
                            </p>
                        </div>

                        <Link
                            className="ss-button ss-button-primary"
                            to="/add-skill"
                        >
                            + Add a skill
                        </Link>
                    </div>

                    {mySkills.length === 0 ? (
                        <div className="ss-empty">
                            You haven't listed a skill yet. Add your first skill
                            to start sharing your knowledge.
                            <div style={{ marginTop: 16 }}>
                                <Link
                                    className="ss-button ss-button-primary"
                                    to="/add-skill"
                                >
                                    Add your first skill
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="ss-list">
                            {mySkills.map((skill) => (
                                <article
                                    className="ss-booking-card"
                                    key={skill.id}
                                >
                                    <h3 className="ss-card-title">
                                        <GraduationCap
                                            size={18}
                                            style={{
                                                verticalAlign: 'middle',
                                                marginRight: 7,
                                            }}
                                        />
                                        {skill.title}
                                    </h3>

                                    <p className="ss-card-text">
                                        {skill.category || 'General'}
                                    </p>

                                    <p className="ss-card-text">
                                        {skill.description || 'No description added.'}
                                    </p>

                                    {skill.level && (
                                        <p className="ss-card-text">
                                            Level: {skill.level}
                                        </p>
                                    )}

                                    {skill.wantedSkill && (
                                        <p className="ss-card-text">
                                            Looking to learn: {skill.wantedSkill}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Explore skills */}
                <section className="ss-panel">
                    <div className="ss-panel-heading">
                        <div>
                            <h2 className="ss-panel-title">
                                Discover new skills
                            </h2>

                            <p className="ss-panel-description">
                                Find students who can teach you something new.
                            </p>
                        </div>

                        <Link
                            className="ss-button ss-button-primary"
                            to="/explore"
                        >
                            Explore skills
                        </Link>
                    </div>

                    {otherSkills.length === 0 ? (
                        <div className="ss-empty">
                            No other students' skills are available yet.
                            Check back later.
                        </div>
                    ) : (
                        <div className="ss-list">
                            {otherSkills.slice(0, 3).map((skill) => (
                                <article
                                    className="ss-booking-card"
                                    key={skill.id}
                                >
                                    <h3 className="ss-card-title">
                                        {skill.title}
                                    </h3>

                                    <p className="ss-card-text">
                                        Category: {skill.category || 'General'}
                                    </p>

                                    <p className="ss-card-text">
                                        Shared by: {skill.ownerName || 'Student'}
                                    </p>

                                    <p className="ss-card-text">
                                        {skill.description || 'No description added.'}
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