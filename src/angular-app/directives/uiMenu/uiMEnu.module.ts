/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import angular from 'angular';
import { uiMenuDirective } from '.';

export const uiMenuDirectiveModule = angular.module('uiMenuDirectiveModule', [])
    .directive('uiMenu', ['$compile', '$app', uiMenuDirective]);