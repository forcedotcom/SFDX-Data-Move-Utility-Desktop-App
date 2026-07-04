"use strict";
/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerToolbarComponent = void 0;
const objectManagerToolbar_controller_1 = require("./objectManagerToolbar.controller");
class ObjectManagerToolbarComponent {
    constructor() {
        this.controller = objectManagerToolbar_controller_1.ObjectManagerToolbarController;
        this.templateUrl = './js/angular-app/components/objectManagerToolbar/objectManagerToolbar.html';
        this.bindings = {};
    }
}
exports.ObjectManagerToolbarComponent = ObjectManagerToolbarComponent;
//# sourceMappingURL=objectManagerToolbar.component.js.map