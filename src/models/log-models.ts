/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * An object type representing information about a function call stack.
 */
export type CallerInfo = {
    /** The function name. */
    functionName: string;
    /** The line number. */
    lineNumber: number;
    /** The full stack trace. */
    fullStackTrace: string;
};