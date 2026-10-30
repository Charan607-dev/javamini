
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
} from 'lucide-react'

import requestService from '../services/requestService'
import { pageVariants, pageTransition, staggerContainer, staggerChild, slideUp } from '../utils/animations'

const USER_KEY = 'skillswap_user'
const BOOKINGS_KEY = 'skillswap_bookings'

function readJSON(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
    } catch {
        return fallback
    }
}

function dateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatDate(date) {
    if (!date) return 'Not scheduled'
    const parsed = new Date(`${date}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) return date
    return parsed.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
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

export default function ScheduleCalendar() {
    const [searchParams] = useSearchParams()
    const bookingId = searchParams.get('booking')

    const [user] = useState(() => readJSON(USER_KEY, null))
    const [bookings, setBookings] = useState(() => readJSON(BOOKINGS_KEY, []))
    const [month, setMonth] = useState(() => {
        const requestedBooking = readJSON(BOOKINGS_KEY, []).find(
            (booking) => booking.id === bookingId
        )
        const date = requestedBooking?.date
            ? new Date(`${requestedBooking.date}T00:00:00`)
            : new Date()
        return new Date(date.getFullYear(), date.getMonth(), 1)
    })
    const [selectedDate, setSelectedDate] = useState(() => {
        const requestedBooking = readJSON(BOOKINGS_KEY, []).find(
            (booking) => booking.id === bookingId
        )
        return requestedBooking?.date || dateKey(new Date())
    })
    const [selectedBookingId, setSelectedBookingId] = useState(bookingId || '')

    useEffect(() => {
        async function fetchBookings() {
            try {
                const data = await requestService.getAllRequests()
                if (Array.isArray(data) && data.length > 0) {
                    setBookings(data)
                } else {
                    setBookings(readJSON(BOOKINGS_KEY, []))
                }
            } catch {
                setBookings(readJSON(BOOKINGS_KEY, []))
            }
        }

        fetchBookings()

        function refresh() {
            fetchBookings()
        }

        window.addEventListener('storage', refresh)
        window.addEventListener('skillswap-bookings-updated', refresh)

        return () => {
            window.removeEventListener('storage', refresh)
            window.removeEventListener('skillswap-bookings-updated', refresh)
        }
    }, [])

    const email = (user?.email || '').toLowerCase()

    const myBookings = useMemo(() => {
        if (!email) return []

        return bookings.filter((booking) => {
            const isParticipant =
                (booking.studentEmail || '').toLowerCase() === email ||
                (booking.teacherEmail || '').toLowerCase() === email

            return isParticipant &&
                booking.date &&
                booking.status !== 'Rejected'
        })
    }, [bookings, email])

    useEffect(() => {
        if (!bookingId) return

        const booking = myBookings.find((item) => item.id === bookingId)
        if (booking?.date) {
            setSelectedDate(booking.date)
            setSelectedBookingId(booking.id)
            const date = new Date(`${booking.date}T00:00:00`)
            setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
        }
    }, [bookingId, myBookings])

    const bookingsOnSelectedDate = myBookings.filter(
        (booking) => booking.date === selectedDate
    )

    const selectedBooking =
        myBookings.find((booking) => booking.id === selectedBookingId) ||
        bookingsOnSelectedDate[0] ||
        null

    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    const daysInMonth = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0
    ).getDate()

    const cells = [
        ...Array(firstDay.getDay()).fill(null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ]

    function changeMonth(amount) {
        setMonth((current) =>
            new Date(current.getFullYear(), current.getMonth() + amount, 1)
        )
    }

    function selectDay(day) {
        if (!day) return
        const date = dateKey(new Date(month.getFullYear(), month.getMonth(), day))
        setSelectedDate(date)
        const dayBookings = myBookings.filter((booking) => booking.date === date)
        setSelectedBookingId(dayBookings[0]?.id || '')
    }

    if (!user) {
        return (
            <motion.main
                className="ss-page"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                transition={pageTransition}
            >
                <div className="ss-container">
                    <section className="ss-panel">
                        <h1 className="ss-title">Log in to view your schedule</h1>
                        <Link className="ss-button ss-button-primary" to="/login">
                            Log in
                        </Link>
                    </section>
                </div>
            </motion.main>
        )
    }

    return (
        <motion.main
            className="ss-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
        >
            <div className="ss-container">
                <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.15 }}>
                    <Link className="ss-back-link" to="/calendar">
                        <ArrowLeft size={16} /> Back to bookings
                    </Link>
                </motion.div>

                <motion.header
                    className="ss-header"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <div>
                        <p className="ss-eyebrow">Your schedule</p>
                        <h1 className="ss-title">Schedule Calendar</h1>
                        <p className="ss-subtitle">
                            Select a date to view its sessions and booking details.
                        </p>
                    </div>
                </motion.header>

                <div className="ss-schedule-layout">
                    <motion.section
                        className="ss-panel"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.12 }}
                    >
                        <div className="ss-calendar-toolbar">
                            <motion.button
                                className="ss-icon-button"
                                onClick={() => changeMonth(-1)}
                                aria-label="Previous month"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.92 }}
                            >
                                <ChevronLeft size={20} />
                            </motion.button>

                            <h2 className="ss-panel-title">
                                {month.toLocaleDateString(undefined, {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </h2>

                            <motion.button
                                className="ss-icon-button"
                                onClick={() => changeMonth(1)}
                                aria-label="Next month"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.92 }}
                            >
                                <ChevronRight size={20} />
                            </motion.button>
                        </div>

                        <div className="ss-month-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div className="ss-weekday" key={day}>{day}</div>
                            ))}

                            {cells.map((day, index) => {
                                if (!day) {
                                    return <div className="ss-day-empty" key={`empty-${index}`} />
                                }

                                const date = dateKey(
                                    new Date(month.getFullYear(), month.getMonth(), day)
                                )
                                const dayBookings = myBookings.filter(
                                    (booking) => booking.date === date
                                )
                                const active = selectedDate === date
                                const today = date === dateKey(new Date())

                                return (
                                    <motion.button
                                        key={date}
                                        className={[
                                            'ss-calendar-day',
                                            active ? 'active' : '',
                                            today ? 'today' : '',
                                            dayBookings.length ? 'has-events' : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => selectDay(day)}
                                        aria-label={`${date}, ${dayBookings.length} sessions`}
                                        whileHover={{ scale: 1.08, transition: { duration: 0.15 } }}
                                        whileTap={{ scale: 0.94 }}
                                    >
                                        <span>{day}</span>
                                        {dayBookings.length > 0 && (
                                            <span className="ss-day-count">
                                                {dayBookings.length}
                                            </span>
                                        )}
                                    </motion.button>
                                )
                            })}
                        </div>

                        <div className="ss-calendar-legend">
                            <span><i className="ss-legend-dot" /> Scheduled session</span>
                            <span><i className="ss-legend-dot today-dot" /> Today</span>
                        </div>
                    </motion.section>

                    <motion.section
                        className="ss-panel"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.18 }}
                    >
                        <p className="ss-eyebrow">Selected date</p>
                        <h2 className="ss-panel-title">{formatDate(selectedDate)}</h2>
                        <p className="ss-panel-description">
                            {bookingsOnSelectedDate.length} session(s) scheduled on this date.
                        </p>

                        <div className="ss-schedule-events">
                            {bookingsOnSelectedDate.length === 0 ? (
                                <motion.div
                                    className="ss-empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.35 }}
                                >
                                    <CalendarDays size={26} />
                                    <p>No sessions scheduled on this date.</p>
                                    Choose another highlighted date to see your sessions.
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                >
                                    {bookingsOnSelectedDate.map((booking) => (
                                        <motion.button
                                            key={booking.id}
                                            className={`ss-event-card ${selectedBookingId === booking.id ? 'active' : ''}`}
                                            onClick={() => setSelectedBookingId(booking.id)}
                                            variants={staggerChild}
                                            whileHover={{ x: 3, transition: { duration: 0.15 } }}
                                        >
                                            <div className="ss-card-top">
                                                <h3 className="ss-card-title">
                                                    {booking.title || 'Skill exchange'}
                                                </h3>
                                                <span className={statusClass(booking.status)}>
                                                    {booking.status || 'Requested'}
                                                </span>
                                            </div>
                                            <p className="ss-card-text">
                                                <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                                                {booking.time || 'Time not set'}
                                            </p>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                        {selectedBooking && selectedBooking.date === selectedDate && (
                            <motion.div
                                className="ss-session-details"
                                key={selectedBooking.id}
                                {...slideUp}
                            >
                                <div className="ss-detail-heading">
                                    <CalendarDays size={19} />
                                    <h3 className="ss-panel-title">Session details</h3>
                                </div>

                                <div className="ss-booking-grid">
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Skill</span>
                                        <strong className="ss-detail-value">
                                            {selectedBooking.title || 'Skill exchange'}
                                        </strong>
                                    </div>
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Date and time</span>
                                        <strong className="ss-detail-value">
                                            {formatDate(selectedBooking.date)} · {selectedBooking.time || 'Not set'}
                                        </strong>
                                    </div>
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Student</span>
                                        <strong className="ss-detail-value">
                                            {selectedBooking.student || 'Student'}
                                        </strong>
                                    </div>
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Skill owner</span>
                                        <strong className="ss-detail-value">
                                            {selectedBooking.teacher || 'Student'}
                                        </strong>
                                    </div>
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Exchange skill</span>
                                        <strong className="ss-detail-value">
                                            {selectedBooking.exchangeSkill || 'Not specified'}
                                        </strong>
                                    </div>
                                    <div className="ss-detail">
                                        <span className="ss-detail-label">Status</span>
                                        <span className={statusClass(selectedBooking.status)}>
                                            {selectedBooking.status || 'Requested'}
                                        </span>
                                    </div>
                                </div>

                                {selectedBooking.proposedDate && selectedBooking.proposedTime && (
                                    <div className="ss-proposal">
                                        <h4 className="ss-proposal-title">Reschedule proposal</h4>
                                        <p className="ss-proposal-text">
                                            Proposed date: {formatDate(selectedBooking.proposedDate)}
                                        </p>
                                        <p className="ss-proposal-text">
                                            Proposed time: {selectedBooking.proposedTime}
                                        </p>
                                        <p className="ss-proposal-text">
                                            Waiting for the other participant to respond.
                                        </p>
                                    </div>
                                )}

                                <div className="ss-card-actions">
                                    <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                                        <Link
                                            className="ss-button ss-button-primary"
                                            to={`/calendar?booking=${encodeURIComponent(selectedBooking.id)}`}
                                        >
                                            Open booking and chat
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </motion.section>
                </div>
            </div>
        </motion.main>
    )
}
