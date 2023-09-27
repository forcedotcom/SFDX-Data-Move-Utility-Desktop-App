"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollService = void 0;
const utils_1 = require("../utils");
/**
 * A service for managing asynchronous polling mechanisms.
 */
class PollService {
    /**
     * Generate a unique poll identifier.
     * @private
     * @returns A unique identifier as a string.
     */
    static createPollId() {
        return utils_1.CommonUtils.randomString();
    }
    /**
     * Executes the polling callback, awaits its completion, then waits for the given interval before
     * initiating the next poll cycle.
     * @private
     * @param id - The poll identifier.
     * @param interval - The interval between polls in milliseconds.
     * @param maxRetries - The maximum number of polls. Default is 0 (unlimited).
     */
    static async pollAsync(id, interval, maxRetries) {
        const callbackAsync = this.callbackMap.get(id);
        if (!callbackAsync)
            return;
        let shouldStop = false;
        try {
            shouldStop = await callbackAsync();
        }
        catch (error) {
            // If the callback errors, we'll consider this as a reason to stop and report the polling as failed.
            const completedCallback = this.completedCallbackMap.get(id);
            const totalPollsDone = this.pollCountMap.get(id) || 0;
            completedCallback === null || completedCallback === void 0 ? void 0 : completedCallback(id, true, totalPollsDone); // marking isAbortedOrFailed as true due to error
            this.cleanUpPoll(id);
            return;
        }
        const pollCount = (this.pollCountMap.get(id) || 0) + 1;
        this.pollCountMap.set(id, pollCount);
        // Determine if we should stop the polling due to the callback result or max polls reached
        if (shouldStop || (maxRetries !== 0 && pollCount >= maxRetries)) {
            const completedCallback = this.completedCallbackMap.get(id);
            const totalPollsDone = this.pollCountMap.get(id) || 0;
            completedCallback === null || completedCallback === void 0 ? void 0 : completedCallback(id, false, totalPollsDone);
            this.cleanUpPoll(id);
        }
        else if (!this.pausedPolls.has(id)) {
            this.pollingMap.set(id, setTimeout(() => this.pollAsync(id, interval, maxRetries), interval));
        }
    }
    /**
     * Register a callback to be polled at specified intervals.
     * If the callback is already registered, return its associated ID.
     * @param callback - The asynchronous callback to be polled.
     * @param completedCallback - Callback executed when polling operation is completed, aborted, or fails.
     * @param interval - The interval between polls in milliseconds.
     * @param maxRetries - The maximum number of polls. Default is 0 (unlimited).
     * @param startImmediately - Whether to start polling immediately upon registration.
     * @returns The poll identifier.
     */
    static registerPollCallback(callback, completedCallback, interval, maxRetries = 0, startImmediately = false) {
        // Check if callback is already registered
        for (const [existingId, existingCallback] of this.callbackMap.entries()) {
            if (existingCallback === callback) {
                return existingId;
            }
        }
        const id = this.createPollId();
        this.callbackMap.set(id, callback);
        this.completedCallbackMap.set(id, completedCallback);
        this.pollInfoMap.set(id, { interval, maxPolls: maxRetries });
        if (startImmediately) {
            this.startPolling(id);
        }
        return id;
    }
    /**
   * Start the polling for a given identifier.
   * @param id - The poll identifier.
   */
    static startPolling(id) {
        const pollInfo = this.pollInfoMap.get(id);
        if (!pollInfo)
            return;
        this.pollAsync(id, pollInfo.interval, pollInfo.maxPolls);
    }
    /**
     * Pause the polling for a given identifier.
     * @param id - The poll identifier.
     */
    static pausePolling(id) {
        this.pausedPolls.add(id);
    }
    /**
   * Resume the polling for a given identifier.
   * Uses stored values for interval and maxPolls unless new ones are provided.
   * @param id - The poll identifier.
   * @param interval - (Optional) New interval between polls in milliseconds.
   * @param maxRetries - (Optional) New maximum number of polls.
   */
    static resumePolling(id, interval, maxRetries) {
        if (!this.pausedPolls.has(id)) {
            return;
        }
        const pollInfo = this.pollInfoMap.get(id);
        if (!pollInfo)
            return;
        const effectiveInterval = interval !== null && interval !== void 0 ? interval : pollInfo.interval;
        const effectiveMaxPolls = maxRetries !== null && maxRetries !== void 0 ? maxRetries : pollInfo.maxPolls;
        this.pollInfoMap.set(id, { interval: effectiveInterval, maxPolls: effectiveMaxPolls });
        this.pausedPolls.delete(id);
        this.startPolling(id);
    }
    /**
      * Stop the polling for a given identifier.
      * @param id - The poll identifier.
      */
    static stopPolling(id) {
        if (this.pollingMap.has(id)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            clearTimeout(this.pollingMap.get(id));
            const totalPollsDone = this.pollCountMap.get(id) || 0;
            const completedCallback = this.completedCallbackMap.get(id);
            completedCallback === null || completedCallback === void 0 ? void 0 : completedCallback(id, true, totalPollsDone);
            this.cleanUpPoll(id);
        }
    }
    /**
     * Stop and remove all active polls.
     */
    static stopAllPolling() {
        this.pollingMap.forEach((timeout, id) => {
            clearTimeout(timeout);
            this.pollingMap.delete(id);
            this.callbackMap.delete(id);
            this.pollCountMap.delete(id);
            this.pausedPolls.delete(id);
        });
    }
    /**
     * Check if a given identifier is currently being polled.
     * @param id - The poll identifier.
     * @returns True if the identifier is being polled, false otherwise.
     */
    static isPolling(id) {
        return this.pollingMap.has(id);
    }
    static cleanUpPoll(id) {
        this.pollingMap.delete(id);
        this.callbackMap.delete(id);
        this.completedCallbackMap.delete(id);
        this.pollInfoMap.delete(id);
        this.pollCountMap.delete(id);
        this.pausedPolls.delete(id);
    }
}
exports.PollService = PollService;
PollService.pollingMap = new Map();
PollService.pollCountMap = new Map();
PollService.callbackMap = new Map();
PollService.completedCallbackMap = new Map();
PollService.pausedPolls = new Set();
PollService.pollInfoMap = new Map();
//# sourceMappingURL=poll-service.js.map