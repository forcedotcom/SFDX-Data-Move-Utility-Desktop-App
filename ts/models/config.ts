/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { IDatabaseModel, IAppModel } from "../components/helper_interfaces";
import { Script } from "./script";
import { NonSerializable, AppUtils } from "../components/appUtils";
import "reflect-metadata";
import "es6-shim";
import { plainToClass } from "class-transformer";
import { UserDataWrapper } from "./userDataWrapper";
import { CONSTANTS, DATA_MEDIA_TYPE } from "../components/statics";
import path from "path";
import mkdir from 'mkdir-recursive';
import fs = require('fs');
import { RESOURCES } from "../components/resources";
import { AppUIState } from "../components/appUIState";
import { ScriptOrg } from "./scriptOrg";


/**
* Represents migration configuration
*/
export class Config extends Script implements IDatabaseModel, IAppModel {

    constructor(init?: Partial<Config>) {
        super();
        if (init) {
            this.initialize(init);
        }
    }


    // JSON  ------------------------
    @NonSerializable([CONSTANTS.EXPORT_OBJECT_TAG, CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    id: string;

    @NonSerializable([CONSTANTS.EXPORT_OBJECT_TAG, CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    name: string;

    @NonSerializable([CONSTANTS.EXPORT_OBJECT_TAG, CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    useFileSource: boolean = false;

    @NonSerializable([CONSTANTS.EXPORT_OBJECT_TAG, CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    useFileTarget: boolean = false;

    orgs: ScriptOrg[];


    // Others ---------------------------- 
    @NonSerializable()
    userData: UserDataWrapper;

    get fileName(): string {
        return this.name.replace(/[^\w\d]/gi, '-');
    }

    get exportJsonFilepath(): string {
        let thisPath = path.join(this.userData.basePath, `/${this.fileName}/`);
        if (!fs.existsSync(thisPath)) {
            mkdir.mkdirSync(thisPath);
        }
        return thisPath;
    }

    get exportDataPath(): string {
        let thisPath = path.join(this.exportJsonFilepath, CONSTANTS.EXPORT_DATA_SUBFOLDER);
        if (!fs.existsSync(thisPath)) {
            mkdir.mkdirSync(thisPath);
        }
        return thisPath;
    }

    get exportJsonFilename(): string {
        return path.join(this.exportJsonFilepath, CONSTANTS.SCRIPT_FILE_NAME);
    }

    get exportObjectFilename(): string {
        return path.join(this.exportDataPath, this.fileName + CONSTANTS.EXPORT_CONFIGURATION_FILE_EXTENSION);
    }


    @NonSerializable()
    errorMessage: string = RESOURCES.ValidationError_ConfigNotSelected;


    // --------------- Methods ---------- //
    initialize(init?: Partial<Config>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
        // Init objects
        this.objects.forEach(object => {
            object.config = this;
            object.master = typeof object.allRecords != 'undefined' ? object.allRecords : object.master;
            object.externalId = object.externalId || CONSTANTS.DEFAULT_EXTERNAL_ID_FIELD_NAME;
        });
    }

    toExportJson(ui: AppUIState, addOrgsProperty: boolean, scriptName: string): string {
        let scriptOrgs = [];
        if (ui.state.sourceOrg().media == DATA_MEDIA_TYPE.Org) {
            scriptOrgs.push(new ScriptOrg().fromOrg(ui.state.sourceOrg()));
        }
        if (ui.state.targetOrg().media == DATA_MEDIA_TYPE.Org) {
            scriptOrgs.push(new ScriptOrg().fromOrg(ui.state.targetOrg()));
        }
        this.orgs = !addOrgsProperty ? undefined : scriptOrgs;
        let json = AppUtils.stringifyObj(this, scriptName);
        return AppUtils.pretifyJson(json);
    }

    toExportObjectJson(): string {
        this.orgs = undefined;
        let json = AppUtils.stringifyObj(this, CONSTANTS.EXPORT_OBJECT_TAG);
        return AppUtils.pretifyJson(json);
    }

    fromExportObjectJson(json: string): Config {
        let exportObject = plainToClass(Config, JSON.parse(json));
        this.orgs = undefined;
        this.initialize(exportObject);
        return this;
    }

    isValid(): boolean {
        if (!this.isInitialized()) {
            this.errorMessage = RESOURCES.ValidationError_ConfigNotSelected;
            return false;
        }
        let errors = [];
        if (this.objects.length == 0) {
            errors.push(RESOURCES.ValidationError_MissingSObjects);
        }
        if (this.objects.some(object => !object.isValid())) {
            errors.push(RESOURCES.ValidationError_ConfigErrors);
        }
        this.errorMessage = errors.join(RESOURCES.ValidationError_Separator);
        return errors.length == 0;
    }

    isInitialized(): boolean {
        return !!this.name;
    }


}



