import angular from 'angular';
import { IOption } from '../../../models';
import { AngularUtils } from '../../../utils';
import { CONSTANTS } from '../../../common';

interface IUiAutocompleteScope extends angular.IScope {
    ngModel: string;
    options: IOption[];
    required: boolean;
    id: string;
    inputValue: string;
    allowUnlistedInput: boolean;
    updateModel: () => void;
}

export class UiAutocomplete implements angular.IDirective {
    restrict = 'E';
    template = `<input list="{{ id }}-autocomplete-options" 
                        class="form-control" 
                        ng-model="inputValue" 
                        ng-change="updateModel()" 
                        ng-model-options="{ debounce: ${CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                        required="{{required}}"
                        placeholder="{{placeholder}}"
                        ng-disabled="disabled">
                    <datalist id="{{ id }}-autocomplete-options">
                        <option ng-repeat="option in options" value="{{option.label}}">
                    </datalist>`;

    scope = {
        ngModel: '=',
        options: '=',
        required: '=',
        disabled: '=',
        placeholder: '@',
        allowUnlistedInput: '='
    };

    link = ($scope: IUiAutocompleteScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes) => {

        $scope.id = AngularUtils.setElementId($scope, $attrs);

        $scope.updateModel = function () {
            const selectedOption = $scope.options.find((o: IOption) => o.label === $scope.inputValue);
            if (selectedOption) {
                $scope.ngModel = selectedOption.value;
            } else if ($scope.allowUnlistedInput) {
                $scope.ngModel = $scope.inputValue;
            }
        };

        $scope.$watch('ngModel', function (newVal) {
            const option = $scope.options.find((o: IOption) => o.value === newVal);
            if (option) {
                $scope.inputValue = option.label;
            } else if (!$scope.allowUnlistedInput) {
                $scope.inputValue = '';
            } else if ($scope.allowUnlistedInput) {
                $scope.inputValue = $scope.ngModel;
            }
        });
    }
}
