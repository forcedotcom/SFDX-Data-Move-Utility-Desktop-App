"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserConsoleLogService = void 0;
const models_1 = require("../models");
/**
 * A service that allows subscribing to console events.
 */
class BrowserConsoleLogService {
    constructor() {
        this.subscribers = {};
        /* #region Private */
        /**  Original console.log function. */
        this._originalConsoleLog = console.log;
        /**  Original console.warn function. */
        this._originalConsoleWarn = console.warn;
        /**  Original console.error function. */
        this._originalConsoleError = console.error;
        /**  Original console.clear function. */
        this._originalConsoleClear = console.clear;
        this.hookIntoConsole();
    }
    /**
     * Subscribe to console events.
     * @param event - The type of console event (log, warn, error).
     * @param callback - The function to be called when the event is triggered.
     * @returns A function that can be called to unsubscribe from the event.
     */
    on(event, callback) {
        var _a;
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        (_a = this.subscribers[event]) === null || _a === void 0 ? void 0 : _a.push(callback);
        return () => {
            var _a, _b;
            const index = (_a = this.subscribers[event]) === null || _a === void 0 ? void 0 : _a.indexOf(callback);
            if (index > -1) {
                (_b = this.subscribers[event]) === null || _b === void 0 ? void 0 : _b.splice(index, 1);
            }
        };
    }
    /**
     * Hooks into the console to be able to notify subscribers.
     */
    hookIntoConsole() {
        console.log = function consoleLog(message, ...optionalParams) {
            this._originalConsoleLog(message, ...optionalParams);
            this.notifySubscribers(models_1.ConsoleEventType.log, message);
        }.bind(this);
        console.warn = function consoleWarn(message, ...optionalParams) {
            this._originalConsoleWarn(message, ...optionalParams);
            this.notifySubscribers(models_1.ConsoleEventType.warn, message);
        }.bind(this);
        console.error = function consoleError(message, ...optionalParams) {
            this._originalConsoleError(message, ...optionalParams);
            this.notifySubscribers(models_1.ConsoleEventType.error, message);
        }.bind(this);
        console.clear = function consoleClear() {
            this._originalConsoleClear();
            this.notifySubscribers(models_1.ConsoleEventType.clear, null);
        }.bind(this);
    }
    notifySubscribers(eventType, message) {
        var _a;
        (_a = this.subscribers[eventType]) === null || _a === void 0 ? void 0 : _a.forEach(callback => callback(message));
    }
}
exports.BrowserConsoleLogService = BrowserConsoleLogService;
//# sourceMappingURL=browser-console-service.js.map