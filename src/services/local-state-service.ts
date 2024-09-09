/** The service for managing local state. */
export class LocalStateService {
    /**
     * Saves a value (object or primitive) into window.localStorage.
     *
     * @template T The type of value to be stored.
     * @param {string} key The key under which the value will be stored.
     * @param {T} value The value to be stored.
     */
    public static setLocalState<T>(key: string, value: T): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const serializedValue = JSON.stringify(value);
                window.localStorage.setItem(key, serializedValue);
            } catch (error) {
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
    public static getLocalState<T>(key: string, fallbackValue: T = null): T | null {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const serializedValue = window.localStorage.getItem(key);
                if (serializedValue === null) {
                    return fallbackValue;
                }
                return JSON.parse(serializedValue) as T;
            } catch (error) {
                return fallbackValue;
            }
        }
        return fallbackValue;
    }


    /**
     * Returns all items in local storage. 
     * @returns  An array of key-value pairs of all items in local storage
     */
    static getAllLocalStorageItems(): { key: string, value: string }[] {
        const items: { key: string, value: string }[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== null) { // TypeScript null check
                const value = localStorage.getItem(key);
                if (value !== null) { // Ensure value is not null
                    items.push({ key, value });
                }
            }
        }
        return items;
    }
}