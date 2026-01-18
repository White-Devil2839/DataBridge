/**
 * Common Utility Functions
 */

/**
 * Debounce function - delays execution until after wait milliseconds
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeoutId;

    const debounced = (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), wait);
    };

    debounced.cancel = () => {
        clearTimeout(timeoutId);
    };

    return debounced;
};

/**
 * Throttle function - limits execution to once per limit milliseconds
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;

    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => deepClone(item));
    }

    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
};

/**
 * Deep merge objects
 * @param {object} target - Target object
 * @param {...object} sources - Source objects
 * @returns {object} Merged object
 */
export const mergeDeep = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
};

/**
 * Check if value is a plain object
 * @param {any} item - Value to check
 * @returns {boolean}
 */
export const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Get nested value from object using dot notation
 * @param {object} obj - Object to get value from
 * @param {string} path - Dot-separated path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Value at path or default
 */
export const getNestedValue = (obj, path, defaultValue = undefined) => {
    if (!obj || !path) return defaultValue;

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined) {
            return defaultValue;
        }
        current = current[key];
    }

    return current !== undefined ? current : defaultValue;
};

/**
 * Set nested value in object using dot notation
 * @param {object} obj - Object to set value in
 * @param {string} path - Dot-separated path
 * @param {any} value - Value to set
 * @returns {object} Modified object
 */
export const setNestedValue = (obj, path, value) => {
    if (!path) return obj;

    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
};

/**
 * Classnames utility - combines class names conditionally
 * @param {...(string|object|array)} args - Class names or condition objects
 * @returns {string} Combined class names
 */
export const cn = (...args) => {
    const classes = [];

    for (const arg of args) {
        if (!arg) continue;

        if (typeof arg === 'string') {
            classes.push(arg);
        } else if (Array.isArray(arg)) {
            classes.push(cn(...arg));
        } else if (typeof arg === 'object') {
            for (const [key, value] of Object.entries(arg)) {
                if (value) {
                    classes.push(key);
                }
            }
        }
    }

    return classes.join(' ');
};

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export const generateId = (prefix = '') => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Download content as file
 * @param {string} content - Content to download
 * @param {string} filename - Filename
 * @param {string} type - MIME type
 */
export const downloadFile = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether copy was successful
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string (with or without leading ?)
 * @returns {object} Parsed parameters
 */
export const parseQueryString = (queryString) => {
    if (!queryString) return {};

    const query = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    const params = {};

    for (const pair of query.split('&')) {
        const [key, value] = pair.split('=').map(decodeURIComponent);
        if (key) {
            params[key] = value || '';
        }
    }

    return params;
};

/**
 * Build query string from object
 * @param {object} params - Parameters object
 * @returns {string} Query string (without leading ?)
 */
export const buildQueryString = (params) => {
    if (!params || Object.keys(params).length === 0) return '';

    return Object.entries(params)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
};

/**
 * Group array items by key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by or function returning key
 * @returns {object} Grouped object
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = typeof key === 'function' ? key(item) : item[key];
        (result[groupKey] = result[groupKey] || []).push(item);
        return result;
    }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = getNestedValue(a, key);
        const bVal = getNestedValue(b, key);

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
};
