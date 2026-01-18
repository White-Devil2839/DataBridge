/**
 * Application Constants
 */

// Job Status
export const JOB_STATUS = {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
};

// Job Status Labels
export const JOB_STATUS_LABELS = {
    [JOB_STATUS.PENDING]: 'Pending',
    [JOB_STATUS.RUNNING]: 'Running',
    [JOB_STATUS.SUCCESS]: 'Success',
    [JOB_STATUS.FAILED]: 'Failed'
};

// Job Status Colors (Tailwind classes)
export const JOB_STATUS_COLORS = {
    [JOB_STATUS.PENDING]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500'
    },
    [JOB_STATUS.RUNNING]: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
    },
    [JOB_STATUS.SUCCESS]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        dot: 'bg-green-500'
    },
    [JOB_STATUS.FAILED]: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        dot: 'bg-red-500'
    }
};

// Auth Types
export const AUTH_TYPES = {
    NONE: 'NONE',
    API_KEY: 'API_KEY',
    BEARER: 'BEARER'
};

// Auth Type Labels
export const AUTH_TYPE_LABELS = {
    [AUTH_TYPES.NONE]: 'No Authentication',
    [AUTH_TYPES.API_KEY]: 'API Key',
    [AUTH_TYPES.BEARER]: 'Bearer Token'
};

// User Roles
export const USER_ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN'
};

// User Role Labels
export const USER_ROLE_LABELS = {
    [USER_ROLES.USER]: 'User',
    [USER_ROLES.ADMIN]: 'Administrator'
};

// HTTP Methods
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    LIMIT_OPTIONS: [10, 20, 50, 100]
};

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me'
    },
    CONNECTORS: {
        LIST: '/connectors',
        CREATE: '/connectors',
        GET: (id) => `/connectors/${id}`,
        UPDATE: (id) => `/connectors/${id}`,
        DELETE: (id) => `/connectors/${id}`,
        SYNC: (id) => `/connectors/${id}/sync`
    },
    JOBS: {
        LIST: '/jobs',
        GET: (id) => `/jobs/${id}`,
        RETRY: (id) => `/jobs/${id}/retry`
    },
    DATA: {
        RAW: '/data/raw',
        NORMALIZED: '/data/normalized',
        EXPORT: '/data/normalized/export'
    },
    HEALTH: '/health'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    SIDEBAR_COLLAPSED: 'sidebarCollapsed'
};

// Theme
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

// Chart Colors
export const CHART_COLORS = {
    PRIMARY: '#6366f1',    // Indigo
    SECONDARY: '#8b5cf6',  // Purple
    SUCCESS: '#22c55e',    // Green
    WARNING: '#f59e0b',    // Amber
    DANGER: '#ef4444',     // Red
    INFO: '#06b6d4',       // Cyan
    NEUTRAL: '#64748b'     // Slate
};

// Date ranges for filters
export const DATE_RANGES = {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    LAST_7_DAYS: 'last7days',
    LAST_30_DAYS: 'last30days',
    THIS_MONTH: 'thisMonth',
    LAST_MONTH: 'lastMonth',
    CUSTOM: 'custom'
};

export const DATE_RANGE_LABELS = {
    [DATE_RANGES.TODAY]: 'Today',
    [DATE_RANGES.YESTERDAY]: 'Yesterday',
    [DATE_RANGES.LAST_7_DAYS]: 'Last 7 Days',
    [DATE_RANGES.LAST_30_DAYS]: 'Last 30 Days',
    [DATE_RANGES.THIS_MONTH]: 'This Month',
    [DATE_RANGES.LAST_MONTH]: 'Last Month',
    [DATE_RANGES.CUSTOM]: 'Custom Range'
};

// Connector template providers
export const PROVIDERS = {
    ALPHA_VANTAGE: 'Alpha Vantage',
    COINGECKO: 'CoinGecko',
    NEWSAPI: 'NewsAPI',
    FINNHUB: 'Finnhub',
    EXCHANGERATE: 'ExchangeRate API',
    CUSTOM: 'Custom'
};

// Rate limit defaults
export const RATE_LIMIT_DEFAULTS = {
    requestsPerMinute: 60,
    requestsPerSecond: 5,
    retryAttempts: 3,
    retryDelayMs: 1000
};

// Animation durations (ms)
export const ANIMATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
};
