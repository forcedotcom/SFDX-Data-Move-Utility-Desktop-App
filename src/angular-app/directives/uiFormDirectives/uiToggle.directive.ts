import angular from 'angular';
import { CommonUtils } from '../../../utils';

interface IUiToggleScope extends angular.IScope {
    ngModel: boolean;
    required: boolean;
    checkValue: () => void;
}

export class UiToggle implements angular.IDirective {
    restrict = 'E';
    template = `
    <div class="form-check form-switch">
        <input id="{{ inputId }}" class="form-check-input" type="checkbox" ng-model="ngModel" ng-change="checkValue()" 
                ng-required="required" ng-disabled="disabled">     
        <label ng-if="label" class="form-check-label" for="{{ inputId }}">{{ label }}</label><br />                          
    </div>
`;
    scope = {
        ngModel: '=',
        required: '=',
        disabled: '=',
        label: '@'
    };

    link = ($scope: IUiToggleScope) => {
        $scope.id ||= CommonUtils.randomString();
        $scope.inputId = 'input_' + $scope.id;
        $scope.checkValue = function () {
            if ($scope.ngModel === undefined) {
                $scope.ngModel = false;
            }
        };
    }
}
