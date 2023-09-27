"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiTransferPickerModule = void 0;
const angular_1 = __importDefault(require("angular"));
const _1 = require(".");
exports.UiTransferPickerModule = angular_1.default.module('uiTransferPickerDirectiveModule', [])
    .directive('uiTransferPicker', ['$translate', '$timeout', ($translate, $timeout) => new _1.UiTransferPickerDirective($translate, $timeout)]);
//# sourceMappingURL=uiTransferPicker.module.js.map