"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = void 0;
const appUtils_1 = require("../components/appUtils");
class Form {
    constructor(init) {
        if (init) {
            this.initialize(init);
        }
    }
    // ------ Methods ------------- //          
    initialize(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
    }
    isValid() {
        return !!this.email && !!this.password;
    }
}
exports.Form = Form;
//# sourceMappingURL=form.js.map