/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import * as angular from 'angular';
import { UiButton, UiInput, UiLabel, UiTextarea } from '.';
import { UiSelect } from '.';
import { UiAutocomplete } from '.';
import { UiToggle } from '.';
import { UiJsonEditor } from '.';
import { UiEditFormArray } from '.';

export const uiFormDirectivesModule = angular.module('uiFormDirectivesModule', [])
    .directive('uiInput', () => new UiInput())
    .directive('uiSelect', () => new UiSelect())
    .directive('uiAutocomplete', () => new UiAutocomplete())
    .directive('uiToggle', () => new UiToggle())
    .directive('uiJsonEditor', () => new UiJsonEditor())
    .directive('uiEditFormArray', () => new UiEditFormArray())
    .directive('uiButton', () => new UiButton())
    .directive('uiTextarea', () => new UiTextarea())
    .directive('uiLabel', () => new UiLabel());

