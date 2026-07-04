"use strict";
/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerToolbarComponentModule = void 0;
const angular_1 = __importDefault(require("angular"));
const objectManagerToolbar_component_1 = require("./objectManagerToolbar.component");
exports.ObjectManagerToolbarComponentModule = angular_1.default.module('objectManagerToolbarComponentModule', [])
    .component('objectManagerToolbar', new objectManagerToolbar_component_1.ObjectManagerToolbarComponent());
//# sourceMappingURL=objectManagerToolbar.module.js.map