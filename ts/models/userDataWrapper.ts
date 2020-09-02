
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { IDatabaseModel, ISecuredModel, IAppModel } from "../components/helper_interfaces";
import { Config } from "./config";
import { Org } from "./org";
import { Type } from "class-transformer";
import { AppUtils, NonSerializable } from "../components/appUtils";
import SimpleCrypto from "simple-crypto-js";
import "reflect-metadata";
import "es6-shim";
import { plainToClass } from "class-transformer";
import { DATA_MEDIA_TYPE, CONSTANTS } from "../components/statics";
import { DbUtils } from "../components/dbUtils";
import path from "path";
import mkdir from 'mkdir-recursive';
import fs = require('fs');

/**
* The user profile stored in the database
*/
export class UserDataWrapper implements IDatabaseModel, IAppModel, ISecuredModel {

    constructor(init?: Partial<UserDataWrapper>) {
        if (init) {
            this.initialize(init);
        }
    }


    // Main ------------------------    
    id: string;

    /**
     * Email, encrypted with user's password     *
     */
    @NonSerializable()
    email: string;

    /**
     * Password, encrypted with itself
     */
    @NonSerializable()
    password: string;

    /**
     * Serialized user data as JSON string
     */
    @NonSerializable()
    data: string;

    @Type(() => Config)
    configs: Config[];

    @Type(() => Org)
    orgs: Org[];


    // Others ----------------------------        
    @NonSerializable()
    plainEmail: string;

    @NonSerializable()
    plainPassword: string;

    @NonSerializable()
    errorMessage: string;

    get basePath(): string {
        let thePath = path.join(DbUtils.getDbFilePath(), `/${this.plainEmail.replace(/[^\w\d]/gi, '-')}/`);
        if (!fs.existsSync(thePath)) {
            mkdir.mkdirSync(thePath);
        }
        return thePath;
    }

    get exportDataPath(): string {
        let thePath = path.join(this.basePath, CONSTANTS.EXPORT_DATA_SUBFOLDER);
        if (!fs.existsSync(thePath)) {
            mkdir.mkdirSync(thePath);
        }
        return thePath;
    }

    get cliCommadOutputFilename(): string {
        return path.join(this.exportDataPath, CONSTANTS.CLI_OUTPUT_FILE_NAME);
    }

    // --------------- Methods ---------- //
    initialize(init?: Partial<UserDataWrapper>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
        this.id = this.id || AppUtils.makeId();
        this.orgs = this.orgs || [
            new Org({
                orgName: CONSTANTS.CSV_FILES_SOURCENAME,
                name: CONSTANTS.CSV_FILES_DISPLAY_SOURCENAME,
                id: AppUtils.makeId(),
                media: DATA_MEDIA_TYPE.File
            })
        ];
        this.configs = this.configs || [
            // Creates default configuration
            new Config({
                id: AppUtils.makeId(),
                name: "Default",
                userData: this
            })
        ];
    }

    isValid(): boolean {
        return true;
    }

    /**
     * Converts the current TS object 
     * to the secured JS object to store in the database 
     * removing circular references.
     */
    toSecuredObject(): ISecuredModel {
        var simpleCrypto = new SimpleCrypto(this.plainPassword);
        return {
            id: this.id,
            data: simpleCrypto.encrypt(this.toStringifiedObject()),// configs,orgs,id
            email: simpleCrypto.encrypt(this.plainEmail),
            password: simpleCrypto.encrypt(this.plainPassword)
        };
    }

    toStringifiedObject(): string {
        return AppUtils.stringifyObj(this);
    }

    /**
     * Converts secured JS object coming from the databse 
     * into this object format
     */
    fromSecuredObject(securedObject: object, plainPassword: string): UserDataWrapper {
        if (!securedObject) {
            return this;
        }
        try {
            this.plainPassword = plainPassword; //plainPassword
            Object.assign(this, securedObject); // data, email, password, id
            var simpleCrypto = new SimpleCrypto(this.plainPassword);
            this.plainEmail = simpleCrypto.decrypt(this.email) as string; // plain email
            let plainDataObject = simpleCrypto.decrypt(this.data) as string; //configs,orgs,id + other data            
            Object.assign(this, plainToClass(UserDataWrapper, plainDataObject)); //Asign all to the current object
            this.configs.forEach(config => config.initialize({ userData: this }));
        } catch (ex) {
        }
        return this;
    }




}