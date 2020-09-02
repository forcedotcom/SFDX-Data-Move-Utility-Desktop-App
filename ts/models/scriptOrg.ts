
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Script } from "./script";
import { DATA_MEDIA_TYPE } from "../components/statics";
import { NonSerializable, AppUtils } from "../components/appUtils";
import { IAppModel } from "../components/helper_interfaces";
import { Org } from "./org";


/**
 * Parsed org object 
 * from the script file 
 */
export class ScriptOrg implements IAppModel {


    // ------------- JSON --------------
    name: string = "";
    instanceUrl: string = "";
    accessToken: string = "";


    // ------------- Others --------------
    @NonSerializable()
    errorMessage: string;

    // --------------- Methods ---------- //
    initialize: (init: Partial<any>) => void;

    isValid(): boolean {
        return true;
    }

    fromOrg(org: Org) {
        this.name = org.name;
        this.instanceUrl = org.instanceUrl;
        this.accessToken = org.accessToken;
        return this;
    }
}