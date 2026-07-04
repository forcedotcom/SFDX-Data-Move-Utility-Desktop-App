"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerEditorComponentModule = void 0;
/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
const angular_1 = __importDefault(require("angular"));
const objectManagerEditor_component_1 = require("./objectManagerEditor.component");
exports.ObjectManagerEditorComponentModule = angular_1.default.module('objectManagerEditorComponentModule', [])
    .component('objectManagerEditor', new objectManagerEditor_component_1.ObjectManagerEditorComponent());
//# sourceMappingURL=objectManagerEditor.module.js.map