"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiJsonEditorOnPageModule = void 0;
const angular_1 = __importDefault(require("angular"));
const uiJsonEditorOnPage_directive_1 = require("./uiJsonEditorOnPage.directive");
exports.UiJsonEditorOnPageModule = angular_1.default.module('uiJsonEditorOnPageDirectiveModule', [])
    .directive('uiJsonEditorOnPage', ['$timeout', uiJsonEditorOnPage_directive_1.UiJsonEditorOnPageDirective]);
//# sourceMappingURL=uiJsonEditorOnPage.module.js.map