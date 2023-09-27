"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerEditorComponentModule = void 0;
const angular_1 = __importDefault(require("angular"));
const objectManagerEditor_component_1 = require("./objectManagerEditor.component");
exports.ObjectManagerEditorComponentModule = angular_1.default.module('objectManagerEditorComponentModule', [])
    .component('objectManagerEditor', new objectManagerEditor_component_1.ObjectManagerEditorComponent());
//# sourceMappingURL=objectManagerEditor.module.js.map