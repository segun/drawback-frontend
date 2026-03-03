/**
 * Centralized validation patterns for authentication
 */

/** Email validation pattern - matches standard email format */
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/** Display name validation pattern - matches @ followed by 2-29 letters, numbers, or underscores */
export const DISPLAY_NAME_PATTERN = /^@[a-zA-Z0-9_]{2,29}$/
