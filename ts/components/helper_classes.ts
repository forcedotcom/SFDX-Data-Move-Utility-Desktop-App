/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import "reflect-metadata";
import "es6-shim";
import { Type, Expose } from "class-transformer";
import { AppUtils } from "./appUtils";



@Expose()
export class ForceOrgListResult {

    @Expose()
    orgId: string;

    @Expose()
    instanceUrl: string;

    @Expose()
    loginUrl: string;

    @Expose()
    username: string;

    @Expose()
    clientId: string;

    @Expose()
    connectedStatus: string;

    @Expose()
    alias?: string;

    isScratchOrg: boolean = false;

    get isConnected(): boolean {
        return this.connectedStatus == "Connected";
    }

}

@Expose()
export class ForceOrgListCommandResponseBody {

    @Expose()
    @Type(() => ForceOrgListResult)
    nonScratchOrgs: ForceOrgListResult[];

    @Expose()
    @Type(() => ForceOrgListResult)
    scratchOrgs: ForceOrgListResult[];
}

@Expose()
export class ForceOrgListCommandResponse {

    @Expose()
    status: number;

    @Expose()
    result: ForceOrgListCommandResponseBody;
}

export class ForceOrgDisplayResult {

    constructor(init?: Partial<ForceOrgDisplayResult>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
    }

    AccessToken: string;
    ClientId: string;
    ConnectedStatus: string;
    Status: string;
    OrgId: string;
    UserId: string;
    InstanceUrl: string;
    Username: string;
    commandOutput: string;
    cliCommand: string;

    get isConnected() {
        return this.ConnectedStatus == "Connected" || this.Status == "Active";
    }
}

export class ObjectEditData {
    constructor(init?: Partial<ObjectEditData>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
    }
    query: string;
    error: string;
    isSource: boolean = true;
    isOpen: boolean = false;
    noRecords: boolean = false;
    originalQuery: string;
    oldExternalId: string;
    operation: string;

}

export class SelectItem {
    constructor(init?: Partial<SelectItem>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
    }
    text: string;
    value: string;
}






