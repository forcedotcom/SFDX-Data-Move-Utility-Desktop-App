"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIHelpLink = void 0;
class UIHelpLink {
    constructor() {
        this.restrict = 'E';
        this.template = ``;
        this.link = ($scope) => {
            // $scope.$on('$destroy', () => {
            // 	$ctrl.destroyTooltips();
            // });
            // $scope.$watch('$ctrl.iconTooltip', () => {
            // 	$ctrl.setTooltips();
            // });
        };
    }
}
exports.UIHelpLink = UIHelpLink;
//# sourceMappingURL=uiHelpLink.directive.js.map