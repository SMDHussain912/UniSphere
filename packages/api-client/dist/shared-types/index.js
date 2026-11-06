// Shared TypeScript types used across all platforms
// Based on actual Express backend models and routes
// Express error types
export class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code || `ERR_${statusCode}`;
    }
}
// Routing types for cross-platform API client
export const AUTH_ENDPOINTS = {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    REFRESH: '/api/v1/auth/refresh',
};
export const TERMINAL_ENDPOINTS = {
    CREATE: '/api/v1/terminals/create',
    INPUT: '/api/v1/terminals/input',
    RESIZE: '/api/v1/terminals/resize',
    STOP: '/api/v1/terminals/stop',
    COUNT: '/api/v1/terminals/count',
};
export const LAB_ENDPOINTS = {
    CREATE_SESSION: '/api/v1/labs/sessions',
    STOP_SESSION: '/api/v1/labs/sessions/:sessionId',
    GET_SESSION: '/api/v1/labs/sessions/:sessionId',
    LIST_SESSIONS: '/api/v1/labs/sessions',
};
