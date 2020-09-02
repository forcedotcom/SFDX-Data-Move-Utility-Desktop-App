/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { IAppModel } from "../components/helper_interfaces";
import { AppUtils } from "../components/appUtils";


export class Form implements IAppModel {

    constructor(init?: Partial<Form>) {
        if (init) {
            this.initialize(init);
        }
    }

    // --------- Main ---------- //
    email: string;
    password: string;
    invalid: boolean;
    errorMessage: string;

    // ------ Methods ------------- //          
    initialize(init: Partial<Form>){
       if (init){
           AppUtils.objectAssignSafe(this, init);
       }
    }
    isValid(): boolean {
        return !!this.email && !!this.password;
    }

}
