/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import angular from 'angular';
import { CommonUtils } from '../../../utils';


export class UiSelect implements angular.IDirective {
    restrict = 'E';
    template = `<select class="form-select" ng-model="ngModel" 
                    ng-options="option.value as option.label for option in options" 
                    required="{{required}}"
                    ng-disabled="disabled">
                </select>`;
    scope = {
        id: '@',
        ngModel: '=',
        options: '=',
        required: '=',
        disabled: '='
    };
    link = ($scope: angular.IScope) => {
        $scope.id ||= CommonUtils.randomString();
    }

}
