"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiTableDirectiveModule = void 0;
const angular_1 = __importDefault(require("angular"));
const _1 = require(".");
exports.uiTableDirectiveModule = angular_1.default.module('uiTableDirectiveModule', [])
    .directive('uiTable', _1.uiTable);
//# sourceMappingURL=uiTable.module.js.map