/** Browser console event model. */
export enum ConsoleEventType {
    log = 'log',
    warn = 'warn',
    error = 'error',
    clear = 'clear'
}

/** A function that can be called to unsubscribe from the event. */
export interface IBrowserConsoleEventUnsubscriber {
    (): void;
}