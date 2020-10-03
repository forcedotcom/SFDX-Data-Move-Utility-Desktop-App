"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SFieldDescribe = void 0;
const appUtils_1 = require("../components/appUtils");
const statics_1 = require("../components/statics");
/**
 * Description of the sobject field
 */
class SFieldDescribe {
    constructor(init) {
        // ------- Main ---------- //
        this.objectName = "";
        this.name = "";
        this.type = "";
        this.label = "";
        this.updateable = false;
        this.creatable = false;
        this.cascadeDelete = false;
        this.autoNumber = false;
        this.unique = false;
        this.nameField = false;
        this.custom = false;
        this.calculated = false;
        this.namePointing = false;
        this.lookup = false;
        this.referencedObjectType = "";
        this.polymorphicReferenceObjectType = "";
        this.referenceTo = new Array();
        if (init) {
            this.initialize(init);
        }
    }
    get isMasterDetail() {
        return this.lookup && (!this.updateable || this.cascadeDelete);
    }
    get isFormula() {
        return this.calculated;
    }
    get readonly() {
        return !(this.creatable && !this.isFormula && !this.autoNumber);
    }
    get person() {
        return this.name.endsWith('__pc')
            || this.name.startsWith('Person') && !this.custom;
    }
    get isPolymorphic() {
        return this.namePointing
            && this.referenceTo
            && this.referenceTo.length > 0
            && statics_1.CONSTANTS.FIELDS_IGNORE_POLYMORPHIC.indexOf(this.name) < 0;
    }
    get canBeExternalId() {
        return this.isFormula
            || this.nameField
            || this.name == "Id"
            || !this.readonly && !this.lookup;
    }
    get standard() {
        return !this.custom;
    }
    // --------------- Methods ---------- //
    initialize(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
    }
    isValid() {
        return !!this.name;
    }
}
exports.SFieldDescribe = SFieldDescribe;
//# sourceMappingURL=sfieldDescribe.js.map