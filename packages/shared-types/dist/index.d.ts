export interface User {
    _id: string;
    fullname: {
        firstname: string;
        lastname?: string;
    };
    email: string;
    phone?: string;
    dob?: string;
    gender?: string;
    qualification?: string;
    role: 'student' | 'staff' | 'admin' | 'user';
    active: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string | {
        code: string;
        message: string;
        path?: string[];
    };
    metadata?: {
        requestId: string;
        timestamp: string;
        path: string;
    };
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: User;
}
export interface RefreshTokenResponse {
    token: string;
}
export interface SessionData {
    sessionId: string;
    userId: string;
    expiresAt: string;
    terminalCount: number;
}
export interface TerminalInfo {
    execId: string;
    wsUrl: string;
    workspacePath: string;
    sessionId: string;
}
export interface TerminalResize {
    width: number;
    height: number;
    timestamp: number;
}
export interface LabSessionInfo {
    sessionId: string;
    containerId: string;
    port: number;
    url: string;
    userId: string;
    status: 'active' | 'stopped' | 'expired';
}
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
export interface EndpointDefinition {
    path: string;
    method: Method;
    auth: 'public' | 'private' | 'admin';
    requireBody?: boolean;
}
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode: number, code?: string);
}
export declare const AUTH_ENDPOINTS: {
    readonly LOGIN: '/api/v1/auth/login';
    readonly REGISTER: '/api/v1/auth/register';
    readonly LOGOUT: '/api/v1/auth/logout';
    readonly ME: '/api/v1/auth/me';
    readonly REFRESH: '/api/v1/auth/refresh';
};
export declare const TERMINAL_ENDPOINTS: {
    readonly CREATE: '/api/v1/terminals/create';
    readonly INPUT: '/api/v1/terminals/input';
    readonly RESIZE: '/api/v1/terminals/resize';
    readonly STOP: '/api/v1/terminals/stop';
    readonly COUNT: '/api/v1/terminals/count';
};
export declare const LAB_ENDPOINTS: {
    readonly CREATE_SESSION: '/api/v1/labs/sessions';
    readonly STOP_SESSION: '/api/v1/labs/sessions/:sessionId';
    readonly GET_SESSION: '/api/v1/labs/sessions/:sessionId';
    readonly LIST_SESSIONS: '/api/v1/labs/sessions';
};
export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];
export type TerminalEndpoint = typeof TERMINAL_ENDPOINTS[keyof typeof TERMINAL_ENDPOINTS];
export type LabEndpoint = typeof LAB_ENDPOINTS[keyof typeof LAB_ENDPOINTS];
