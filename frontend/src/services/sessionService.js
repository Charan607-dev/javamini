import api from './api';
import authService from './authService';
import requestService from './requestService';

export const sessionService = {
    /**
     * Get all schedules/sessions
     */
    getAllSessions: async () => {
        return await api.get('/schedules');
    },

    /**
     * Get schedules for a specific user ID
     */
    getSessionsByUserId: async (userId) => {
        return await api.get(`/schedules/user/${encodeURIComponent(userId)}`);
    },

    /**
     * Create a scheduled study session or availability slot
     */
    createSession: async (sessionData) => {
        const user = authService.getCurrentUser();
        const userId = sessionData.userId || user?.id || user?.email;

        const payload = {
            title: sessionData.title,
            date: sessionData.date,
            time: sessionData.time,
            dayOfWeek: sessionData.dayOfWeek || '',
            startTime: sessionData.startTime || '',
            endTime: sessionData.endTime || '',
            description: sessionData.description || '',
            userId: userId
        };

        return await api.post(`/schedules?userId=${encodeURIComponent(userId)}`, payload);
    },

    /**
     * Delete a session
     */
    deleteSession: async (id) => {
        return await api.del(`/schedules/${id}`);
    },

    /**
     * Get all upcoming confirmed exchange sessions for the logged-in student
     */
    getUpcomingSessions: async () => {
        const user = authService.getCurrentUser();
        if (!user) return [];

        try {
            const allBookings = await requestService.getAllRequests();
            const userEmail = (user.email || '').toLowerCase();

            return allBookings.filter(b => {
                const isParticipant =
                    (b.studentEmail || '').toLowerCase() === userEmail ||
                    (b.teacherEmail || '').toLowerCase() === userEmail;
                const isConfirmed =
                    (b.status || '').toLowerCase() === 'confirmed' ||
                    (b.status || '').toLowerCase() === 'accepted';
                return isParticipant && isConfirmed;
            });
        } catch {
            return [];
        }
    }
};

export default sessionService;
