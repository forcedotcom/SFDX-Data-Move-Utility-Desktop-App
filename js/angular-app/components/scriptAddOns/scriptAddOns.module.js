"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptAddOnsComponentModule = void 0;
const angular_1 = __importDefault(require("angular"));
const scriptAddOns_component_1 = require("./scriptAddOns.component");
exports.ScriptAddOnsComponentModule = angular_1.default.module('scriptAddOnsComponentModule', [])
    .component('mainScriptAddOns', new scriptAddOns_component_1.ScriptAddOnsComponent());
//# sourceMappingURL=scriptAddOns.module.js.map