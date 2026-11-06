export interface LoginCredentials {
    email: string;
    password: string;
}
export interface LoginResult {
    success: boolean;
    user: {
        _id: string;
        fullname: {
            firstname: string;
            lastname?: string;
        };
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
export declare class BaseApiClient {
    /** Injected HTTP transport implementation */
    transport: {
        fetch: (url: string, init: {
            method: string;
            headers?: Record<string, string>;
            body?: any;
            credentials?: string;
        }) => Promise<Response>;
        onAuthFailure?: () => void;
    };
    baseUrl: string;
    constructor(baseUrl?: string);
    buildUrl(endpoint: string): string;
}
export declare class AuthApi {
    protected client: BaseApiClient;
    constructor(client: BaseApiClient);
    login(params: {
        email: string;
        password: string;
    }): Promise<LoginResult>;
    refresh(): Promise<{
        success: boolean;
        token: string | null;
        message: string;
    }>;
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
