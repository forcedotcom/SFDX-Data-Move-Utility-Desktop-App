/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AppUtils, NonSerializable } from "../components/appUtils";
import { IAppModel } from "../components/helper_interfaces";
import { CONSTANTS } from "../components/statics";

/**
 * Represents field of the ScriptObject
 * (used in the Configuration, not to be exported with export.json file)
 *
 */
export class ScriptObjectField implements IAppModel {

    constructor(init: Partial<ScriptObjectField>) {
        if (init) {
            this.initialize(init);
        }
    }

    // -------------- JSON ------------------ //
    name: string;

    @NonSerializable()
    errorMessage: string;


    // -------------- Others ------------------ //    
    get cleanName() {
        return this.name.split(CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR)[0];
    }

    @NonSerializable()
    label: string;


    // ------------- Methods --------------------- //
    initialize(init: Partial<ScriptObjectField>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
    }
    isValid() {
        return true;
    }

}
