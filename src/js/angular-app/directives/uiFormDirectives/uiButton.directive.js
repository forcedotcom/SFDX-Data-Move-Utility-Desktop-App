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
        class="btn" 
        ng-disabled="disabled"
        ng-class="getButtonClass()" 
        ng-click="handleClick()">
        <ng-transclude></ng-transclude>
    </button>
    `;
        this.transclude = true;
        this.scope = {
            buttonStyle: '@?',
            onClick: '&',
            disabled: '=',
            size: '@',
        };
        this.link = ($scope, $element, $attrs) => {
            utils_1.AngularUtils.setElementId($scope, $attrs);
            $scope.getButtonClass = () => {
                return `${$scope.buttonStyle || common_1.BsButtonStyle.outlinePrimary} btn-${$scope.size || common_1.BsSize.md}`;
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