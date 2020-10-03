/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AppUtils } from "../components/appUtils";
import { IAppModel } from "../components/helper_interfaces";
import { CONSTANTS } from "../components/statics";




/**
 * Description of the sobject field
 */
export class SFieldDescribe implements IAppModel {

    constructor(init?: Partial<SFieldDescribe>) {
        if (init) {
            this.initialize(init);
        }
    }

    // ------- Main ---------- //
    objectName: string = "";
    name: string = "";
    type: string = "";
    label: string = "";
    updateable: boolean = false;
    creatable: boolean = false;
    cascadeDelete: boolean = false;
    autoNumber: boolean = false;
    unique: boolean = false;
    nameField: boolean = false;
    custom: boolean = false;
    calculated: boolean = false;
    namePointing: boolean = false;

    lookup: boolean = false;
    referencedObjectType: string = "";
    polymorphicReferenceObjectType: string = "";
    referenceTo: Array<string> = new Array<string>();

    // ------- Other ---------- //
    errorMessage: string;
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
            && CONSTANTS.FIELDS_IGNORE_POLYMORPHIC.indexOf(this.name) < 0;
    }
    get canBeExternalId(): boolean {
        return this.isFormula
            || this.nameField
            || this.name == "Id"
            || !this.readonly && !this.lookup;
    }
    get standard(){
        return !this.custom;
    }




    // --------------- Methods ---------- //
    initialize(init: Partial<SFieldDescribe>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
    }

    isValid(): boolean {
        return !!this.name;
    }


}

