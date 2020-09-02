/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { IAppModel } from "../components/helper_interfaces";
import { SFieldDescribe } from "./sfieldDescribe";
import { AppUtils } from "../components/appUtils";
import { RESOURCES } from "../components/resources";
import { CONSTANTS } from "../components/statics";

export class FieldItem implements IAppModel {

    
    // ------ Main ------------- //    
    name: string;
    get cleanName() {
        return this.name.split(CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR)[0];
    }
    get referencedObjectType() {
        return this.sFieldDescribe && this.sFieldDescribe.isPolymorphic && this.name.split(CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR)[1]
            || this.sFieldDescribe && !this.sFieldDescribe.isPolymorphic && this.sFieldDescribe.referencedObjectType
            || RESOURCES.NotSet;
    }

    get label(): string {
        let label = this.cleanName
        if (!this.isMultiselect) {
            if (this.sFieldDescribe && this.sFieldDescribe.lookup) {
                label += `<br/>[*${this.referencedObjectType}]`;
            }
        } else {
            label = "** " + label + " **";
        }
        return label;
    }
    errorMessage: string = '';
    selected: boolean;
    isMultiselect: boolean;
    isExcludedItem: boolean;


    constructor(init?: Partial<FieldItem>) {
        if (init) {
            this.initialize(init);
        }
    }

    // ------ Others ------------- //    
    sFieldDescribe?: SFieldDescribe;

    get category(): string {

        if (this.isExcludedItem){
            return RESOURCES.ListCategory_AllFields;
        }

        if (this.isMultiselect) {
            return RESOURCES.ListCategory_Multiselect;
        }

        if (!this.isValid() || !this.sFieldDescribe) {
            return RESOURCES.ListCategory_Errors;
        }

        let category = [];

        if (this.sFieldDescribe.custom)
            category.push(RESOURCES.ListCategory_Custom);
        else
            category.push(RESOURCES.ListCategory_Standard);

        if (this.sFieldDescribe.autoNumber)
            category.push(RESOURCES.ListCategory_Autonumber);

        else if (this.sFieldDescribe.isFormula)
            category.push(RESOURCES.ListCategory_Formula);

        else if (this.sFieldDescribe.isMasterDetail)
            category.push(RESOURCES.ListCategory_MasterDetail);

        else if (this.sFieldDescribe.lookup && !this.sFieldDescribe.isMasterDetail)
            category.push(RESOURCES.ListCategory_Lookup);

        return category.join(RESOURCES.ListCategory_Separator);

    }

    // ------ Methods ------------- //      
    initialize(init: Partial<any>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
    }

    isValid(): boolean {
        return !this.errorMessage && this.selected || this.isMultiselect || !this.selected;
    }

}
