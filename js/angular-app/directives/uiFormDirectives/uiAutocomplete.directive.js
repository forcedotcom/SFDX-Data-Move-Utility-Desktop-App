"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiAutocomplete = void 0;
const common_1 = require("../../../common");
const utils_1 = require("../../../utils");
class UiAutocomplete {
    constructor() {
        this.restrict = 'E';
        this.template = `<input list="{{ id }}-autocomplete-options" 
                        class="form-control" 
                        ng-model="inputValue" 
                        ng-change="updateModel()" 
                        ng-model-options="{ debounce: ${common_1.CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                        required="{{required}}"
                        placeholder="{{placeholder}}"
                        ng-readonly="disabled">
                    <datalist id="{{ id }}-autocomplete-options">
                        <option ng-repeat="option in options" value="{{option.label}}">
                    </datalist>`;
        this.scope = {
            id: '@',
            ngModel: '=',
            options: '=',
            required: '=',
            disabled: '=',
            placeholder: '@',
            allowUnlistedInput: '='
        };
        this.link = ($scope) => {
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
            $scope.updateModel = function () {
                const selectedOption = $scope.options.find((o) => o.label === $scope.inputValue);
                if (selectedOption) {
                    $scope.ngModel = selectedOption.value;
                }
                else if ($scope.allowUnlistedInput) {
                    $scope.ngModel = $scope.inputValue;
                }
            };
            $scope.$watch('ngModel', function (newVal) {
                const option = $scope.options.find((o) => o.value === newVal);
                if (option) {
                    $scope.inputValue = option.label;
                }
                else if (!$scope.allowUnlistedInput) {
                    $scope.inputValue = '';
                }
                else if ($scope.allowUnlistedInput) {
                    $scope.inputValue = $scope.ngModel;
                }
            });
        };
    }
}
exports.UiAutocomplete = UiAutocomplete;
//# sourceMappingURL=uiAutocomplete.directive.js.map