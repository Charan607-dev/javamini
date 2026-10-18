
const BOOKINGS_KEY = 'skillswap_bookings'

export function getBookings() {
    try {
        return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]')
    } catch {
        return []
    }
}

export function saveBookings(bookings) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
    window.dispatchEvent(new Event('skillswap-bookings-updated'))
}

export function updateBooking(bookingId, updates) {
    const bookings = getBookings()

    const updated = bookings.map((booking) =>
        booking.id === bookingId
            ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
            : booking
    )

    saveBookings(updated)
    return updated
}

export function addBookingMessage(bookingId, user, message) {
    const text = message.trim()
    if (!text) return false

    const bookings = getBookings()
    let found = false

    const updated = bookings.map((booking) => {
        if (booking.id !== bookingId) return booking

        found = true

        const isStudent =
            booking.studentEmail &&
            booking.studentEmail.toLowerCase() === user.email?.toLowerCase()

        const isTeacher =
            booking.teacherEmail &&
            booking.teacherEmail.toLowerCase() === user.email?.toLowerCase()

        if (!isStudent && !isTeacher) return booking

        const messages = Array.isArray(booking.messages)
            ? booking.messages
            : []

        return {
            ...booking,
            messages: [
                ...messages,
                {
                    id: crypto.randomUUID(),
                    senderEmail: user.email,
                    senderName: user.name,
                    text,
                    createdAt: new Date().toISOString(),
                },
            ],
            updatedAt: new Date().toISOString(),
        }
    })

    if (found) saveBookings(updated)
    return found
}

export function canViewBooking(booking, user) {
    if (!booking || !user?.email) return false

    const email = user.email.toLowerCase()

    return (
        booking.studentEmail?.toLowerCase() === email ||
        booking.teacherEmail?.toLowerCase() === email
    )
}
