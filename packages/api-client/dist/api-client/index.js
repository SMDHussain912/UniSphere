// UniSphere Shared API Client M2 — Minimal Working Version
// Injectable HTTP transport, platform-independent, credential-provider agnostic.
// ============================================================
// API Client Base
// ============================================================
export class BaseApiClient {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.transport = { fetch: async () => new Response() };
    }
    buildUrl(endpoint) {
        const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${this.baseUrl}/api/${clean}`;
    }
}
// ============================================================
// Auth API
// ============================================================
export class AuthApi {
    constructor(client) {
        this.client = client;
    }
    async login(params) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/auth/login')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            });
            const data = await response.json;
            return {
                success: data.success ?? false,
                user: data.data?.user || { _id: '', fullname: { firstname: '', lastname: '' }, email: '', role: 'user', active: false },
                token: data.token || '',
                message: data.message || 'Login failed',
            };
        }
        catch (err) {
            return {
                success: false,
                user: { _id: '', fullname: { firstname: '', lastname: '' }, email: '', role: 'user', active: false },
                token: '',
                message: err instanceof Error ? err.message : 'Login failed',
            };
        }
    }
    async refresh() {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/auth/refresh')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            const data = await response.json;
            if (data.success && data.token) {
                return { success: true, token: data.token, message: data.message };
            }
            return { success: false, token: null, message: data.message || 'Session expired' };
        }
        catch (err) {
            return { success: false, token: null, message: err instanceof Error ? err.message : 'Network error' };
        }
    }
}
export class TerminalApi {
    constructor(client) {
        this.client = client;
    }
    async create(sessionId) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/terminals/create')}?sessionId=${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            const data = await response.json;
            return { execId: data.execId || '', wsUrl: data.wsUrl || '' };
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to create terminal');
        }
    }
    async input(params) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/terminals/input')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                credentials: 'omit',
            });
            const data = await response.json;
            return { success: data.success ?? false, message: data.message || '' };
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to send terminal input');
        }
    }
    async resize(params) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/terminals/resize')}?execId=${params.execId}&width=${params.width}&height=${params.height}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            const data = await response.json;
            return { success: data.success ?? false, message: data.message || '' };
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to resize terminal');
        }
    }
    async stop(execId) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/terminals/stop')}?execId=${execId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            const data = await response.json;
            return { success: data.success ?? false, message: data.message || '' };
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to stop terminal');
        }
    }
    async count() {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/terminals/count')}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'omit',
            });
            const data = await response.json;
            return { success: data.success ?? false, count: data.count || 0, message: data.message || '' };
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to get terminal count');
        }
    }
}
export class LabApi {
    constructor(client) {
        this.client = client;
    }
    async create(params) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/labs/sessions')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                credentials: 'omit',
            });
            const data = await response.json;
            return {
                sessionId: data.sessionId || '',
                containerId: data.containerId || '',
                port: data.port || 0,
                url: data.url || '',
                status: data.status || 'active',
            };
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to create lab session');
        }
    }
    async getActive() {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/labs/sessions/active')}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json;
            return {
                sessionId: data.sessionId || '',
                containerId: data.containerId || '',
                port: data.port || 0,
                url: data.url || '',
                status: data.status || 'active',
            };
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to get active session');
        }
    }
    async getMySessions() {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/labs/sessions')}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json;
            return (data.sessions || []).map((s) => ({
                sessionId: s.sessionId || '',
                containerId: s.containerId || '',
                port: s.port || 0,
                url: s.url || '',
                status: s.status || 'active',
            }));
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to get lab sessions');
        }
    }
    async stop(sessionId) {
        try {
            const response = await this.client.transport.fetch(`${this.client.buildUrl('/api/v1/labs/sessions/' + sessionId + '/stop')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json;
            return { success: data.success ?? false, message: data.message || '' };
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to stop lab session');
        }
    }
}
// Export lab types (type-only to avoid duplicate export conflicts)
