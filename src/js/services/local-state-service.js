"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStateService = void 0;
/** The service for managing local state. */
class LocalStateService {
    /**
     * Saves a value (object or primitive) into window.localStorage.
     *
     * @template T The type of value to be stored.
     * @param {string} key The key under which the value will be stored.
     * @param {T} value The value to be stored.
     */
    static setLocalState(key, value) {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const serializedValue = JSON.stringify(value);
                window.localStorage.setItem(key, serializedValue);
            }
            catch (error) {
                // Fail silently
            }
        }
    }
    /**
     * Loads a value from window.localStorage.
     *
     * @template T The type of value to be retrieved.
     * @param {string} key The key under which the value is stored.
     * @param {T | null} fallbackValue The fallback value to be returned if the value is not found.
     * @returns {T | null} The retrieved value or null if it's a primitive and not found.
     */
    static getLocalState(key, fallbackValue = null) {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const serializedValue = window.localStorage.getItem(key);
                if (serializedValue === null) {
                    return fallbackValue;
                }
                return JSON.parse(serializedValue);
            }
            catch (error) {
                return fallbackValue;
            }
        }
        return fallbackValue;
    }
}
exports.LocalStateService = LocalStateService;
//# sourceMappingURL=local-state-service.js.map