import angular from 'angular';
import { AngularUtils } from '../../../utils';


export class UiSelect implements angular.IDirective {
    restrict = 'E';
    template = `<select class="form-control" ng-model="ngModel" 
                    ng-options="option.value as option.label for option in options" 
                    required="{{required}}"
                    ng-disabled="disabled">
                </select>`;
    scope = {
        ngModel: '=',
        options: '=',
        required: '=',
        disabled: '='
    };
    link = ($scope: angular.IScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes) => {
		AngularUtils.setElementId($scope, $attrs);
	}

}
