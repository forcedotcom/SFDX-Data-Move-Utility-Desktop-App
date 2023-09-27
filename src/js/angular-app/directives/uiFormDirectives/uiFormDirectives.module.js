"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiFormDirectivesModule = void 0;
const angular = __importStar(require("angular"));
const _1 = require(".");
const _2 = require(".");
const _3 = require(".");
const _4 = require(".");
const _5 = require(".");
const _6 = require(".");
exports.uiFormDirectivesModule = angular.module('uiFormDirectivesModule', [])
    .directive('uiInput', () => new _1.UiInput())
    .directive('uiSelect', () => new _2.UiSelect())
    .directive('uiAutocomplete', () => new _3.UiAutocomplete())
    .directive('uiToggle', () => new _4.UiToggle())
    .directive('uiJsonEditor', () => new _5.UiJsonEditor())
    .directive('uiEditFormArray', () => new _6.UiEditFormArray())
    .directive('uiButton', () => new _1.UiButton())
    .directive('uiTextarea', () => new _1.UiTextarea())
    .directive('uiLabel', () => new _1.UiLabel());
//# sourceMappingURL=uiFormDirectives.module.js.map