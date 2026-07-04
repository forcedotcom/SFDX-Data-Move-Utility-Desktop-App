/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * An object type representing the arguments for translation functions.
 */
export type TranslateFnArgs = {
    /** The translation key. */
    key: string;
    /** The translation parameters. */
    params?: { [param: string]: any };
    /** The language code. */
    lang?: string;
    /** Whether to use markdown format. */
    useMarkdownFormat?: boolean;
    /** Whether to use the key as template. */
    keyAsTemplate?: boolean;
    /** The default text to use if the key is not found. */
    default?: string;
    /** Whether to use the key as default text. */
    useKeyAsDefault?: boolean;
};