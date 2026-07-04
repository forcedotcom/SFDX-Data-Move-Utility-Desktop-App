/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import angular from 'angular';

class UiDividerDirective implements angular.IDirective {

    restrict = 'E';  // Element directive
    replace = true;
    template = '<div class="vr"></div>';

    static factory(): angular.IDirectiveFactory {
        return () => new UiDividerDirective();
    }
}

export const UiDividerModule = angular.module('uiDividerDirectiveModule', [])
    .directive('uiDivider', UiDividerDirective.factory());
