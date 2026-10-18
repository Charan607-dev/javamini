/**
 * SkillSwap API Client
 * Centralized HTTP service for connecting to the Spring Boot REST backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Core HTTP request handler
 * @param {string} endpoint - API path (e.g. '/skills', '/auth/login')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} Parsed response data
 */
async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
    };

    const config = {
        ...options,
        headers,
        credentials: options.credentials || 'include'
    };

    try {
        const response = await fetch(url, config);

        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && data?.message)
                ? data.message
                : (typeof data === 'string' && data.length > 0)
                    ? data
                    : `HTTP error ${response.status}: ${response.statusText}`;

            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        // If server is unreachable or offline
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            const networkError = new Error('Cannot connect to backend server at ' + API_BASE_URL + '. Is Spring Boot running on port 8080?');
            networkError.status = 503;
            throw networkError;
        }
        throw err;
    }
}

export const api = {
    get: (endpoint, params = {}) => {
        const query = new URLSearchParams(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
        ).toString();
        const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;
        return request(fullEndpoint, { method: 'GET' });
    },

    post: (endpoint, body = {}) => {
        return request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put: (endpoint, body = {}) => {
        return request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    patch: (endpoint, body = {}) => {
        return request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    del: (endpoint) => {
        return request(endpoint, { method: 'DELETE' });
    },

    getBaseUrl: () => API_BASE_URL
};

export default api;
