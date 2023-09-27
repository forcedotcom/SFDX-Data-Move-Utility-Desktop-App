"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerToolbarComponentModule = void 0;
const angular_1 = __importDefault(require("angular"));
const objectManagerToolbar_component_1 = require("./objectManagerToolbar.component");
exports.ObjectManagerToolbarComponentModule = angular_1.default.module('objectManagerToolbarComponentModule', [])
    .component('objectManagerToolbar', new objectManagerToolbar_component_1.ObjectManagerToolbarComponent());
//# sourceMappingURL=objectManagerToolbar.module.js.map