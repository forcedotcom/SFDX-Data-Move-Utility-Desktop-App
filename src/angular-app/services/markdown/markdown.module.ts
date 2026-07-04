/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */

import angular from 'angular';
import { AngularMarkdownService } from '.';


export const AngularMarkdownServiceModule = angular.module('markdownServiceModule', [])
    .service('$md', function () { return new AngularMarkdownService(); })
    .filter('md', ['$sce', '$md', function ($sce: ng.ISCEService, $md: AngularMarkdownService) {
        return function (input: string) {
            return $sce.trustAsHtml($md.render(input));
        };
    }]);