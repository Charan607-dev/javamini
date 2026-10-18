import api from './api';

const USER_KEY = 'skillswap_user';

export const authService = {
    /**
     * Authenticate user with email and password
     */
    login: async (email, password) => {
        const payload = {
            email: email.trim().toLowerCase(),
            password: password.trim()
        };
        const response = await api.post('/auth/login', payload);

        // Store active session in localStorage
        const user = {
            id: response.id,
            name: response.name,
            email: response.email,
            college: response.college,
            createdAt: response.createdAt
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        return user;
    },

    /**
     * Register a new user account
     */
    register: async ({ name, email, password, college }) => {
        const payload = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: (password || 'password123').trim(),
            college: college ? college.trim() : 'College / University'
        };
        const response = await api.post('/auth/register', payload);

        const user = {
            id: response.id,
            name: response.name,
            email: response.email,
            college: response.college,
            createdAt: response.createdAt
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        return user;
    },

    /**
     * Log out current user
     */
    logout: () => {
        localStorage.removeItem(USER_KEY);
        window.dispatchEvent(new Event('storage'));
    },

    /**
     * Retrieve currently logged-in user from local storage
     */
    getCurrentUser: () => {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        } catch {
            return null;
        }
    },

    /**
     * Check if a user is authenticated
     */
    isAuthenticated: () => {
        const user = authService.getCurrentUser();
        return Boolean(user && user.email);
    },

    /**
     * Fetch all users from the backend
     */
    getAllUsers: async () => {
        return await api.get('/users');
    },

    /**
     * Get user details by user ID
     */
    getUserById: async (id) => {
        return await api.get(`/users/${id}`);
    },

    /**
     * Get user details by email
     */
    getUserByEmail: async (email) => {
        return await api.get(`/users/email/${encodeURIComponent(email)}`);
    }
};

export default authService;
