import angular from 'angular';
import { AngularUtils } from '../../../utils';
import { CONSTANTS } from '../../../common';


export class UiInput implements angular.IDirective {
    restrict = 'E';
    template = `<input class="form-control" 
                    type="{{type || 'text'}}"
                    style="padding-top:0px"
                    ng-model="ngModel" 
                    required="{{required}}" 
                    ng-model-options="{ debounce: ${CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                    ng-disabled="disabled">`;
    require = 'ngModel';
    scope = {
        type: '@',
        ngModel: '=',
        required: '=',
        disabled: '='
    };
    link = ($scope: angular.IScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes) => {
		AngularUtils.setElementId($scope, $attrs);
	}
}
