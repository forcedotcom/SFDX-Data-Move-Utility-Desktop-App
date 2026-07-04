/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import { ITranslationService } from ".";


export class TranslationFilter {
    constructor(private $translate: ITranslationService) { }

    filter(input: string, args: { [key: string]: string }, lang?: string): string {
        return this.$translate.translate({ key: input, params: args, lang });
    }
}