/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SFieldDescribe } from "./sfieldDescribe";
import { AppUtils } from "../components/appUtils";
import { IAppModel } from "../components/helper_interfaces";




/**
 * Description of the sobject
 */
export class SObjectDescribe implements IAppModel {

    constructor(init?: Partial<SObjectDescribe>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
    }

// ------- Main ---------- //
    name: string = "";
    label: string = "";
    updateable: boolean = false;
    createable: boolean = false;
    custom: boolean = false;

    // ------- Other ---------- //
    fieldsMap: Map<string, SFieldDescribe> = new Map<string, SFieldDescribe>();
    get fields(): SFieldDescribe[]{
        return [...this.fieldsMap.values()];
    }
    errorMessage: string;


    // --------------- Methods ---------- //
    initialize: (init: Partial<any>) => void;

    isDescribed(): boolean {
        return !!this.name;
    }

    isValid(): boolean {
        return this.isDescribed() && this.fieldsMap.size > 0;
    }


}
