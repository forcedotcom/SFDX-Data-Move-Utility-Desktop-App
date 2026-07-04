/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import angular from 'angular';
import bootstrap from 'bootstrap';

class TooltipDirective implements angular.IDirective {

    restrict = 'A';

    link = ($scope: angular.IScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes) => {
        let tooltipInstance: bootstrap.Tooltip;


        const refresh = () => {
            const newVal = $attrs.tooltip;

            if (tooltipInstance) {
                tooltipInstance.dispose();
                tooltipInstance = null;
            }

            if (newVal?.trim()) {
                const options = {
                    title: newVal,
                    html: true,
                    customClass: $attrs.tooltipCustomClass || ''
                };
                tooltipInstance = new bootstrap.Tooltip($element[0], options);
            }
        };

        refresh();
        $attrs.$observe('tooltip', refresh);

        $scope.$on('$destroy', () => {
            if (tooltipInstance) {
                setTimeout(() => {
                    tooltipInstance.dispose();
                    tooltipInstance = null;
                }, 200);
            }
        });

        $element.on('click', () => {
            if (tooltipInstance) {
                tooltipInstance.hide();
            }
        });
    }

    static factory(): angular.IDirectiveFactory {
        return () => new TooltipDirective();
    }
}

export const TooltipDirectiveModule = angular.module('tooltipDirectiveModule', [])
    .directive('tooltip', TooltipDirective.factory());
