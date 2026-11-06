import type { ApiResponse } from '../shared-types';
import type { LoginCredentials, RefreshTokenResponse } from '../shared-types';
export type RequestInit = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    credentials?: 'include' | 'omit' | 'same-origin';
};
export interface Transport {
    fetch: (url: string, init: RequestInit) => Promise<Response>;
    onAuthFailure?: () => void;
}
export declare class BaseApiClient {
    protected transport: Transport;
    protected baseUrl: string;
    private token;
    constructor(transport: Transport, baseUrl?: string);
    getToken(): string | null;
    setToken(token: string): void;
    clearToken(): void;
    getBaseUrl(): string;
    protected buildUrl(endpoint: string): string;
    protected handleResponse<T>(response: Response): Promise<ApiResponse<T>>;
    protected refreshToken(): Promise<ApiResponse<RefreshTokenResponse>>;
    logout(): Promise<ApiResponse<void>>;
    get baseUrl(): string;
}
export declare class AuthApi {
    protected client: BaseApiClient;
    constructor(client: BaseApiClient);
    login(params: LoginCredentials): Promise<LoginResult>;
    refresh(): Promise<{
        success: boolean;
        token: string | null;
        message: string;
    }>;
}
export type { LoginCredentials };
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
export declare class TerminalApi {
    protected client: BaseApiClient;
    constructor(client: BaseApiClient);
    create(sessionId: string): Promise<TerminalExecResult>;
    input(params: TerminalInputParams): Promise<{
        success: boolean;
        message: string;
    }>;
    resize(params: TerminalResizeParams): Promise<{
        success: boolean;
        message: string;
    }>;
    stop(execId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    count(): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
}
export { TerminalInputParams, TerminalResizeParams, TerminalExecResult };
export interface LabSessionCreateParams {
    userId: string;
    sessionType: 'code-server' | 'desktop';
}
export interface LabSessionInfoResult {
    sessionId: string;
    containerId: string;
    port: number;
    url: string;
    status: 'active' | 'stopped' | 'expired';
}
export declare class LabApi {
    protected client: BaseApiClient;
    constructor(client: BaseApiClient);
    create(params: LabSessionCreateParams): Promise<LabSessionInfoResult>;
    getActive(): Promise<LabSessionInfoResult>;
    getMySessions(): Promise<LabSessionInfoResult[]>;
    stop(sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export { LabSessionCreateParams, LabSessionInfoResult };
