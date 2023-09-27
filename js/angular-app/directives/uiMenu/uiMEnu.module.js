"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiMenuDirectiveModule = void 0;
const angular_1 = __importDefault(require("angular"));
const _1 = require(".");
exports.uiMenuDirectiveModule = angular_1.default.module('uiMenuDirectiveModule', [])
    .directive('uiMenu', ['$compile', '$app', _1.uiMenuDirective]);
//# sourceMappingURL=uiMEnu.module.js.map