"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiToggle = void 0;
const utils_1 = require("../../../utils");
class UiToggle {
    constructor() {
        this.restrict = 'E';
        this.template = `
    <div class="form-check form-switch">
        <input id="{{ inputId }}" class="form-check-input" type="checkbox" ng-model="ngModel" ng-change="checkValue()" 
                ng-required="required" ng-disabled="disabled">     
        <label ng-if="label" class="form-check-label" for="{{ inputId }}">{{ label }}</label><br />                          
    </div>
`;
        this.scope = {
            ngModel: '=',
            required: '=',
            disabled: '=',
            label: '@'
        };
        this.link = ($scope) => {
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
            $scope.inputId = 'input_' + $scope.id;
            $scope.checkValue = function () {
                if ($scope.ngModel === undefined) {
                    $scope.ngModel = false;
                }
            };
        };
    }
}
exports.UiToggle = UiToggle;
//# sourceMappingURL=uiToggle.directive.js.map