/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { IAppModel } from "../components/helper_interfaces";
import { NonSerializable, AppUtils } from "../components/appUtils";
import { SelectItem } from "../components/helper_classes";
import { FieldItem } from "./fieldItem";


/**
* Parsed FieldMapping object of the script.
* Represents field mapping
*/
export class ScriptMappingItem implements IAppModel {


    // --------------- JSON ---------------------- //
    targetObject: string;
    sourceField: string;
    targetField: string;

    // ------------ Others -----------------------//    
    @NonSerializable()
    errorMessage: string;
  

    // ------------ Methods ----------------
    initialize: (init: Partial<any>) => void;

    isValid(): boolean {
        return !this.errorMessage;
    }


}