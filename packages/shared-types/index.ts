// Shared TypeScript types used across all platforms
// Based on actual Express backend models and routes

// User model from Mongoose
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

// API Response wrapper
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

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ADD: LoginResult for API client use
export interface LoginResult {
  success: boolean;
  user: User;
  token: string;
  message: string;
}

// Refresh token response
export interface RefreshTokenResponse {
  token: string;
}

// Session types
export interface SessionData {
  sessionId: string;
  userId: string;
  expiresAt: string;
  terminalCount: number;
}

// Terminal types
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

// Lab session types
export interface LabSessionInfo {
  sessionId: string;
  containerId: string;
  port: number;
  url: string;
  userId: string;
  status: 'active' | 'stopped' | 'expired';
}

// API endpoint types (matching actual Express routes)
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface EndpointDefinition {
  path: string;
  method: Method;
  auth: 'public' | 'private' | 'admin';
  requireBody?: boolean;
}

// Express error types
export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code?: string) {
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
} as const;

export const TERMINAL_ENDPOINTS = {
  CREATE: '/api/v1/terminals/create',
  INPUT: '/api/v1/terminals/input',
  RESIZE: '/api/v1/terminals/resize',
  STOP: '/api/v1/terminals/stop',
  COUNT: '/api/v1/terminals/count',
} as const;

export const LAB_ENDPOINTS = {
  CREATE_SESSION: '/api/v1/labs/sessions',
  STOP_SESSION: '/api/v1/labs/sessions/:sessionId',
  GET_SESSION: '/api/v1/labs/sessions/:sessionId',
  LIST_SESSIONS: '/api/v1/labs/sessions',
} as const;

// Export union types for endpoint selection
export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];
export type TerminalEndpoint = typeof TERMINAL_ENDPOINTS[keyof typeof TERMINAL_ENDPOINTS];
export type LabEndpoint = typeof LAB_ENDPOINTS[keyof typeof LAB_ENDPOINTS];
