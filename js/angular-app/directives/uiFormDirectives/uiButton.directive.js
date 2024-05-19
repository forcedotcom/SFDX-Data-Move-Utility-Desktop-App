"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiButton = void 0;
const common_1 = require("../../../common");
const utils_1 = require("../../../utils");
class UiButton {
    constructor() {
        this.restrict = 'E';
        this.template = `
    <button 
        type="button" 
        ng-disabled="disabled"
        ng-class="getButtonClass()" 
        ng-click="handleClick()">
        <i ng-if="icon" ng-class="getIconClass()"></i>
        <ng-transclude></ng-transclude>
    </button>
    `;
        this.transclude = true;
        this.scope = {
            id: '@',
            buttonStyle: '@?',
            onClick: '&',
            disabled: '=',
            size: '@?',
            icon: '@?',
            tooltip: '@?',
        };
        this.link = ($scope) => {
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
            $scope.getButtonClass = () => {
                return `${$scope.buttonStyle || common_1.BsButtonStyle.outlinePrimary} btn-${$scope.size || common_1.BsSize.md}`;
            };
            $scope.getIconClass = () => {
                return `${$scope.icon} fa-${$scope.size || common_1.BsSize.sm}`;
            };
            $scope.handleClick = () => {
                if ($scope.onClick) {
                    $scope.onClick({
                        args: {
                            args: [$scope.action]
                        }
                    });
                }
            };
        };
    }
}
exports.UiButton = UiButton;
//# sourceMappingURL=uiButton.directive.js.map