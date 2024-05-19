import angular from "angular";
import { IActionEventArgParam, IProgressInfo } from "../models";
import { ProgressEventType } from "../common";
import { TranslationService } from "./translation-service";

export type BroadcastCallback = (...args: any[]) => any;

/**
 * A service for broadcasting events.
 */
export class BroadcastService {
    private static listeners: { [channel: string]: BroadcastCallback[] } = {};
    private static scopeListeners: Map<angular.IScope, BroadcastCallback[]> = new Map();

    /**
     * Broadcasts an event to all listeners. Instance method.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    async broadcastAsync(channel: string | string[], ...args: any[]): Promise<any[]> {
        return BroadcastService.broadcastAsync(channel, ...args);
    }

    /**
     * Broadcasts an event asynchronously to all listeners. Static method.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    static async broadcastAsync(channel: string | string[], ...args: any[]): Promise<any[]> {
        const channels = typeof channel === 'string' ? [channel] : channel;
        const allPromises: Promise<any[]>[] = [];
        for (const ch of channels) {
            if (!BroadcastService.listeners[ch]) continue;
            const promises = BroadcastService.listeners[ch].map(callback => Promise.resolve(callback(...args)));
            allPromises.push(Promise.all(promises));
        }
        const results = (await Promise.all(allPromises)).flat();
        return results;
    }

    /**
     * Broadcasts an event to all listeners. Instance method.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    broadcast(channel: string | string[], ...args: any[]): any[] {
        return BroadcastService.broadcast(channel, ...args);
    }

    /**
     * Broadcasts an event to all listeners. Static method.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    static broadcast(channel: string | string[], ...args: any[]): any[] {
        const channels = typeof channel === 'string' ? [channel] : channel;
        const allResults: any[] = [];
        for (const ch of channels) {
            // Allows to broadcast to all listeners of a channel that starts with the specified channel.
            // For example, if the channel is 'LongOperation:stdOutData', 
            // the broadcast will be sent to all listeners of 'LongOperation:stdOutData' and 'LongOperation'.
            const listeners = Object.entries(BroadcastService.listeners).filter(([channel]) => ch.startsWith(channel));
            listeners.forEach(([, callbacks]) => {
                callbacks.forEach(callback => {
                    const result = callback(...args);
                    if (!(result instanceof Promise)) {
                        allResults.push(result);
                    }
                });
            });
        }
        return allResults;
    }

    /**
     * Broadcasts an action event to all listeners. Instance method.
     * @param channel The channel to broadcast to.
     * @param eventSource The source of the event, for example the component name.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    broadcastAction<T>(channel: string | string[], eventSource: string, args: IActionEventArgParam<T>): any[] {
        return BroadcastService.broadcastAction<T>(channel, eventSource, args);
    }

    /**
     * Broadcasts an action event to all listeners. Static method.
     * @param channel The channel to broadcast to.
     * @param eventSource The source of the event, for example the component name.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    static broadcastAction<T>(channel: string | string[], eventSource: string, args: IActionEventArgParam<T>): any[] {
        return BroadcastService.broadcast(channel, {
            ...args,
            ...{ eventSource, channel }
        } as IActionEventArgParam<T>);
    }

    /**
     * Registers a callback for an action event. Instance method.
     * @param channel The channel to listen to.
     * @param eventSource The source of the event, for example the component name.
     * @param callback The callback to register.
     * @param $scope The scope to register the callback with. If specified, the callback will be automatically unregistered when the scope is destroyed.
     * @returns The callback that was registered.
     */
    onAction(channel: string | string[], eventSource: string, callback: BroadcastCallback, $scope?: angular.IScope): BroadcastCallback {
        return BroadcastService.onAction(channel, eventSource, callback, $scope);
    }

    /**
     * Registers a callback for an action event. Static method.
     * @param channel The channel to listen to.
     * @param eventSource The source of the event, for example the component name.
     * @param callback The callback to register.
     * @param $scope The scope to register the callback with. If specified, the callback will be automatically unregistered when the scope is destroyed.
     * @returns The callback that was registered.
     */
    static onAction(channel: string | string[], eventSource: string, callback: BroadcastCallback, $scope?: angular.IScope): BroadcastCallback {
        return BroadcastService.on(channel, (args: IActionEventArgParam<any>) => {
            // Allows to listen to all events that starts with the specified event source.
            // For example, if the event source is 'ConsoleService',
            // the callback will be called for all events that starts with 'ConsoleService',
            // including 'ConsoleService:runCommand'.
            if (args?.eventSource?.startsWith(eventSource) || !eventSource) {
                callback(args);
            }
        }, $scope);
    }

