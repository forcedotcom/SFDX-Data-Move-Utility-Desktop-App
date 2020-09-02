"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldItem = void 0;
const appUtils_1 = require("../components/appUtils");
const resources_1 = require("../components/resources");
const statics_1 = require("../components/statics");
class FieldItem {
    constructor(init) {
        this.errorMessage = '';
        if (init) {
            this.initialize(init);
        }
    }
    get cleanName() {
        return this.name.split(statics_1.CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR)[0];
    }
    get referencedObjectType() {
        return this.sFieldDescribe && this.sFieldDescribe.isPolymorphic && this.name.split(statics_1.CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR)[1]
            || this.sFieldDescribe && !this.sFieldDescribe.isPolymorphic && this.sFieldDescribe.referencedObjectType
            || resources_1.RESOURCES.NotSet;
    }
    get label() {
        let label = this.cleanName;
        if (!this.isMultiselect) {
            if (this.sFieldDescribe && this.sFieldDescribe.lookup) {
                label += `<br/>[*${this.referencedObjectType}]`;
            }
        }
        else {
            label = "** " + label + " **";
        }
        return label;
    }
    get category() {
        if (this.isExcludedItem) {
            return resources_1.RESOURCES.ListCategory_AllFields;
        }
        if (this.isMultiselect) {
            return resources_1.RESOURCES.ListCategory_Multiselect;
        }
        if (!this.isValid() || !this.sFieldDescribe) {
            return resources_1.RESOURCES.ListCategory_Errors;
        }
        let category = [];
        if (this.sFieldDescribe.custom)
            category.push(resources_1.RESOURCES.ListCategory_Custom);
        else
            category.push(resources_1.RESOURCES.ListCategory_Standard);
        if (this.sFieldDescribe.autoNumber)
            category.push(resources_1.RESOURCES.ListCategory_Autonumber);
        else if (this.sFieldDescribe.isFormula)
            category.push(resources_1.RESOURCES.ListCategory_Formula);
        else if (this.sFieldDescribe.isMasterDetail)
            category.push(resources_1.RESOURCES.ListCategory_MasterDetail);
        else if (this.sFieldDescribe.lookup && !this.sFieldDescribe.isMasterDetail)
            category.push(resources_1.RESOURCES.ListCategory_Lookup);
        return category.join(resources_1.RESOURCES.ListCategory_Separator);
    }
    // ------ Methods ------------- //      
    initialize(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
    }
    isValid() {
        return !this.errorMessage && this.selected || this.isMultiselect || !this.selected;
    }
}
exports.FieldItem = FieldItem;
//# sourceMappingURL=fieldItem.js.map