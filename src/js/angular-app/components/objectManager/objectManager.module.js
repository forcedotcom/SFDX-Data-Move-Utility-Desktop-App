"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerComponentModule = void 0;
const angular_1 = __importDefault(require("angular"));
const objectManager_component_1 = require("./objectManager.component");
exports.ObjectManagerComponentModule = angular_1.default.module('objectManagerComponentModule', [])
    .component('objectManager', new objectManager_component_1.ObjectManagerComponent());
//# sourceMappingURL=objectManager.module.js.map