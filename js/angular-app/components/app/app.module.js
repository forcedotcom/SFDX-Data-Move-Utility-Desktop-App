"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponentModule = void 0;
const angular_1 = __importDefault(require("angular"));
const _1 = require(".");
exports.AppComponentModule = angular_1.default.module('appComponentModule', [])
    .component('appComponent', new _1.AppComponent());
//# sourceMappingURL=app.module.js.map