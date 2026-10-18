import api from './api';
import authService from './authService';

export const messageService = {
    /**
     * Get messages between two users, optionally filtered by bookingId
     */
    getConversation: async (user1, user2, bookingId = null) => {
        const params = {
            user1,
            user2,
        };
        if (bookingId) {
            params.bookingId = bookingId;
        }
        return await api.get('/messages/conversation', params);
    },

    /**
     * Get all messages attached to a specific booking session
     */
    getMessagesByBooking: async (bookingId) => {
        return await api.get(`/messages/booking/${encodeURIComponent(bookingId)}`);
    },

    /**
     * Get all messages for a specific user ID or email
     */
    getMessagesByUser: async (userId) => {
        return await api.get(`/messages/user/${encodeURIComponent(userId)}`);
    },

    /**
     * Send a new message to another user / booking session
     */
    sendMessage: async ({ senderId, receiverId, content, bookingId, senderEmail, senderName, receiverEmail }) => {
        const currentUser = authService.getCurrentUser();
        const effectiveSenderId = senderId || currentUser?.id || currentUser?.email;
        const effectiveSenderEmail = senderEmail || currentUser?.email;
        const effectiveSenderName = senderName || currentUser?.name;

        const payload = {
            senderId: effectiveSenderId,
            senderEmail: effectiveSenderEmail,
            senderName: effectiveSenderName,
            receiverId: receiverId,
            receiverEmail: receiverEmail,
            bookingId: bookingId,
            content: content.trim()
        };

        return await api.post(`/messages?senderId=${encodeURIComponent(effectiveSenderId)}`, payload);
    }
};

export default messageService;
