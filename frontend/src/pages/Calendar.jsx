
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    MessageCircle,
    Send,
} from 'lucide-react'

const USER_KEY = 'skillswap_user'
const BOOKINGS_KEY = 'skillswap_bookings'

function readJSON(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
    } catch {
        return fallback
    }
}

function showDate(date) {
    if (!date) return 'Not scheduled'
    const parsed = new Date(`${date}T00:00:00`)
    return Number.isNaN(parsed.getTime())
        ? date
        : parsed.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
}

function statusClass(status) {
    const value = (status || 'Requested').toLowerCase()
    if (value === 'accepted') return 'ss-status ss-status-accepted'
    if (value === 'rejected') return 'ss-status ss-status-rejected'
    if (value === 'postponed') return 'ss-status ss-status-postponed'
    return 'ss-status ss-status-pending'
}

function saveBookings(bookings) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
    window.dispatchEvent(new Event('skillswap-bookings-updated'))
}

function canViewBooking(booking, user) {
    const email = (user?.email || '').toLowerCase()
    return Boolean(email) && (
        (booking.studentEmail || '').toLowerCase() === email ||
        (booking.teacherEmail || '').toLowerCase() === email
    )
}

export default function Calendar() {
    const [searchParams] = useSearchParams()
    const bookingFromUrl = searchParams.get('booking')

    const [user] = useState(() => readJSON(USER_KEY, null))
    const [bookings, setBookings] = useState(() => readJSON(BOOKINGS_KEY, []))
    const [selectedId, setSelectedId] = useState(bookingFromUrl || '')
    const [message, setMessage] = useState('')
    const [newDate, setNewDate] = useState('')
    const [newTime, setNewTime] = useState('')
    const [notice, setNotice] = useState('')

    function refresh() {
        setBookings(readJSON(BOOKINGS_KEY, []))
    }

    useEffect(() => {
        const listener = () => refresh()
        window.addEventListener('storage', listener)
        window.addEventListener('skillswap-bookings-updated', listener)
        return () => {
            window.removeEventListener('storage', listener)
            window.removeEventListener('skillswap-bookings-updated', listener)
        }
    }, [])

    useEffect(() => {
        if (bookingFromUrl) setSelectedId(bookingFromUrl)
    }, [bookingFromUrl])

    const myBookings = user
        ? bookings.filter((booking) => canViewBooking(booking, user))
        : []

    const selected =
        myBookings.find((booking) => booking.id === selectedId) ||
        myBookings[0] ||
        null

    const email = (user?.email || '').toLowerCase()
    const isOwner =
        (selected?.teacherEmail || '').toLowerCase() === email
    const isRequester =
        (selected?.studentEmail || '').toLowerCase() === email

    const messages = Array.isArray(selected?.messages)
        ? selected.messages
        : []

    function updateBooking(id, changes) {
        const latest = readJSON(BOOKINGS_KEY, [])
        const updated = latest.map((booking) =>
            booking.id === id
                ? { ...booking, ...changes, updatedAt: new Date().toISOString() }
                : booking
        )
        saveBookings(updated)
        setBookings(updated)
    }

    function acceptBooking() {
        if (!selected) return
        updateBooking(selected.id, {
            status: 'Accepted',
            respondedAt: new Date().toISOString(),
        })
        setNotice('Booking accepted.')
    }

    function rejectBooking() {
        if (!selected) return
        updateBooking(selected.id, {
            status: 'Rejected',
            respondedAt: new Date().toISOString(),
        })
        setNotice('Booking rejected.')
    }

    function proposeTime(event) {
        event.preventDefault()

        if (!selected || !newDate || !newTime) {
            setNotice('Select a new date and time first.')
            return
        }

        const proposed = {
            proposedDate: newDate,
            proposedTime: newTime,
            rescheduleProposedBy: user.email,
            status: 'Postponed',
        }

        const latest = readJSON(BOOKINGS_KEY, [])
        const updated = latest.map((booking) => {
            if (booking.id !== selected.id) return booking

            const oldMessages = Array.isArray(booking.messages)
                ? booking.messages
                : []

            return {
                ...booking,
                ...proposed,
                messages: [
                    ...oldMessages,
                    {
                        id: crypto.randomUUID(),
                        senderEmail: user.email,
                        senderName: user.name,
                        text: `Proposed a new session time: ${showDate(newDate)} at ${newTime}. Please review.`,
                        createdAt: new Date().toISOString(),
                    },
                ],
                updatedAt: new Date().toISOString(),
            }
        })

        saveBookings(updated)
        setBookings(updated)
        setNewDate('')
        setNewTime('')
        setNotice('Reschedule proposal saved.')
    }

    function acceptProposal() {
        if (!selected?.proposedDate || !selected?.proposedTime) return

        if (
            (selected.rescheduleProposedBy || '').toLowerCase() === email
        ) {
            setNotice('The other participant must accept your proposal.')
            return
        }

        updateBooking(selected.id, {
            status: 'Accepted',
            date: selected.proposedDate,
            time: selected.proposedTime,
            proposedDate: '',
            proposedTime: '',
            rescheduleProposedBy: '',
        })
        setNotice('New session date and time confirmed.')
    }

    function sendMessage(event) {
        event.preventDefault()
        if (!selected || !message.trim() || !user) return

        const latest = readJSON(BOOKINGS_KEY, [])
        const updated = latest.map((booking) => {
            if (booking.id !== selected.id) return booking

            const oldMessages = Array.isArray(booking.messages)
                ? booking.messages
                : []

            return {
                ...booking,
                messages: [
                    ...oldMessages,
                    {
                        id: crypto.randomUUID(),
                        senderEmail: user.email,
                        senderName: user.name,
                        text: message.trim(),
                        createdAt: new Date().toISOString(),
                    },
                ],
            }
        })

        saveBookings(updated)
        setBookings(updated)
        setMessage('')
        setNotice('Message sent.')
    }

    if (!user) {
        return (
            <main className="ss-page">
                <div className="ss-container">
                    <section className="ss-panel">
                        <h1 className="ss-title">Log in to view bookings</h1>
                        <Link className="ss-button ss-button-primary" to="/login">
                            Go to login
                        </Link>
                    </section>
                </div>
            </main>
        )
    }

    return (
        <main className="ss-page">
            <div className="ss-container">
                <Link className="ss-back-link" to="/dashboard">
                    <ArrowLeft size={16} /> Back to dashboard
                </Link>

                <header className="ss-header">
                    <div>
                        <p className="ss-eyebrow">SkillSwap</p>
                        <h1 className="ss-title">Bookings & Calendar</h1>
                        <p className="ss-subtitle">
                            Review session dates, manage rescheduling, and chat with the other participant.
                        </p>
                    </div>
                    <Link className="ss-button ss-button-primary" to="/explore">
                        Explore skills
                    </Link>
                </header>

                {notice && <div className="ss-notice" role="status">{notice}</div>}

                {myBookings.length === 0 ? (
                    <section className="ss-panel">
                        <div className="ss-empty">
                            <CalendarDays size={28} />
                            <h2 className="ss-panel-title">No bookings yet</h2>
                            Your skill exchange bookings will appear here.
                        </div>
                    </section>
                ) : (
                    <div className="ss-calendar-grid">
                        <section className="ss-panel">
                            <div className="ss-panel-heading">
                                <h2 className="ss-panel-title">
                                    Your bookings ({myBookings.length})
                                </h2>
                            </div>

                            {myBookings.map((booking) => (
                                <button
                                    type="button"
                                    key={booking.id}
                                    className={`ss-select-booking ${selected?.id === booking.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedId(booking.id)
                                        setNotice('')
                                    }}
                                >
                                    <div className="ss-card-top">
                                        <span className="ss-card-title">
                                            {booking.title || 'Skill exchange'}
                                        </span>
                                        <span className={statusClass(booking.status)}>
                                            {booking.status || 'Requested'}
                                        </span>
                                    </div>
                                    <p className="ss-card-text">
                                        {booking.studentEmail?.toLowerCase() === email
                                            ? `Skill owner: ${booking.teacher || 'Student'}`
                                            : `Requested by: ${booking.student || 'Student'}`}
                                    </p>
                                    <p className="ss-card-text">
                                        {showDate(booking.date)} · {booking.time || 'Time not set'}
                                    </p>
                                    {booking.proposedDate && booking.proposedTime && (
                                        <p className="ss-proposal-text">
                                            Proposed: {showDate(booking.proposedDate)} · {booking.proposedTime}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </section>

                        {selected && (
                            <section className="ss-panel">
                                <div className="ss-panel-heading">
                                    <div>
                                        <p className="ss-eyebrow">
                                            {isOwner ? 'Incoming request' : 'Your request'}
                                        </p>
                                        <h2 className="ss-panel-title">{selected.title}</h2>
                                    </div>
                                    <span className={statusClass(selected.status)}>
                                        {selected.status || 'Requested'}
                                    </span>
                                </div>

                                <div className="ss-booking-grid">
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Student</span>
                                        <strong className="ss-detail-value">
                                            {selected.student || 'Student'}
                                        </strong>
                                    </div>
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Skill owner</span>
                                        <strong className="ss-detail-value">
                                            {selected.teacher || 'Student'}
                                        </strong>
                                    </div>
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Exchange skill</span>
                                        <strong className="ss-detail-value">
                                            {selected.exchangeSkill || 'Not specified'}
                                        </strong>
                                    </div>
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Confirmed session</span>
                                        <strong className="ss-detail-value">
                                            {showDate(selected.date)} · {selected.time || 'Not set'}
                                        </strong>
                                    </div>
                                </div>

                                {selected.proposedDate && selected.proposedTime && (
                                    <div className="ss-proposal">
                                        <h3 className="ss-proposal-title">
                                            <Clock size={17} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                                            Reschedule proposal
                                        </h3>
                                        <p className="ss-proposal-text">
                                            New date: {showDate(selected.proposedDate)}
                                        </p>
                                        <p className="ss-proposal-text">
                                            New time: {selected.proposedTime}
                                        </p>
                                        <p className="ss-proposal-text">
                                            Proposed by:{' '}
                                            {(selected.rescheduleProposedBy || '').toLowerCase() === email
                                                ? 'You'
                                                : isOwner
                                                    ? selected.student
                                                    : selected.teacher}
                                        </p>

                                        {(selected.rescheduleProposedBy || '').toLowerCase() !== email && (
                                            <button
                                                className="ss-button ss-button-success"
                                                onClick={acceptProposal}
                                                style={{ marginTop: 12 }}
                                            >
                                                Accept new time
                                            </button>
                                        )}
                                        {(selected.rescheduleProposedBy || '').toLowerCase() === email && (
                                            <p className="ss-proposal-text">
                                                Waiting for the other participant to accept.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {isOwner && selected.status === 'Requested' && (
                                    <div className="ss-card-actions">
                                        <button className="ss-button ss-button-success" onClick={acceptBooking}>
                                            Accept booking
                                        </button>
                                        <button className="ss-button ss-button-danger" onClick={rejectBooking}>
                                            Reject booking
                                        </button>
                                    </div>
                                )}

                                {selected.status !== 'Rejected' && (
                                    <section className="ss-subpanel">
                                        <div className="ss-panel-heading">
                                            <div>
                                                <h3 className="ss-panel-title">Reschedule session</h3>
                                                <p className="ss-panel-description">
                                                    Propose another date and time for the other participant to approve.
                                                </p>
                                            </div>
                                        </div>

                                        <form className="ss-form" onSubmit={proposeTime}>
                                            <div className="ss-form-grid">
                                                <label className="ss-field">
                                                    New date
                                                    <input
                                                        className="ss-input"
                                                        type="date"
                                                        min={new Date().toISOString().slice(0, 10)}
                                                        value={newDate}
                                                        onChange={(e) => setNewDate(e.target.value)}
                                                        required
                                                    />
                                                </label>
                                                <label className="ss-field">
                                                    New time
                                                    <input
                                                        className="ss-input"
                                                        type="time"
                                                        value={newTime}
                                                        onChange={(e) => setNewTime(e.target.value)}
                                                        required
                                                    />
                                                </label>
                                            </div>
                                            <button className="ss-button ss-button-primary" type="submit">
                                                Send reschedule proposal
                                            </button>
                                        </form>
                                    </section>
                                )}

                                <section className="ss-chat-section">
                                    <div className="ss-panel-heading">
                                        <div>
                                            <h3 className="ss-panel-title">
                                                <MessageCircle size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                                                Private booking chat
                                            </h3>
                                            <p className="ss-panel-description">
                                                Only the two participants should access this conversation.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ss-chat">
                                        <div className="ss-chat-messages">
                                            {messages.length === 0 ? (
                                                <div className="ss-empty">No messages yet. Start the conversation.</div>
                                            ) : (
                                                messages.map((item) => {
                                                    const mine =
                                                        (item.senderEmail || '').toLowerCase() === email

                                                    return (
                                                        <div
                                                            className={`ss-message ${mine ? 'ss-message-mine' : ''}`}
                                                            key={item.id}
                                                        >
                                                            <span className="ss-message-sender">
                                                                {mine ? 'You' : item.senderName || 'Participant'}
                                                            </span>
                                                            <p className="ss-message-body">{item.text}</p>
                                                            <time className="ss-message-time">
                                                                {item.createdAt
                                                                    ? new Date(item.createdAt).toLocaleString()
                                                                    : ''}
                                                            </time>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>

                                        <form className="ss-chat-form" onSubmit={sendMessage}>
                                            <input
                                                className="ss-input"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Discuss your session..."
                                                maxLength={1000}
                                                required
                                            />
                                            <button
                                                className="ss-button ss-button-primary"
                                                type="submit"
                                                disabled={!message.trim()}
                                            >
                                                <Send size={16} /> Send
                                            </button>
                                        </form>
                                    </div>
                                </section>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}
