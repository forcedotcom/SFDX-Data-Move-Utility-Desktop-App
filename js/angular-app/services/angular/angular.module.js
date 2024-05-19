"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.angularServiceModule = void 0;
const angular_1 = __importDefault(require("angular"));
const angular_service_1 = require("./angular.service");
exports.angularServiceModule = angular_1.default.module('angularServiceModule', [])
    .service('$angular', ['$compile', angular_service_1.AngularService]);
//# sourceMappingURL=angular.module.js.map