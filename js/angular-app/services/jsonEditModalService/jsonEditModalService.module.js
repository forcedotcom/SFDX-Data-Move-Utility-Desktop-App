"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonEditModalServiceModule = void 0;
const angular_1 = __importDefault(require("angular"));
const jsonEditModalService_service_1 = require("./jsonEditModalService.service");
exports.JsonEditModalServiceModule = angular_1.default.module('jsonEditModalServiceModule', [])
    .service('$jsonEditModal', jsonEditModalService_service_1.JsonEditModalService);
//# sourceMappingURL=jsonEditModalService.module.js.map