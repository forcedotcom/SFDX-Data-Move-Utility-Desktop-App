"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiTextarea = void 0;
const common_1 = require("../../../common");
const utils_1 = require("../../../utils");
class UiTextarea {
    constructor() {
        this.restrict = 'E';
        this.template = `<textarea class="form-control {{class}}" 
                    style="padding-top:0px; {{style}}"
                    ng-model="ngModel" 
                    ng-keyup="onUserInteraction()"
                    ng-paste="onUserInteraction()"
                    ng-model-options="{ debounce: ${common_1.CONSTANTS.INPUT_DEBOUNCE_DELAY} }"                     
                    required="{{required}}" ng-readonly="disabled"></textarea>`;
        this.require = 'ngModel';
        this.scope = {
            ngModel: '=',
            required: '=',
            disabled: '=',
            onChange: '&',
            class: '@',
            style: '@'
        };
        this.link = ($scope) => {
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
            $scope.isUserInteraction = false;
            $scope.onUserInteraction = () => {
                $scope.isUserInteraction = true;
            };
            $scope.$watch('ngModel', (newValue) => {
                if (!$scope.isUserInteraction) {
                    return;
                }
                $scope.isUserInteraction = false;
                if ($scope.onChange) {
                    $scope.onChange({
                        args: {
                            args: [
                                newValue,
                                $scope.id
                            ]
                        }
                    });
                }
            });
        };
    }
}
exports.UiTextarea = UiTextarea;
//# sourceMappingURL=uiTextarea.directive.js.map