import { CommonUtils } from "../utils";

/**
 * A service for managing asynchronous polling mechanisms.
 */
export class PollService {
    private static pollingMap = new Map<string, NodeJS.Timeout>();
    private static pollCountMap = new Map<string, number>();
    private static callbackMap = new Map<string, () => Promise<boolean>>();
    private static completedCallbackMap = new Map<string, (callbackId: string, isAbortedOrFailed: boolean, totalPollsDone: number) => void>();
    private static pausedPolls = new Set<string>();
    private static pollInfoMap = new Map<string, { interval: number, maxPolls: number }>();


    /**
     * Generate a unique poll identifier.
     * @private
     * @returns A unique identifier as a string.
     */
    private static createPollId(): string {
        return CommonUtils.randomString();
    }

    /**
     * Executes the polling callback, awaits its completion, then waits for the given interval before 
     * initiating the next poll cycle.
     * @private
     * @param id - The poll identifier.
     * @param interval - The interval between polls in milliseconds.
     * @param maxRetries - The maximum number of polls. Default is 0 (unlimited).
     */
    private static async pollAsync(id: string, interval: number, maxRetries: number) {
        const callbackAsync = this.callbackMap.get(id);
        if (!callbackAsync) return;

        let shouldStop = false;

        try {
            shouldStop = await callbackAsync();
        } catch (error) {
            // If the callback errors, we'll consider this as a reason to stop and report the polling as failed.
            const completedCallback = this.completedCallbackMap.get(id);
            const totalPollsDone = this.pollCountMap.get(id) || 0;
            completedCallback?.(id, true, totalPollsDone); // marking isAbortedOrFailed as true due to error
            this.cleanUpPoll(id);
            return;
        }

        const pollCount = (this.pollCountMap.get(id) || 0) + 1;
        this.pollCountMap.set(id, pollCount);

        // Determine if we should stop the polling due to the callback result or max polls reached
        if (shouldStop || (maxRetries !== 0 && pollCount >= maxRetries)) {
            this.stopPolling(id);
        } else if (!this.pausedPolls.has(id)) {
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
    static registerPollCallback(
        callback: () => Promise<boolean>,
        completedCallback: (callbackId: string, isAbortedOrFailed: boolean, totalRetries: number) => void,
        interval: number,
        maxRetries = 0,
        startImmediately = false
    ): string {
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
    static startPolling(id: string) {
        const pollInfo = this.pollInfoMap.get(id);
        if (!pollInfo) return;

        this.pollAsync(id, pollInfo.interval, pollInfo.maxPolls);
    }

    /**
     * Pause the polling for a given identifier.
     * @param id - The poll identifier.
     */
    static pausePolling(id: string) {
        this.pausedPolls.add(id);
    }

    /**
   * Resume the polling for a given identifier.
   * Uses stored values for interval and maxPolls unless new ones are provided.
   * @param id - The poll identifier.
   * @param interval - (Optional) New interval between polls in milliseconds.
   * @param maxRetries - (Optional) New maximum number of polls. 
   */
    static resumePolling(id: string, interval?: number, maxRetries?: number) {
        if (!this.pausedPolls.has(id)) {
            return;
        }

        const pollInfo = this.pollInfoMap.get(id);
        if (!pollInfo) return;

        const effectiveInterval = interval ?? pollInfo.interval;
        const effectiveMaxPolls = maxRetries ?? pollInfo.maxPolls;

        this.pollInfoMap.set(id, { interval: effectiveInterval, maxPolls: effectiveMaxPolls });

        this.pausedPolls.delete(id);
        this.startPolling(id);
    }


    /**
      * Stop the polling for a given identifier calling completedCallback with isAbortedOrFailed as true.
      * @param id - The poll identifier.
      */
    static stopPolling(id: string) {
        if (this.pollingMap.has(id)) {
            const totalPollsDone = this.pollCountMap.get(id) || 0;
            const completedCallback = this.completedCallbackMap.get(id);
            completedCallback?.(id, true, totalPollsDone);
            this.cleanUpPoll(id);            
        }
    }

    /**
     *  Abort the polling for a given identifier without calling completedCallback.
     * @param id - The poll identifier.
     */
    static abortPolling(id: string) {
        if (this.pollingMap.has(id)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.cleanUpPoll(id);
        }
    }


    /**
     * Stop and remove all active polls calling completedCallback with isAbortedOrFailed as true.
     */
    static stopAllPolling() {
        const ids = Array.from(this.pollingMap.keys());
        ids.forEach(id => {
            this.stopPolling(id);
        });
    }

     /**
     * Stop and remove all active polls without calling completedCallback.
     */
     static abortAllPolling() {
        const ids = Array.from(this.pollingMap.keys());
        ids.forEach(id => {
            this.abortPolling(id);
        });
    }

    /**
     * Check if a given identifier is currently being polled.
     * @param id - The poll identifier.
     * @returns True if the identifier is being polled, false otherwise.
     */
    static isPolling(id: string): boolean {
        return this.pollingMap.has(id);
    }


    private static cleanUpPoll(id: string) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clearTimeout(this.pollingMap.get(id)!);        
        this.pollingMap.delete(id);
        this.callbackMap.delete(id);
        this.pollInfoMap.delete(id);
        this.pollCountMap.delete(id);
        this.pausedPolls.delete(id);
        this.completedCallbackMap.delete(id);        
    }
}
