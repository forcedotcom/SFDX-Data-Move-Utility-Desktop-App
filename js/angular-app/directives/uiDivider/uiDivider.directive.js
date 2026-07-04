"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiDividerModule = void 0;
/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
const angular_1 = __importDefault(require("angular"));
class UiDividerDirective {
    constructor() {
        this.restrict = 'E'; // Element directive
        this.replace = true;
        this.template = '<div class="vr"></div>';
    }
    static factory() {
        return () => new UiDividerDirective();
    }
}
exports.UiDividerModule = angular_1.default.module('uiDividerDirectiveModule', [])
    .directive('uiDivider', UiDividerDirective.factory());
//# sourceMappingURL=uiDivider.directive.js.map