/**
 * Form Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {boolean} requireHttps - Whether to require HTTPS
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateUrl = (url, requireHttps = false) => {
    if (!url) {
        return { isValid: false, error: 'URL is required' };
    }

    try {
        const parsed = new URL(url);
        if (requireHttps && parsed.protocol !== 'https:') {
            return { isValid: false, error: 'URL must use HTTPS' };
        }
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
        }
        return { isValid: true };
    } catch {
        return { isValid: false, error: 'Invalid URL format' };
    }
};

/**
 * Validate required field
 * @param {any} value - Value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateRequired = (value, fieldName = 'This field') => {
    if (value === null || value === undefined || value === '') {
        return { isValid: false, error: `${fieldName} is required` };
    }

    if (typeof value === 'string' && value.trim() === '') {
        return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true };
};

/**
 * Validate JSON string
 * @param {string} str - String to validate as JSON
 * @returns {{ isValid: boolean, parsed?: any, error?: string }}
 */
export const validateJsonString = (str) => {
    if (!str) {
        return { isValid: false, error: 'JSON string is required' };
    }

    try {
        const parsed = JSON.parse(str);
        return { isValid: true, parsed };
    } catch (e) {
        return { isValid: false, error: 'Invalid JSON format' };
    }
};

/**
 * Validate minimum length
 * @param {string} value - Value to check
 * @param {number} minLength - Minimum length required
 * @param {string} fieldName - Name of the field for error message
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
    if (!value || value.length < minLength) {
        return {
            isValid: false,
            error: `${fieldName} must be at least ${minLength} characters`
        };
    }
    return { isValid: true };
};

/**
 * Validate maximum length
 * @param {string} value - Value to check
 * @param {number} maxLength - Maximum length allowed
 * @param {string} fieldName - Name of the field for error message
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
    if (value && value.length > maxLength) {
        return {
            isValid: false,
            error: `${fieldName} must be at most ${maxLength} characters`
        };
    }
    return { isValid: true };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{ isValid: boolean, error?: string, strength: 'weak'|'medium'|'strong' }}
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, error: 'Password is required', strength: 'weak' };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            error: 'Password must be at least 8 characters',
            strength: 'weak'
        };
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strengthScore = [hasUppercase, hasLowercase, hasNumber, hasSpecial]
        .filter(Boolean).length;

    if (strengthScore <= 2) {
        return { isValid: true, strength: 'weak' };
    } else if (strengthScore === 3) {
        return { isValid: true, strength: 'medium' };
    } else {
        return { isValid: true, strength: 'strong' };
    }
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Name of the field for error message
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateNumberRange = (value, min, max, fieldName = 'Value') => {
    if (typeof value !== 'number' || isNaN(value)) {
        return { isValid: false, error: `${fieldName} must be a valid number` };
    }

    if (value < min) {
        return { isValid: false, error: `${fieldName} must be at least ${min}` };
    }

    if (value > max) {
        return { isValid: false, error: `${fieldName} must be at most ${max}` };
    }

    return { isValid: true };
};

/**
 * Validate cron expression (simple check)
 * @param {string} cron - Cron expression to validate
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateCronExpression = (cron) => {
    if (!cron) {
        return { isValid: false, error: 'Cron expression is required' };
    }

    // Simple validation: check for 5 or 6 space-separated parts
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
        return {
            isValid: false,
            error: 'Cron expression must have 5 or 6 parts (minute hour day month weekday [year])'
        };
    }

    return { isValid: true };
};

/**
 * Run multiple validations and collect errors
 * @param {Array<{ validator: Function, args: any[], fieldName?: string }>} validations
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export const runValidations = (validations) => {
    const errors = {};
    let isValid = true;

    for (const { validator, args, fieldName } of validations) {
        const result = validator(...args);
        if (!result.isValid) {
            isValid = false;
            if (fieldName) {
                errors[fieldName] = result.error;
            }
        }
    }

    return { isValid, errors };
};
