/**
 * Service for monitoring network status and handling related events.
 */
export class NetworkStatusService {
    
    private connectionLostListeners: (() => void)[] = [];
    private connectionRestoredListeners: (() => void)[] = [];

    /**
     * Creates an instance of NetworkStatusService.
     * Initializes event listeners for 'online' and 'offline' events.
     */
    constructor() {
        this.initializeEventListeners();
    }

    /**
     * Subscribes to a network status event.
     * @param {'connectionLost' | 'connectionRestored'} event - The network status event to subscribe to.
     * @param {() => void} callback - The callback function to be invoked when the event occurs.
     */
    on(event: 'connectionLost' | 'connectionRestored', callback: () => void): void {
        if (event === 'connectionLost') {
            this.connectionLostListeners.push(callback);
        } else if (event === 'connectionRestored') {
            this.connectionRestoredListeners.push(callback);
        }
    }

    /**
     * Unsubscribes from a network status event.
     * @param {'connectionLost' | 'connectionRestored'} event - The network status event to unsubscribe from.
     * @param {() => void} callback - The callback function to be removed.
     */
    off(event: 'connectionLost' | 'connectionRestored', callback: () => void): void {
        if (event === 'connectionLost') {
            this.connectionLostListeners = this.connectionLostListeners.filter(listener => listener !== callback);
        } else if (event === 'connectionRestored') {
            this.connectionRestoredListeners = this.connectionRestoredListeners.filter(listener => listener !== callback);
        }
    }

    /**
     * Removes all event subscriptions for connectionLost and connectionRestored events.
     */
    removeAllSubscriptions(): void {
        this.connectionLostListeners = [];
        this.connectionRestoredListeners = [];
    }

    /**
     * Checks the current network connection status.
     * @returns {boolean} A boolean value indicating if the browser is online.
     */
    checkConnection(): boolean {
        return navigator.onLine;
    }

    /**
     * Initializes event listeners for 'online' and 'offline' events.
     * When the online event occurs, invokes all connectionRestored listeners.
     * When the offline event occurs, invokes all connectionLost listeners.
     */
    private initializeEventListeners(): void {
        window.addEventListener('online', () => {
            this.connectionRestoredListeners.forEach(callback => callback());
        });

        window.addEventListener('offline', () => {
            this.connectionLostListeners.forEach(callback => callback());
        });
    }
}
