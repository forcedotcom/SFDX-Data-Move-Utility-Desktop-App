"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiJsonEditorModalModule = void 0;
const angular_1 = __importDefault(require("angular"));
const uiJsonEditorModal_directive_1 = require("./uiJsonEditorModal.directive");
exports.UiJsonEditorModalModule = angular_1.default.module('uiJsonEditorDirectiveModalModule', [])
    .directive('uiJsonEditorModal', ['$jsonEditModal', '$translate', '$angular', '$timeout',
    ($jsonEditModal, $translate, $angular, $timeout) => (0, uiJsonEditorModal_directive_1.UiJsonEditorModalDirective)($jsonEditModal, $translate, $angular, $timeout)]);
//# sourceMappingURL=uiJsonEditorModal.module.js.map