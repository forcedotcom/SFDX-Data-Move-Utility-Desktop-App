"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipDirectiveModule = void 0;
const angular_1 = __importDefault(require("angular"));
const bootstrap_1 = __importDefault(require("bootstrap"));
class TooltipDirective {
    constructor() {
        this.restrict = 'A';
        this.link = ($scope, $element, $attrs) => {
            let tooltipInstance;
            const refresh = () => {
                const newVal = $attrs.tooltip;
                if (tooltipInstance) {
                    tooltipInstance.dispose();
                    tooltipInstance = null;
                }
                if (newVal === null || newVal === void 0 ? void 0 : newVal.trim()) {
                    const options = {
                        title: newVal,
                        html: true,
                        customClass: $attrs.tooltipCustomClass || ''
                    };
                    tooltipInstance = new bootstrap_1.default.Tooltip($element[0], options);
                }
            };
            refresh();
            $attrs.$observe('tooltip', refresh);
            $scope.$on('$destroy', () => {
                if (tooltipInstance) {
                    setTimeout(() => {
                        tooltipInstance.dispose();
                        tooltipInstance = null;
                    }, 200);
                }
            });
            $element.on('click', () => {
                if (tooltipInstance) {
                    tooltipInstance.hide();
                }
            });
        };
    }
    static factory() {
        return () => new TooltipDirective();
    }
}
exports.TooltipDirectiveModule = angular_1.default.module('tooltipDirectiveModule', [])
    .directive('tooltip', TooltipDirective.factory());
//# sourceMappingURL=tooltip.directive.js.map