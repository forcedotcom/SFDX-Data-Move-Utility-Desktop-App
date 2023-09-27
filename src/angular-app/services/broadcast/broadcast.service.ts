import angular from "angular";
import { IActionEventArgParam } from "../../../models";
import { BroadcastCallback, BroadcastService } from "../../../services";


/**
 * Service for broadcasting events to subscribed listeners.
 */
export interface IBroadcastService {
    /**
     * Broadcasts an event to all listeners.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    broadcastAsync(channel: string | string[], ...args: any[]): Promise<any[]>;

    /**
     * Broadcasts an event to all listeners.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    broadcast(channel: string | string[], ...args: any[]): any[];

    /**
     * Broadcasts an action event to all listeners.
     * @param channel The channel to broadcast to.
     * @param eventSource The source of the event, for example the component name.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    broadcastAction<T>(channel: string | string[], eventSource: string, args: IActionEventArgParam<T>): any[];

    /**
     * Registers a callback for an action event.
     * @param channel The channel to listen to.
     * @param eventSource The source of the event, for example the component name.
     * @param callback The callback to register.
     * @param $scope The scope to register the callback with. If specified, the callback will be automatically unregistered when the scope is destroyed.
     * @returns The callback that was registered.
     */
    onAction(channel: string | string[], eventSource: string, callback: BroadcastCallback, $scope?: angular.IScope): BroadcastCallback;

    /**
     * Registers a callback function.
     * @param channel The channel to listen to.
     * @param callback The callback to register.
     * @param $scope The scope to register the callback with. If specified, the callback will be automatically unregistered when the scope is destroyed.
     * @returns The callback that was registered.
     */
    on(channel: string | string[], callback: BroadcastCallback, $scope: angular.IScope): BroadcastCallback;

    /**
     * Unregisters a callback function.
     * @param channel The channel to unregister from.
     * @param callback The callback to unregister.
     */
    off(channel?: string | string[], callback?: BroadcastCallback): void;
}


/**
 * Service for broadcasting events to subscribed listeners.
 */
export class AngularBroadcastService extends BroadcastService implements IBroadcastService {
    
}