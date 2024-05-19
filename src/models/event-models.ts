import { ProgressEventType } from "../common";

/**
 * An interface representing an action event arguments.
 */
export interface IActionEventArgs<T> {
    /** The event arguments. */
    args: IActionEventArgParam<T>;
}

/**
 * An interface representing an action event parameter.
 */
export interface IActionEventArgParam<T> {
    /** The event id. To uniquely identify the event. */
    id?: string;
    /** The id of the component associated with this event. */
    componentId?: string;
    /** The broadcast channel associated with this event. */
    channel?: string;
    /** The event source. */
    eventSource?: string;
    /** The name of the action. */
    action?: string;
    /** The arguments of the action. */
    args?: T[];
}

/**
 * An interface representing information about long operation progress.
 */
export interface IProgressInfo {
    /** The message or the translation key. */
    messageOrKey?: string;
    /** The parameters for translation if messageOrKey is a translation key. */
    translationParams?: any;
    /** Additional data associated with the progress. */
    data?: any;
    /** Indicates whether the progress is an error. */
    isError?: boolean;
    /** The exit code of the operation. */
    exitCode?: number;
    /** The type of the long operation event. */
    type?: ProgressEventType;
}

/**
 * An interface representing ui-router navigation event.
 */
export interface IStateChangeEvent {
    /** The name of the event. */
    name: string;
    /** The target amgular scope. */
    targetScope: angular.IScope;
    /** Whether the navigation is prevented. */
    defaultPrevented: boolean;
    /** Prevents the navigation from happening. */
    preventDefault(): void;
}

/**
 * An interface representing ui-router state.
 */
export interface IState {
    /** The name of the state. */
    name: string;
    /** The url of the state. */
    url?: string;
    /** The template of the state. */
    templateUrl?: string;
    /** The controller of the state. */
    controller?: string;
}
