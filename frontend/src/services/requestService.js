import api from './api';
import authService from './authService';

const BOOKINGS_KEY = 'skillswap_bookings';

export const requestService = {
    /**
     * Get all booking / exchange requests from backend
     */
    getAllRequests: async () => {
        try {
            const bookings = await api.get('/bookings');
            if (Array.isArray(bookings)) {
                localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
                window.dispatchEvent(new Event('skillswap-bookings-updated'));
            }
            return bookings;
        } catch (error) {
            console.warn('Backend unavailable, falling back to cached bookings', error);
            return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
        }
    },

    /**
     * Get request by ID
     */
    getRequestById: async (id) => {
        return await api.get(`/bookings/${id}`);
    },

    /**
     * Get requests where the user is the student (requester)
     */
    getRequestsByStudent: async (email) => {
        try {
            return await api.get(`/bookings/student/${encodeURIComponent(email)}`);
        } catch {
            const all = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
            return all.filter(b => (b.studentEmail || '').toLowerCase() === email.toLowerCase());
        }
    },

    /**
     * Get requests where the user is the teacher (provider)
     */
    getRequestsByTeacher: async (email) => {
        try {
            return await api.get(`/bookings/teacher/${encodeURIComponent(email)}`);
        } catch {
            const all = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
            return all.filter(b => (b.teacherEmail || '').toLowerCase() === email.toLowerCase());
        }
    },

    /**
     * Submit a new skill exchange request / booking
     */
    createRequest: async (requestData) => {
        const user = authService.getCurrentUser();
        const studentId = requestData.studentId || user?.id || user?.email;

        const payload = {
            skillId: requestData.skillId,
            exchangeSkillId: requestData.exchangeSkillId || '',
            date: requestData.date,
            time: requestData.time,
            studentId: studentId,
            notes: requestData.notes || ''
        };

        const createdBooking = await api.post(`/bookings?studentId=${encodeURIComponent(studentId)}`, payload);

        // Update local cache
        const local = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
        local.push(createdBooking);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(local));
        window.dispatchEvent(new Event('skillswap-bookings-updated'));

        return createdBooking;
    },

    /**
     * Update the status of a booking (e.g. Accepted, Rejected, Postponed, Completed)
     */
    updateStatus: async (id, status) => {
        const updated = await api.put(`/bookings/${id}/status`, { status });

        const local = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
        const updatedList = local.map(b => (b.id === id ? { ...b, status } : b));
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new Event('skillswap-bookings-updated'));

        return updated;
    },

    /**
     * Accept a request
     */
    acceptRequest: async (id) => {
        return await requestService.updateStatus(id, 'Accepted');
    },

    /**
     * Reject a request
     */
    rejectRequest: async (id) => {
        return await requestService.updateStatus(id, 'Rejected');
    },

    /**
     * Reschedule an existing booking session
     */
    rescheduleBooking: async (id, { proposedDate, proposedTime, rescheduleProposedBy, userIdentifier }) => {
        const user = authService.getCurrentUser();
        const effectiveUser = userIdentifier || user?.email || user?.id;

        const payload = {
            proposedDate,
            proposedTime,
            rescheduleProposedBy: rescheduleProposedBy || user?.email || effectiveUser
        };

        const updated = await api.post(`/bookings/${id}/reschedule?userIdentifier=${encodeURIComponent(effectiveUser)}`, payload);

        // Update local cache
        const local = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
        const updatedList = local.map(b => (b.id === id ? { ...b, ...updated } : b));
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new Event('skillswap-bookings-updated'));

        return updated;
    },

    /**
     * Accept a reschedule proposal
     */
    acceptReschedule: async (id, userIdentifier) => {
        const user = authService.getCurrentUser();
        const effectiveUser = userIdentifier || user?.email || user?.id;

        const updated = await api.post(`/bookings/${id}/reschedule/accept?userIdentifier=${encodeURIComponent(effectiveUser)}`, {
            userIdentifier: effectiveUser
        });

        // Update local cache
        const local = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
        const updatedList = local.map(b => (b.id === id ? { ...b, ...updated } : b));
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new Event('skillswap-bookings-updated'));

        return updated;
    },

    /**
     * Update booking details directly
     */
    updateBooking: async (id, updates) => {
        const updated = await api.put(`/bookings/${id}`, updates);

        const local = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
        const updatedList = local.map(b => (b.id === id ? { ...b, ...updated } : b));
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new Event('skillswap-bookings-updated'));

        return updated;
    },

    /**
     * Delete / cancel a request
     */
    deleteRequest: async (id) => {
        await api.del(`/bookings/${id}`);

        const local = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
        const filtered = local.filter(b => b.id !== id);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new Event('skillswap-bookings-updated'));
    }
};

export default requestService;

