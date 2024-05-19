"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppServicesModule = void 0;
const angular_1 = __importDefault(require("angular"));
exports.AppServicesModule = angular_1.default.module('appServicesModule', [
    'appServiceModule',
    'broadcastServiceModule',
    'markdownServiceModule',
    'translationServiceModule',
    'dialogEditServiceModule',
    'spinnerServiceModule',
    'bottomToastServiceModule',
    'displayLogServiceModule',
    'jsonEditModalServiceModule',
    'angularServiceModule'
]);
//# sourceMappingURL=app-services.module.js.map