"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiJsonEditorModule = void 0;
const angular_1 = __importDefault(require("angular"));
const uiJsonEditor_directive_1 = require("./uiJsonEditor.directive");
exports.UiJsonEditorModule = angular_1.default.module('uiJsonEditorDirectiveModule', [])
    .directive('uiJsonEditor', () => uiJsonEditor_directive_1.UiJsonEditorDirective);
//# sourceMappingURL=uiJsonEditor.module.js.map