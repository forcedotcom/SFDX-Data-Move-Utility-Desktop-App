"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularService = void 0;
const angular_1 = __importDefault(require("angular"));
const utils_1 = require("../../../utils");
class AngularService {
    constructor($compile) {
        this.$compile = $compile;
    }
    addCompiledHtml($scope, element, rawHtml, operation = 'after', doApply = true) {
        const $element = angular_1.default.element(element);
        const $html = angular_1.default.element(rawHtml);
        switch (operation) {
            case "append":
                $element.append($html);
                break;
            case "after":
                $element.after($html);
                break;
            default:
                $element.prepend($html);
                break;
        }
        this.$compile($html)($scope);
        doApply && utils_1.AngularUtils.$apply($scope);
        return $html;
    }
    addHelpLink($scope, elementToAddAfter, helpSearchWord, doApply = true) {
        const html = `<ui-label help-search-word="${helpSearchWord}" add-help-links="true"></ui-label>`;
        return this.addCompiledHtml($scope, elementToAddAfter, html, 'after', doApply);
    }
}
exports.AngularService = AngularService;
//# sourceMappingURL=angular.service.js.map