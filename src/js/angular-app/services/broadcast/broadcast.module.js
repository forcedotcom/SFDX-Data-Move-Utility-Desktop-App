"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastServiceModule = void 0;
const _1 = require(".");
exports.broadcastServiceModule = angular.module('broadcastServiceModule', [])
    .service('$broadcast', function () {
    return new _1.AngularBroadcastService();
});
//# sourceMappingURL=broadcast.module.js.map