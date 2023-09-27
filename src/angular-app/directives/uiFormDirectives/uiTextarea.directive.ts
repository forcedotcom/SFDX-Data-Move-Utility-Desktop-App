import angular from 'angular';
import { AngularUtils } from '../../../utils';
import { CONSTANTS } from '../../../common';

export class UiTextarea implements angular.IDirective {
    restrict = 'E';
    template = `<textarea class="form-control" 
                    style="padding-top:0px"
                    ng-model="ngModel" 
                    ng-model-options="{ debounce: ${CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                    required="{{required}}" ng-disabled="disabled"></textarea>`;
    require = 'ngModel';
    scope = {
        ngModel: '=',
        required: '=',
        disabled: '='
    };
    link = ($scope: angular.IScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes) => {
        AngularUtils.setElementId($scope, $attrs);
    }
}
