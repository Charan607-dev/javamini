
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    X,
    CalendarDays,
    Clock3,
    ArrowRightLeft,
    BookOpen,
} from 'lucide-react'
import skillService from '../services/skillService'
import requestService from '../services/requestService'

const USER_KEY = 'skillswap_user'
const SKILLS_KEY = 'skillswap_skills'
const BOOKINGS_KEY = 'skillswap_bookings'

function readStorage(key, fallback = []) {
    try {
        const data = JSON.parse(localStorage.getItem(key))
        return data ?? fallback
    } catch {
        return fallback
    }
}

// Identify skills belonging to the logged-in student.
function isMySkill(skill, user) {
    if (!user) return false

    const userEmail = (user.email || '').trim().toLowerCase()
    const ownerEmail = (skill.ownerEmail || '').trim().toLowerCase()

    // Email is the primary identifier.
    if (userEmail && ownerEmail) {
        return userEmail === ownerEmail
    }

    // Fallback for older records that don't have an owner email.
    const userName = (user.name || '').trim().toLowerCase()
    const ownerName = (skill.ownerName || '').trim().toLowerCase()

    return Boolean(userName && ownerName && userName === ownerName)
}

export default function Explore() {
    const navigate = useNavigate()

    const [user, setUser] = useState(() => readStorage(USER_KEY, null))
    const [skills, setSkills] = useState(() => readStorage(SKILLS_KEY))
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')

    const [selectedSkill, setSelectedSkill] = useState(null)
    const [exchangeSkillId, setExchangeSkillId] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const refresh = async () => {
            setUser(readStorage(USER_KEY, null))
            try {
                const liveSkills = await skillService.getAllSkills()
                if (Array.isArray(liveSkills) && liveSkills.length > 0) {
                    setSkills(liveSkills)
                } else {
                    setSkills(readStorage(SKILLS_KEY))
                }
            } catch {
                setSkills(readStorage(SKILLS_KEY))
            }
        }

        refresh()
        window.addEventListener('focus', refresh)
        window.addEventListener('storage', refresh)
        window.addEventListener('skillswap-skills-updated', refresh)

        return () => {
            window.removeEventListener('focus', refresh)
            window.removeEventListener('storage', refresh)
            window.removeEventListener('skillswap-skills-updated', refresh)
        }
    }, [])

    // The student's own skills.
    const mySkills = skills.filter((skill) => isMySkill(skill, user))

    // Display all real listings, but label the student's own listings separately.
    const categories = [
        'All',
        ...new Set(
            skills.map((skill) => skill.category).filter(Boolean)
        ),
    ]

    const filteredSkills = skills.filter((skill) => {
        const text = [
            skill.title,
            skill.category,
            skill.description,
            skill.ownerName,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

        const matchesSearch = text.includes(search.toLowerCase())
        const matchesCategory =
            category === 'All' || skill.category === category

        return matchesSearch && matchesCategory
    })

    const openRequest = (skill) => {
        if (!user) {
            navigate('/login')
            return
        }

        // Explicitly prevent requesting your own skill.
        if (isMySkill(skill, user)) {
            return
        }

        if (mySkills.length === 0) {
            alert('First add a skill that you can teach in exchange.')
            navigate('/add-skill')
            return
        }

        setSelectedSkill(skill)
        setExchangeSkillId('')
        setDate('')
        setTime('')
        setError('')
    }

    const bookSlot = async (event) => {
        event.preventDefault()
        setError('')

        if (!user) {
            navigate('/login')
            return
        }

        if (!selectedSkill || isMySkill(selectedSkill, user)) {
            setError('You cannot book your own skill.')
            return
        }

        const exchangeSkill = mySkills.find(
            (skill) => String(skill.id) === String(exchangeSkillId)
        )

        if (!exchangeSkill) {
            setError('Select one of your skills to offer in return.')
            return
        }

        if (!date || !time) {
            setError('Choose both a date and a time.')
            return
        }

        const requestedDate = new Date(`${date}T${time}:00`)

        if (
            Number.isNaN(requestedDate.getTime()) ||
            requestedDate <= new Date()
        ) {
            setError('Choose a future date and time.')
            return
        }

        try {
            await requestService.createRequest({
                skillId: selectedSkill.id,
                exchangeSkillId: exchangeSkill.id,
                date,
                time,
                studentId: user.id || user.email,
                notes: `Exchange for ${exchangeSkill.title}`
            })

            setSelectedSkill(null)
            navigate('/calendar')
        } catch (bookingErr) {
            setError(bookingErr.message || 'Failed to submit booking request. Please try again.')
        }
    }

    return (
        <main className="explore-page">
            <header className="explore-header">
                <p className="dashboard-eyebrow">LEARN BY EXCHANGING</p>
                <h1>Explore skills</h1>
                <p>
                    Learn from other students and offer your own skills in return.
                </p>
            </header>

            <div className="explore-toolbar">
                <label className="explore-search">
                    <Search size={18} />
                    <input
                        type="search"
                        placeholder="Search skills, categories or students..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </label>
            </div>

            <div className="explore-category-filters">
                {categories.map((item) => (
                    <button
                        key={item}
                        type="button"
                        className={`explore-category-chip ${category === item ? 'active' : ''
                            }`}
                        onClick={() => setCategory(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {filteredSkills.length === 0 ? (
                <section className="explore-empty">
                    <BookOpen size={34} />
                    <h2>No skills found</h2>
                    <p>
                        No student-submitted skills match your search.
                        Try a different category or add a skill to teach.
                    </p>
                </section>
            ) : (
                <section className="explore-grid">
                    {filteredSkills.map((skill) => {
                        const ownListing = isMySkill(skill, user)

                        return (
                            <article className="explore-skill-card" key={skill.id}>
                                <span className="explore-category">
                                    {skill.category || 'General'}
                                </span>

                                <h2>{skill.title}</h2>

                                <p>
                                    {skill.description || 'No description provided.'}
                                </p>

                                <div className="explore-teacher">
                                    <span className="explore-avatar">
                                        {(skill.ownerName || 'S')
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>

                                    <div>
                                        <strong>{skill.ownerName || 'Student'}</strong>
                                        <span>{skill.level || 'Skill sharer'}</span>
                                    </div>
                                </div>

                                {skill.wantedSkill && (
                                    <p className="explore-wanted">
                                        Wants to learn: {skill.wantedSkill}
                                    </p>
                                )}

                                {ownListing ? (
                                    <button
                                        type="button"
                                        className="explore-own-listing"
                                        disabled
                                    >
                                        Your listing
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="explore-request-button"
                                        onClick={() => openRequest(skill)}
                                    >
                                        Request Skill <ArrowRightLeft size={17} />
                                    </button>
                                )}
                            </article>
                        )
                    })}
                </section>
            )}

            {selectedSkill && (
                <div
                    className="exchange-modal-backdrop"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedSkill(null)
                        }
                    }}
                >
                    <section
                        className="exchange-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="exchange-modal-title"
                    >
                        <button
                            className="exchange-modal-close"
                            type="button"
                            onClick={() => setSelectedSkill(null)}
                            aria-label="Close popup"
                        >
                            <X size={20} />
                        </button>

                        <span className="exchange-modal-icon">
                            <ArrowRightLeft size={23} />
                        </span>

                        <p className="dashboard-eyebrow">
                            SKILL EXCHANGE REQUEST
                        </p>

                        <h2 id="exchange-modal-title">Book your learning slot</h2>

                        <p className="exchange-modal-description">
                            You want to learn <strong>{selectedSkill.title}</strong> from{' '}
                            <strong>{selectedSkill.ownerName || 'another student'}</strong>.
                            Choose the skill you can teach in return.
                        </p>

                        <form className="exchange-form" onSubmit={bookSlot}>
                            <label htmlFor="exchange-skill">
                                Which skill will you offer in return?
                            </label>

                            <select
                                id="exchange-skill"
                                value={exchangeSkillId}
                                onChange={(event) =>
                                    setExchangeSkillId(event.target.value)
                                }
                                required
                            >
                                <option value="">Select your skill</option>

                                {mySkills.map((skill) => (
                                    <option key={skill.id} value={skill.id}>
                                        {skill.title}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="booking-date">Choose date</label>

                            <div className="exchange-input-wrap">
                                <CalendarDays size={18} />
                                <input
                                    id="booking-date"
                                    type="date"
                                    min={new Date().toLocaleDateString('en-CA')}
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)}
                                    required
                                />
                            </div>

                            <label htmlFor="booking-time">Choose time</label>

                            <div className="exchange-input-wrap">
                                <Clock3 size={18} />
                                <input
                                    id="booking-time"
                                    type="time"
                                    value={time}
                                    onChange={(event) => setTime(event.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p className="exchange-error">{error}</p>
                            )}

                            <button className="exchange-book-button" type="submit">
                                Book Slot <ArrowRightLeft size={17} />
                            </button>

                            <p className="exchange-note">
                                Your request remains pending until the other student
                                agrees to the session.
                            </p>
                        </form>
                    </section>
                </div>
            )}
        </main>
    )
}
