"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponentsModule = void 0;
const angular_1 = __importDefault(require("angular"));
exports.AppComponentsModule = angular_1.default.module('appComponentsModule', [
    'appComponentModule',
    'objectManagerToolbarComponentModule',
    'objectManagerComponentModule',
    'objectManagerEditorComponentModule',
    'mainScriptSettingsComponentModule',
    'scriptAddOnsComponentModule'
]);
//# sourceMappingURL=app-components.module.js.map