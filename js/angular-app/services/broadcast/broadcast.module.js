"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastServiceModule = void 0;
/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
const _1 = require(".");
exports.broadcastServiceModule = angular.module('broadcastServiceModule', [])
    .service('$broadcast', function () {
    return new _1.AngularBroadcastService();
});
//# sourceMappingURL=broadcast.module.js.map