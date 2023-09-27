"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiLangSwitcherModule = void 0;
const angular_1 = __importDefault(require("angular"));
const _1 = require(".");
exports.UiLangSwitcherModule = angular_1.default.module('uiLangSwitcherDirectiveModule', [])
    .directive('uiLangSwitcher', _1.UiLangSwitcherDirective);
//# sourceMappingURL=uiLangSwitcher.module.js.map