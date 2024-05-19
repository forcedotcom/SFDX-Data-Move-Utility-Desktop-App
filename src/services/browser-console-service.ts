import { ConsoleEventType, IBrowserConsoleEventUnsubscriber } from "../models";

/**
 * A service that allows subscribing to console events.
 */
export class BrowserConsoleLogService {

    private subscribers: {
        [key in ConsoleEventType]?: Array<(message: any) => void>
    } = {};

    constructor() {
        this.hookIntoConsole();
    }

    /**
     * Subscribe to console events.
     * @param event - The type of console event (log, warn, error).
     * @param callback - The function to be called when the event is triggered.
     * @returns A function that can be called to unsubscribe from the event.
     */
    on(event: ConsoleEventType, callback: (message: any) => void): IBrowserConsoleEventUnsubscriber {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event]?.push(callback);

        return () => {
            const index = this.subscribers[event]?.indexOf(callback);
            if (index > -1) {
                this.subscribers[event]?.splice(index, 1);
            }
        };
    }

    /* #region Private */
    /**  Original console.log function. */
    private _originalConsoleLog = console.log;
    /**  Original console.warn function. */
    private _originalConsoleWarn = console.warn;
    /**  Original console.error function. */
    private _originalConsoleError = console.error;
    /**  Original console.clear function. */
    private _originalConsoleClear = console.clear;

    /**
     * Hooks into the console to be able to notify subscribers.
     */
    private hookIntoConsole() {

        console.log = function consoleLog(message: any, ...optionalParams: any[]) {
            this._originalConsoleLog(message, ...optionalParams);
            this.notifySubscribers(ConsoleEventType.log, message);
        }.bind(this);

        console.warn = function consoleWarn(message: any, ...optionalParams: any[]) {
            this._originalConsoleWarn(message, ...optionalParams);
            this.notifySubscribers(ConsoleEventType.warn, message);
        }.bind(this);

        console.error = function consoleError(message: any, ...optionalParams: any[]) {
            this._originalConsoleError(message, ...optionalParams);
            this.notifySubscribers(ConsoleEventType.error, message);
        }.bind(this);

        console.clear = function consoleClear() {
            this._originalConsoleClear();
            this.notifySubscribers(ConsoleEventType.clear, null);
        }.bind(this);

    }

    private notifySubscribers(eventType: ConsoleEventType, message: any) {
        this.subscribers[eventType]?.forEach(callback => callback(message));
    }
    /* #endregion */
}