    /**
     * Registers a callback function. Instance method.
     * @param channel The channel to listen to.
     * @param callback The callback to register.
     * @param $scope The scope to register the callback with. If specified, the callback will be automatically unregistered when the scope is destroyed.
     * @returns The callback that was registered.
     */
    on(channel: string | string[], callback: BroadcastCallback, $scope: angular.IScope): BroadcastCallback {
        return BroadcastService.on(channel, callback, $scope);
    }

    /**
     * Registers a callback function. Static method.
     * @param channel The channel to listen to.
     * @param callback The callback to register.
     * @param $scope The scope to register the callback with. If specified, the callback will be automatically unregistered when the scope is destroyed.
     * @returns The callback that was registered.
     */
    static on(channel: string | string[], callback: BroadcastCallback, $scope?: angular.IScope): BroadcastCallback {
        const channels = typeof channel === 'string' ? [channel] : channel;
        for (const ch of channels) {
            if (!BroadcastService.listeners[ch]) {
                BroadcastService.listeners[ch] = [];
            }
            if (!BroadcastService.listeners[ch].includes(callback)) {
                BroadcastService.listeners[ch].push(callback);
            }
        }
        if ($scope) {
            if (!BroadcastService.scopeListeners.has($scope)) {
                BroadcastService.scopeListeners.set($scope, []);
                $scope.$on('$destroy', () => {
                    BroadcastService.scopeListeners.get($scope)?.forEach(scopeCallback => {
                        BroadcastService.off(null, scopeCallback);
                    });
                    BroadcastService.scopeListeners.delete($scope);
                });
            }
            if (!BroadcastService.scopeListeners.get($scope).includes(callback)) {
                BroadcastService.scopeListeners.get($scope).push(callback);
            }
        }
        return callback;
    }

    /**
     * Unregisters a callback function. Instance method.
     * @param channel The channel to unregister from.
     * @param callback The callback to unregister.
     */
    off(channel?: string | string[], callback?: BroadcastCallback) {
        BroadcastService.off(channel, callback);
    }

    /**
     * Unregisters a callback function. Static method.
     * @param channel The channel to unregister from.
     * @param callback The callback to unregister.
     */
    static off(channel?: string | string[], callback?: BroadcastCallback) {
        const channels = channel ? (typeof channel === 'string' ? [channel] : channel) : Object.keys(BroadcastService.listeners);
        for (const ch of channels) {
            // Find all channels that starts with the specified channel.
            // For example, if the channel is 'LongOperation',
            // the callback will be unregistered from all channels that starts with 'LongOperation' including 'LongOperation:stdOutData'.
            const actualChannels = Object.keys(BroadcastService.listeners).filter(c => c.startsWith(ch));
            for (const actualChannel of actualChannels) {
                if (!BroadcastService.listeners[actualChannel]) continue;
                if (callback) {
                    const index = BroadcastService.listeners[actualChannel]?.indexOf(callback);
                    if (index != undefined && index > -1) {
                        BroadcastService.listeners[actualChannel].splice(index, 1);
                    }
                } else {
                    BroadcastService.listeners[actualChannel] = [];
                }
            }
        }
    }


    /* #region Application Helper Methods */
    /**
     * Broadcasts a progress message to all listeners.
     * @param type The type of the progress.
     * @param source The source of the progress, for example the component name.
     * @param messageOrKey The message or the translation key.
     * @param translationParams The parameters for translation if messageOrKey is a translation key.
     * @returns An array of results from the listeners.
     */
    static broadcastProgressMessage(type: ProgressEventType, source: string, messageOrKey?: string, translationParams?: any): any[] {
        return BroadcastService.broadcastProgress(type, source, {
            type,
            messageOrKey: TranslationService.translate({ key: messageOrKey, params: translationParams })
        });
    }

    /**
     * Broadcasts a progress info to all listeners.
     * @param type The type of the progress.
     * @param source The source of the progress, for example the component name.
     * @param info The progress information.
     * @returns An array of results from the listeners.
     */
    static broadcastProgress(type: ProgressEventType, source: string, info?: IProgressInfo): any[] {
        return BroadcastService.broadcastAction<IProgressInfo>(type, source, {
            args: info ? [
                info
            ] : []
        });
    }


    /**
     * Broadcasts a progress message to all listeners, this message includes the user name.
     * @param type The type of the progress.
     * @param source The source of the progress, for example the component name.
     * @param key The translation key.
     * @param userName The user name.
     * @param objectName The object name.
     * @returns An array of results from the listeners.
     */
    static broascastProgressUserMessage(type: ProgressEventType, source: string, key: string, userName?: string, objectName?: string): any[] {
        return BroadcastService.broadcastProgressMessage(type, source, key, {
            USER_NAME: userName || '',
            OBJECT_NAME: objectName || ''
        });
    }
    /* #endregion */
}
