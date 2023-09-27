"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkStatusService = void 0;
/**
 * Service for monitoring network status and handling related events.
 */
class NetworkStatusService {
    /**
     * Creates an instance of NetworkStatusService.
     * Initializes event listeners for 'online' and 'offline' events.
     */
    constructor() {
        this.connectionLostListeners = [];
        this.connectionRestoredListeners = [];
        this.initializeEventListeners();
    }
    /**
     * Subscribes to a network status event.
     * @param {'connectionLost' | 'connectionRestored'} event - The network status event to subscribe to.
     * @param {() => void} callback - The callback function to be invoked when the event occurs.
     */
    on(event, callback) {
        if (event === 'connectionLost') {
            this.connectionLostListeners.push(callback);
        }
        else if (event === 'connectionRestored') {
            this.connectionRestoredListeners.push(callback);
        }
    }
    /**
     * Unsubscribes from a network status event.
     * @param {'connectionLost' | 'connectionRestored'} event - The network status event to unsubscribe from.
     * @param {() => void} callback - The callback function to be removed.
     */
    off(event, callback) {
        if (event === 'connectionLost') {
            this.connectionLostListeners = this.connectionLostListeners.filter(listener => listener !== callback);
        }
        else if (event === 'connectionRestored') {
            this.connectionRestoredListeners = this.connectionRestoredListeners.filter(listener => listener !== callback);
        }
    }
    /**
     * Removes all event subscriptions for connectionLost and connectionRestored events.
     */
    removeAllSubscriptions() {
        this.connectionLostListeners = [];
        this.connectionRestoredListeners = [];
    }
    /**
     * Checks the current network connection status.
     * @returns {boolean} A boolean value indicating if the browser is online.
     */
    checkConnection() {
        return navigator.onLine;
    }
    /**
     * Initializes event listeners for 'online' and 'offline' events.
     * When the online event occurs, invokes all connectionRestored listeners.
     * When the offline event occurs, invokes all connectionLost listeners.
     */
    initializeEventListeners() {
        window.addEventListener('online', () => {
            this.connectionRestoredListeners.forEach(callback => callback());
        });
        window.addEventListener('offline', () => {
            this.connectionLostListeners.forEach(callback => callback());
        });
    }
}
exports.NetworkStatusService = NetworkStatusService;
//# sourceMappingURL=network-status-service.js.map