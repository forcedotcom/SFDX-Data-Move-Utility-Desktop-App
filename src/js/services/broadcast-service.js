"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastService = void 0;
const translation_service_1 = require("./translation-service");
/**
 * A service for broadcasting events.
 */
class BroadcastService {
    /**
     * Broadcasts an event to all listeners. Instance method.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    async broadcastAsync(channel, ...args) {
        return BroadcastService.broadcastAsync(channel, ...args);
    }
    /**
     * Broadcasts an event asynchronously to all listeners. Static method.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    static async broadcastAsync(channel, ...args) {
        const channels = typeof channel === 'string' ? [channel] : channel;
        const allPromises = [];
        for (const ch of channels) {
            if (!BroadcastService.listeners[ch])
                continue;
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
    broadcast(channel, ...args) {
        return BroadcastService.broadcast(channel, ...args);
    }
    /**
     * Broadcasts an event to all listeners. Static method.
     * @param channel The channel to broadcast to.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    static broadcast(channel, ...args) {
        const channels = typeof channel === 'string' ? [channel] : channel;
        const allResults = [];
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
    broadcastAction(channel, eventSource, args) {
        return BroadcastService.broadcastAction(channel, eventSource, args);
    }
    /**
     * Broadcasts an action event to all listeners. Static method.
     * @param channel The channel to broadcast to.
     * @param eventSource The source of the event, for example the component name.
     * @param args The arguments to pass to the listeners.
     * @returns An array of results from the listeners.
     */
    static broadcastAction(channel, eventSource, args) {
        return BroadcastService.broadcast(channel, {
            ...args,
            ...{ eventSource, channel }
        });
    }
    /**
     * Registers a callback for an action event. Instance method.
     * @param channel The channel to listen to.
     * @param eventSource The source of the event, for example the component name.
     * @param callback The callback to register.
     * @param $scope The scope to register the callback with. If specified, the callback will be automatically unregistered when the scope is destroyed.
     * @returns The callback that was registered.
     */
    onAction(channel, eventSource, callback, $scope) {
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
    static onAction(channel, eventSource, callback, $scope) {
        return BroadcastService.on(channel, (args) => {
            var _a;
            // Allows to listen to all events that starts with the specified event source.
            // For example, if the event source is 'ConsoleService',
            // the callback will be called for all events that starts with 'ConsoleService',
            // including 'ConsoleService:runCommand'.
            if (((_a = args === null || args === void 0 ? void 0 : args.eventSource) === null || _a === void 0 ? void 0 : _a.startsWith(eventSource)) || !eventSource) {
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
    on(channel, callback, $scope) {
        return BroadcastService.on(channel, callback, $scope);
    }
    /**
     * Registers a callback function. Static method.
     * @param channel The channel to listen to.
     * @param callback The callback to register.
     * @param $scope The scope to register the callback with. If specified, the callback will be automatically unregistered when the scope is destroyed.
     * @returns The callback that was registered.
     */
    static on(channel, callback, $scope) {
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
                    var _a;
                    (_a = BroadcastService.scopeListeners.get($scope)) === null || _a === void 0 ? void 0 : _a.forEach(scopeCallback => {
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
    off(channel, callback) {
        BroadcastService.off(channel, callback);
    }
    /**
     * Unregisters a callback function. Static method.
     * @param channel The channel to unregister from.
     * @param callback The callback to unregister.
     */
    static off(channel, callback) {
        var _a;
        const channels = channel ? (typeof channel === 'string' ? [channel] : channel) : Object.keys(BroadcastService.listeners);
        for (const ch of channels) {
            // Find all channels that starts with the specified channel.
            // For example, if the channel is 'LongOperation',
            // the callback will be unregistered from all channels that starts with 'LongOperation' including 'LongOperation:stdOutData'.
            const actualChannels = Object.keys(BroadcastService.listeners).filter(c => c.startsWith(ch));
            for (const actualChannel of actualChannels) {
                if (!BroadcastService.listeners[actualChannel])
                    continue;
                if (callback) {
                    const index = (_a = BroadcastService.listeners[actualChannel]) === null || _a === void 0 ? void 0 : _a.indexOf(callback);
                    if (index != undefined && index > -1) {
                        BroadcastService.listeners[actualChannel].splice(index, 1);
                    }
                }
                else {
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
    static broadcastProgressMessage(type, source, messageOrKey, translationParams) {
        return BroadcastService.broadcastProgress(type, source, {
            type,
            messageOrKey: translation_service_1.TranslationService.translate({ key: messageOrKey, params: translationParams })
        });
    }
    /**
     * Broadcasts a progress info to all listeners.
     * @param type The type of the progress.
     * @param source The source of the progress, for example the component name.
     * @param info The progress information.
     * @returns An array of results from the listeners.
     */
    static broadcastProgress(type, source, info) {
        return BroadcastService.broadcastAction(type, source, {
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
    static broascastProgressUserMessage(type, source, key, userName, objectName) {
        return BroadcastService.broadcastProgressMessage(type, source, key, {
            USER_NAME: userName || '',
            OBJECT_NAME: objectName || ''
        });
    }
}
exports.BroadcastService = BroadcastService;
BroadcastService.listeners = {};
BroadcastService.scopeListeners = new Map();
//# sourceMappingURL=broadcast-service.js.map