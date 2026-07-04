/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
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