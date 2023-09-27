"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppServiceModule = void 0;
const angular_1 = __importDefault(require("angular"));
const _1 = require(".");
exports.AppServiceModule = angular_1.default.module('appServiceModule', [])
    .service('$app', [
    '$state',
    '$rootScope',
    '$broadcast',
    '$timeout',
    '$translate',
    '$md',
    '$edit',
    '$spinner',
    '$bottomToast',
    '$displayLog',
    function ($state, $rootScope, $broadcast, $timeout, $translate, $md, $edit, $spinner, $bottomToast, $displayLog) {
        return new _1.AppService($state, $rootScope, $broadcast, $timeout, $translate, $md, $edit, $spinner, $bottomToast, $displayLog);
    }
]);
//# sourceMappingURL=app.module.js.map