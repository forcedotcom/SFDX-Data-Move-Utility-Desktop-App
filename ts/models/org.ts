/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { IDatabaseModel, IOrgConnectionData, IAppModel } from "../components/helper_interfaces";
import { NonSerializable, AppUtils } from "../components/appUtils";
import { CONSTANTS, DATA_MEDIA_TYPE, SOURCE_TYPE } from "../components/statics";
import "reflect-metadata";
import "es6-shim";
import { SObjectDescribe } from "./sobjectDescribe";


/**
 * Represents  salesforce org
 */
export class Org implements IDatabaseModel, IAppModel {

    constructor(init?: Partial<Org>) {
        if (init) {
            this.initialize(init);
        }
    }


    // JSON ------------------------
    id: string;
    orgName: string;
    name: string = "";
    media: DATA_MEDIA_TYPE = DATA_MEDIA_TYPE.Unknown;

    // Others ----------------------------
    @NonSerializable()
    orgId: string;

    @NonSerializable()
    instanceUrl: string;

    @NonSerializable()
    accessToken: string;

    @NonSerializable()
    sourceType: SOURCE_TYPE = SOURCE_TYPE.Unknown;

    @NonSerializable()
    objectsMap: Map<string, SObjectDescribe> = new Map<string, SObjectDescribe>();

    @NonSerializable()
    errorMessage: string;

    get objects(): SObjectDescribe[] {
        return [...this.objectsMap.values()];
    }

    get connectionData(): IOrgConnectionData {
        return {
            instanceUrl: this.instanceUrl,
            accessToken: this.accessToken,
            apiVersion: CONSTANTS.DEFAULT_API_VERSION
        };
    }

    getConnection(): any {
        return AppUtils.createOrgConnection(this.connectionData);
    }

    get isConnected(): boolean {
        return !!this.accessToken || this.isFile();
    }


    // --------------- Methods ---------- //
    initialize(init?: Partial<Org>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
        this.id = this.id || AppUtils.makeId();
    }

    isValid(): boolean {
        return this.media != DATA_MEDIA_TYPE.Unknown;
    }

    isDescribed(): boolean {
        return this.objectsMap.size > 0;
    }

    isOrg() {
        return this.media == DATA_MEDIA_TYPE.Org;
    }

    isFile() {
        return this.media == DATA_MEDIA_TYPE.File;
    }

}
