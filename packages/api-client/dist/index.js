// UniSphere Shared API Client
// Injectable HTTP transport, platform-independent, credential-provider agnostic.
// No browser/localStorage/NodeFS dependencies in shared code.
// No hardcoded credentials. No platform-specific storage.
// Runtime imports that need values
import { AppError as AppErrorVal } from '../shared-types';
// ============================================================
// Base API Client
// ============================================================
export class BaseApiClient {
    constructor(transport, baseUrl = 'http://localhost:3000') {
        this.token = null;
        this.transport = transport;
        this.baseUrl = baseUrl;
    }
    getToken() { return this.token; }
    setToken(token) { this.token = token; }
    clearToken() { this.token = null; }
    getBaseUrl() { return this.baseUrl; }
    buildUrl(endpoint) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${this.baseUrl}/api/${cleanEndpoint}`;
    }
    async handleResponse(response) {
        const status = response.status;
        if (status >= 200 && status < 300) {
            const data = await response.json();
            return {
                success: data.success ?? true,
                message: data.message,
                data: data.data,
                error: data.error ? { code: data.error.code, message: data.error.message, path: data.error.path } : undefined,
                metadata: data.metadata,
            };
        }
        if (status === 401) {
            this.onAuthFailure?.();
            return {
                success: false,
                message: 'Authentication failed. Please log in again.',
                error: new AppErrorVal('Authentication failed. Please log in again.', 401),
            };
        }
        if (status === 403) {
            return {
                success: false,
                message: 'Forbidden. Insufficient permissions.',
                error: new AppErrorVal('Forbidden. Insufficient permissions.', 403),
            };
        }
        if (status === 400) {
            return {
                success: false,
                message: 'Bad request.',
                error: new AppErrorVal('Bad request.', 400),
            };
        }
        return {
            success: false,
            message: 'Internal server error.',
            error: new AppErrorVal('Internal server error.', 500),
        };
    }
    async refreshToken() {
        if (!this.baseUrl) {
            return { success: false, message: 'No base URL configured', error: new AppErrorVal('Configuration error', 500) };
        }
        try {
            const response = await this.transport.fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            return await this.handleResponse(response);
        }
        catch (err) {
            return {
                success: false,
                message: 'Network error during token refresh.',
                error: new AppErrorVal('Network error during token refresh.', 500),
            };
        }
    }
    async logout() {
        try {
            await this.transport.fetch(`${this.baseUrl}/api/v1/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
        }
        catch (err) {
            // Continue regardless
        }
        this.clearToken();
        this.onAuthFailure?.();
        return { success: true, message: 'Logged out successfully' };
    }
    get baseUrl() { return this.baseUrl; }
}
// ============================================================
// Auth API
// ============================================================
export class AuthApi {
    constructor(client) {
        this.client = client;
    }
    async login(params) {
        const formData = new URLSearchParams();
        formData.append('email', params.email);
        formData.append('password', params.password);
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(AuthEndpoint.LOGIN)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
            });
            const result = await this.client.handleResponse(response);
            if (result.success && result.data) {
                client.setToken(result.data.token);
            }
            return {
                success: result.success,
                user: result.data?.user || {},
                token: result.data?.token || '',
                message: result.message || '',
            };
        }
        catch (err) {
            return {
                success: false,
                user: {},
                token: '',
                message: err instanceof Error ? err.message : 'Login failed',
            };
        }
    }
    async refresh() {
        const result = await this.client.refreshToken();
        if (result.success && result.data) {
            return { success: true, token: result.data.token, message: result.message };
        }
        client.clearToken();
        this.client.transport.onAuthFailure?.();
        return { success: false, token: null, message: result.message || 'Session expired. Please log in.' };
    }
}
export class TerminalApi {
    constructor(client) {
        this.client = client;
    }
    async create(sessionId) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(TerminalEndpoint.CREATE)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            const result = await this.client.handleResponse(response);
            if (result.success && result.data) {
                return result.data;
            }
            throw result.error || new AppErrorVal('Failed to create terminal', 500);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to create terminal', 500);
        }
    }
    async input(params) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(TerminalEndpoint.INPUT)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                credentials: 'omit',
            });
            return await this.client.handleResponse(response);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to send terminal input', 500);
        }
    }
    async resize(params) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(TERMINAL_ENDPOINTS.RESIZE)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                credentials: 'omit',
            });
            return await this.client.handleResponse(response);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to resize terminal', 500);
        }
    }
    async stop(execId) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(TERMINAL_ENDPOINTS.STOP)}?execId=${execId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            return await this.client.handleResponse(response);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to stop terminal', 500);
        }
    }
    async count() {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(TERMINAL_ENDPOINTS.COUNT)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            return await this.client.handleResponse(response);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to get terminal count', 500);
        }
    }
}
export class LabApi {
    constructor(client) {
        this.client = client;
    }
    async create(params) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(LabEndpoint.CREATE_SESSION)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                credentials: 'omit',
            });
            return await this.client.handleResponse(response);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to create lab session', 500);
        }
    }
    async getActive() {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(LabEndpoint.GET_SESSION).replace(':sessionId', 'active')}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            return await this.client.handleResponse(response);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to get active session', 500);
        }
    }
    async getMySessions() {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(LabEndpoint.LIST_SESSIONS)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            return await this.client.handleResponse(response);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to get lab sessions', 500);
        }
    }
    async stop(sessionId) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl(LabEndpoint.STOP_SESSION).replace(':sessionId', sessionId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            return await this.client.handleResponse(response);
        }
        catch (err) {
            throw err instanceof AppErrorVal ? err : new AppErrorVal(err.message || 'Failed to stop lab session', 500);
        }
    }
}
