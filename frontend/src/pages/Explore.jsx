import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, X, CalendarDays, Clock3, ArrowRightLeft, BookOpen,
} from 'lucide-react'
import skillService from '../services/skillService'
import requestService from '../services/requestService'
import { pageVariants, pageTransition, staggerContainer, staggerChild, fadeUp, slideUp } from '../utils/animations'

const USER_KEY     = 'skillswap_user'
const SKILLS_KEY   = 'skillswap_skills'

function readStorage(key, fallback = []) {
    try {
        const data = JSON.parse(localStorage.getItem(key))
        return data ?? fallback
    } catch {
        return fallback
    }
}

function isMySkill(skill, user) {
    if (!user) return false
    const userEmail  = (user.email  || '').trim().toLowerCase()
    const ownerEmail = (skill.ownerEmail || '').trim().toLowerCase()
    if (userEmail && ownerEmail) return userEmail === ownerEmail
    const userName  = (user.name  || '').trim().toLowerCase()
    const ownerName = (skill.ownerName || '').trim().toLowerCase()
    return Boolean(userName && ownerName && userName === ownerName)
}

export default function Explore() {
    const navigate = useNavigate()
    const [user,   setUser]   = useState(() => readStorage(USER_KEY, null))
    const [skills, setSkills] = useState(() => readStorage(SKILLS_KEY))
    const [search,   setSearch]   = useState('')
    const [category, setCategory] = useState('All')

    const [selectedSkill,   setSelectedSkill]   = useState(null)
    const [exchangeSkillId, setExchangeSkillId] = useState('')
    const [date,  setDate]  = useState('')
    const [time,  setTime]  = useState('')
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

    const mySkills = skills.filter(skill => isMySkill(skill, user))

    const categories = ['All', ...new Set(skills.map(s => s.category).filter(Boolean))]

    const filteredSkills = skills.filter(skill => {
        const text = [skill.title, skill.category, skill.description, skill.ownerName]
            .filter(Boolean).join(' ').toLowerCase()
        return text.includes(search.toLowerCase()) &&
               (category === 'All' || skill.category === category)
    })

    const openRequest = (skill) => {
        if (!user) { navigate('/login'); return }
        if (isMySkill(skill, user)) return
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
        if (!user) { navigate('/login'); return }
        if (!selectedSkill || isMySkill(selectedSkill, user)) {
            setError('You cannot book your own skill.')
            return
        }
        const exchangeSkill = mySkills.find(s => String(s.id) === String(exchangeSkillId))
        if (!exchangeSkill) { setError('Select one of your skills to offer in return.'); return }
        if (!date || !time) { setError('Choose both a date and a time.'); return }
        const requestedDate = new Date(`${date}T${time}:00`)
        if (Number.isNaN(requestedDate.getTime()) || requestedDate <= new Date()) {
            setError('Choose a future date and time.')
            return
        }
        try {
            await requestService.createRequest({
                skillId: selectedSkill.id,
                exchangeSkillId: exchangeSkill.id,
                date, time,
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
        <motion.main
            className="explore-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
        >
            {/* Header */}
            <motion.header
                className="explore-header"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
            >
                <p className="dashboard-eyebrow">LEARN BY EXCHANGING</p>
                <h1>Explore skills</h1>
                <p>Learn from other students and offer your own skills in return.</p>
            </motion.header>

            {/* Search */}
            <motion.div
                className="explore-toolbar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.36 }}
            >
                <label className="explore-search">
                    <Search size={18} />
                    <input
                        type="search"
                        placeholder="Search skills, categories or students..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </label>
            </motion.div>

            {/* Category chips */}
            <motion.div
                className="explore-category-filters"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {categories.map(item => (
                    <motion.button
                        key={item}
                        type="button"
                        className={`explore-category-chip ${category === item ? 'active' : ''}`}
                        onClick={() => setCategory(item)}
                        variants={staggerChild}
                        whileHover={{ scale: 1.06, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {item}
                    </motion.button>
                ))}
            </motion.div>

            {/* Cards */}
            <AnimatePresence mode="wait">
                {filteredSkills.length === 0 ? (
                    <motion.section
                        key="empty"
                        className="explore-empty"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.3 }}
                    >
                        <BookOpen size={34} />
                        <h2>No skills found</h2>
                        <p>No student-submitted skills match your search. Try a different category or add a skill to teach.</p>
                    </motion.section>
                ) : (
                    <motion.section
                        key="grid"
                        className="explore-grid"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0 }}
                    >
                        {filteredSkills.map(skill => {
                            const ownListing = isMySkill(skill, user)
                            return (
                                <motion.article
                                    className="explore-skill-card"
                                    key={skill.id}
                                    variants={staggerChild}
                                    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.18 } }}
                                    layout
                                >
                                    <span className="explore-category">{skill.category || 'General'}</span>
                                    <h2>{skill.title}</h2>
                                    <p>{skill.description || 'No description provided.'}</p>
                                    <div className="explore-teacher">
                                        <span className="explore-avatar">
                                            {(skill.ownerName || 'S').charAt(0).toUpperCase()}
                                        </span>
                                        <div>
                                            <strong>{skill.ownerName || 'Student'}</strong>
                                            <span>{skill.level || 'Skill sharer'}</span>
                                        </div>
                                    </div>
                                    {skill.wantedSkill && (
                                        <p className="explore-wanted">Wants to learn: {skill.wantedSkill}</p>
                                    )}
                                    {ownListing ? (
                                        <button type="button" className="explore-own-listing" disabled>
                                            Your listing
                                        </button>
                                    ) : (
                                        <motion.button
                                            type="button"
                                            className="explore-request-button"
                                            onClick={() => openRequest(skill)}
                                            whileHover={{ scale: 1.04, y: -1 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            Request Skill <ArrowRightLeft size={17} />
                                        </motion.button>
                                    )}
                                </motion.article>
                            )
                        })}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Exchange modal */}
            <AnimatePresence>
                {selectedSkill && (
                    <motion.div
                        className="exchange-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        onClick={e => { if (e.target === e.currentTarget) setSelectedSkill(null) }}
                    >
                        <motion.section
                            className="exchange-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="exchange-modal-title"
                            initial={{ opacity: 0, scale: 0.94, y: 28 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.button
                                className="exchange-modal-close"
                                type="button"
                                onClick={() => setSelectedSkill(null)}
                                aria-label="Close popup"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.18 }}
                            >
                                <X size={20} />
                            </motion.button>

                            <span className="exchange-modal-icon"><ArrowRightLeft size={23} /></span>
                            <p className="dashboard-eyebrow">SKILL EXCHANGE REQUEST</p>
                            <h2 id="exchange-modal-title">Book your learning slot</h2>
                            <p className="exchange-modal-description">
                                You want to learn <strong>{selectedSkill.title}</strong> from{' '}
                                <strong>{selectedSkill.ownerName || 'another student'}</strong>.
                                Choose the skill you can teach in return.
                            </p>

                            <form className="exchange-form" onSubmit={bookSlot}>
                                <label htmlFor="exchange-skill">Which skill will you offer in return?</label>
                                <select
                                    id="exchange-skill"
                                    value={exchangeSkillId}
                                    onChange={e => setExchangeSkillId(e.target.value)}
                                    required
                                >
                                    <option value="">Select your skill</option>
                                    {mySkills.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>

                                <label htmlFor="booking-date">Choose date</label>
                                <div className="exchange-input-wrap">
                                    <CalendarDays size={18} />
                                    <input
                                        id="booking-date" type="date"
                                        min={new Date().toLocaleDateString('en-CA')}
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <label htmlFor="booking-time">Choose time</label>
                                <div className="exchange-input-wrap">
                                    <Clock3 size={18} />
                                    <input
                                        id="booking-time" type="time"
                                        value={time}
                                        onChange={e => setTime(e.target.value)}
                                        required
                                    />
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.p
                                            key="modal-error"
                                            className="exchange-error"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    className="exchange-book-button"
                                    type="submit"
                                    whileHover={{ scale: 1.03, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    Book Slot <ArrowRightLeft size={17} />
                                </motion.button>

                                <p className="exchange-note">
                                    Your request remains pending until the other student agrees to the session.
                                </p>
                            </form>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.main>
    )
}
