/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import "reflect-metadata";
import "es6-shim";
import { Type } from "class-transformer";
import { ScriptObject } from "./scriptObject";
import { CONSTANTS } from "../components/statics";
import { NonSerializableIfDefault, NonSerializable } from "../components/appUtils";


/**
 * The script object which is parsed from the script file
 */
export class Script {

    // ------------- JSON --------------
    @Type(() => ScriptObject)
    objects: ScriptObject[] = new Array<ScriptObject>();

    @NonSerializableIfDefault(CONSTANTS.DEFAULT_POLLING_INTERVAL_MS, [CONSTANTS.EXPORT_JSON_TAG])
    pollingIntervalMs: number = CONSTANTS.DEFAULT_POLLING_INTERVAL_MS;

    @NonSerializableIfDefault(CONSTANTS.DEFAULT_BULK_API_THRESHOLD_RECORDS, [CONSTANTS.EXPORT_JSON_TAG])
    bulkThreshold: number = CONSTANTS.DEFAULT_BULK_API_THRESHOLD_RECORDS;

    @NonSerializableIfDefault(CONSTANTS.DEFAULT_BULK_API_VERSION, [CONSTANTS.EXPORT_JSON_TAG])
    bulkApiVersion: string = CONSTANTS.DEFAULT_BULK_API_VERSION;

    @NonSerializableIfDefault(CONSTANTS.DEFAULT_BULK_API_V1_BATCH_SIZE, [CONSTANTS.EXPORT_JSON_TAG])
    bulkApiV1BatchSize: number = CONSTANTS.DEFAULT_BULK_API_V1_BATCH_SIZE;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    keepObjectOrderWhileExecute: boolean = false;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    allOrNone: boolean = false; 

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    simulationMode: boolean = false;

    @NonSerializableIfDefault(true, [CONSTANTS.EXPORT_JSON_TAG])
    promptOnUpdateError: boolean = true;

    @NonSerializableIfDefault(true, [CONSTANTS.EXPORT_JSON_TAG])
    promptOnMissingParentObjects: boolean = false; // Other then default

    @NonSerializableIfDefault(true, [CONSTANTS.EXPORT_JSON_TAG])
    promptOnIssuesInCSVFiles: boolean = false; // Other then default

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    validateCSVFilesOnly: boolean = false;

    @NonSerializableIfDefault(CONSTANTS.DEFAULT_API_VERSION, [CONSTANTS.EXPORT_JSON_TAG])
    apiVersion: string = CONSTANTS.DEFAULT_API_VERSION;

    @NonSerializableIfDefault(true, [CONSTANTS.EXPORT_JSON_TAG])
    createTargetCSVFiles: boolean = true;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    importCSVFilesAsIs: boolean = false;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    alwaysUseRestApiToUpdateRecords: boolean = false;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    excludeIdsFromCSVFiles: boolean = false;

    @NonSerializableIfDefault(true, [CONSTANTS.EXPORT_JSON_TAG])
    fileLog: boolean = true;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    allowFieldTruncation: boolean = false;

}