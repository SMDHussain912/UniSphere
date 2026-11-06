// UniSphere Shared API Client M2 — Minimal Working Version
// Injectable HTTP transport, platform-independent, credential-provider agnostic.

// ============================================================
// Types
// ============================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user: {
    _id: string;
    fullname: { firstname: string; lastname?: string };
    email: string;
    role: string;
    active: boolean;
  };
  token: string;
  message: string;
}

export interface TerminalInputParams {
  execId: string;
  input: string;
}

export interface TerminalResizeParams {
  execId: string;
  width: number;
  height: number;
}

export interface TerminalExecResult {
  execId: string;
  wsUrl: string;
}

export interface LabSessionCreateParams {
  userId: string;
  sessionType: 'code-server' | 'desktop';
}

export interface LabSessionInfoResult {
  sessionId: string;
  containerId: string;
  port: number;
  url: string;
  status: string;
}

// ============================================================
// API Client Base
// ============================================================

export class BaseApiClient {
  /** Injected HTTP transport implementation */
  transport: {
    fetch: (url: string, init: { method: string; headers?: Record<string, string>; body?: any; credentials?: string }) => Promise<Response>;
    onAuthFailure?: () => void;
  };
  baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.transport = { fetch: async () => new Response() };
  }

  buildUrl(endpoint: string): string {
    const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/api/${clean}`;
  }
}

// ============================================================
// Auth API
// ============================================================

export class AuthApi {
  constructor(protected client: BaseApiClient) {}

  async login(params: { email: string; password: string }): Promise<LoginResult> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/auth/login')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'include' as const,
        }
      );

      const data: any = await response.json;
      return {
        success: data.success ?? false,
        user: data.data?.user || { _id: '', fullname: { firstname: '', lastname: '' }, email: '', role: 'user', active: false },
        token: data.token || '',
        message: data.message || 'Login failed',
      };
    } catch (err) {
      return {
        success: false,
        user: { _id: '', fullname: { firstname: '', lastname: '' }, email: '', role: 'user', active: false },
        token: '',
        message: err instanceof Error ? err.message : 'Login failed',
      };
    }
  }

  async refresh(): Promise<{ success: boolean; token: string | null; message: string }> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/auth/refresh')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'omit' as const,
        }
      );

      const data: any = await response.json;
      if (data.success && data.token) {
        return { success: true, token: data.token, message: data.message };
      }
      return { success: false, token: null, message: data.message || 'Session expired' };
    } catch (err) {
      return { success: false, token: null, message: err instanceof Error ? err.message : 'Network error' };
    }
  }
}

// ============================================================
// Terminal API
// ============================================================

export interface TerminalInputParams {
  execId: string;
  input: string;
}

export interface TerminalResizeParams {
  execId: string;
  width: number;
  height: number;
}

export interface TerminalExecResult {
  execId: string;
  wsUrl: string;
}

export class TerminalApi {
  constructor(protected client: BaseApiClient) {}

  async create(sessionId: string): Promise<TerminalExecResult> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/terminals/create')}?sessionId=${sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'omit' as const,
        }
      );

      const data: any = await response.json;
      return { execId: data.execId || '', wsUrl: data.wsUrl || '' };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create terminal');
    }
  }

  async input(params: TerminalInputParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/terminals/input')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          credentials: 'omit' as const,
        }
      );

      const data: any = await response.json;
      return { success: data.success ?? false, message: data.message || '' };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to send terminal input');
    }
  }

  async resize(params: TerminalResizeParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/terminals/resize')}?execId=${params.execId}&width=${params.width}&height=${params.height}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'omit' as const,
        }
      );

      const data: any = await response.json;
      return { success: data.success ?? false, message: data.message || '' };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to resize terminal');
    }
  }

  async stop(execId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/terminals/stop')}?execId=${execId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'omit' as const,
        }
      );

      const data: any = await response.json;
      return { success: data.success ?? false, message: data.message || '' };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to stop terminal');
    }
  }

  async count(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/terminals/count')}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'omit' as const,
        }
      );

      const data: any = await response.json;
      return { success: data.success ?? false, count: data.count || 0, message: data.message || '' };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get terminal count');
    }
  }
}

// Export types (no duplicate export conflicts)

// ============================================================
// Lab API
// ============================================================

export interface LabSessionCreateParams {
  userId: string;
  sessionType: 'code-server' | 'desktop';
}

export interface LabSessionInfoResult {
  sessionId: string;
  containerId: string;
  port: number;
  url: string;
  status: string;
}

export class LabApi {
  constructor(protected client: BaseApiClient) {}

  async create(params: LabSessionCreateParams): Promise<LabSessionInfoResult> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/labs/sessions')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          credentials: 'omit' as const,
        }
      );

      const data: any = await response.json;
      return {
        sessionId: data.sessionId || '',
        containerId: data.containerId || '',
        port: data.port || 0,
        url: data.url || '',
        status: data.status || 'active',
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create lab session');
    }
  }

  async getActive(): Promise<LabSessionInfoResult> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/labs/sessions/active')}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' as const,
        }
      );

      const data: any = await response.json;
      return {
        sessionId: data.sessionId || '',
        containerId: data.containerId || '',
        port: data.port || 0,
        url: data.url || '',
        status: data.status || 'active',
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get active session');
    }
  }

  async getMySessions(): Promise<LabSessionInfoResult[]> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/labs/sessions')}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' as const,
        }
      );

      const data: any = await response.json;
      return (data.sessions || []).map((s: any) => ({
        sessionId: s.sessionId || '',
        containerId: s.containerId || '',
        port: s.port || 0,
        url: s.url || '',
        status: s.status || 'active',
      }));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get lab sessions');
    }
  }

  async stop(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.transport.fetch(
        `${this.client.buildUrl('/api/v1/labs/sessions/' + sessionId + '/stop')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' as const,
        }
      );

      const data: any = await response.json;
      return { success: data.success ?? false, message: data.message || '' };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to stop lab session');
    }
  }
}

// Export lab types (type-only to avoid duplicate export conflicts)
