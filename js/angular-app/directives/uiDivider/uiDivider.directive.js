"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiDividerModule = void 0;
const angular_1 = __importDefault(require("angular"));
class UiDividerDirective {
    constructor() {
        this.restrict = 'E'; // Element directive
        this.replace = true;
        this.template = '<div class="vr"></div>';
    }
    static factory() {
        return () => new UiDividerDirective();
    }
}
exports.UiDividerModule = angular_1.default.module('uiDividerDirectiveModule', [])
    .directive('uiDivider', UiDividerDirective.factory());
//# sourceMappingURL=uiDivider.directive.js.map