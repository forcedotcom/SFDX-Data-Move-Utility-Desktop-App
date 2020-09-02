"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SObjectDescribe = void 0;
const appUtils_1 = require("../components/appUtils");
/**
 * Description of the sobject
 */
class SObjectDescribe {
    constructor(init) {
        // ------- Main ---------- //
        this.name = "";
        this.label = "";
        this.updateable = false;
        this.createable = false;
        this.custom = false;
        // ------- Other ---------- //
        this.fieldsMap = new Map();
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
    }
    get fields() {
        return [...this.fieldsMap.values()];
    }
    isDescribed() {
        return !!this.name;
    }
    isValid() {
        return this.isDescribed() && this.fieldsMap.size > 0;
    }
}
exports.SObjectDescribe = SObjectDescribe;
//# sourceMappingURL=sobjectDescribe.js.map