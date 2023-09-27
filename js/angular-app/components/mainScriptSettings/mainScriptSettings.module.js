"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainScriptSettingsComponentModule = void 0;
const angular_1 = __importDefault(require("angular"));
const mainScriptSettings_component_1 = require("./mainScriptSettings.component");
exports.MainScriptSettingsComponentModule = angular_1.default.module('mainScriptSettingsComponentModule', [])
    .component('mainScriptSettings', new mainScriptSettings_component_1.MainScriptSettingsComponent());
//# sourceMappingURL=mainScriptSettings.module.js.map