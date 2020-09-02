"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataWrapper = void 0;
const config_1 = require("./config");
const org_1 = require("./org");
const class_transformer_1 = require("class-transformer");
const appUtils_1 = require("../components/appUtils");
const simple_crypto_js_1 = __importDefault(require("simple-crypto-js"));
require("reflect-metadata");
require("es6-shim");
const class_transformer_2 = require("class-transformer");
const statics_1 = require("../components/statics");
const dbUtils_1 = require("../components/dbUtils");
const path_1 = __importDefault(require("path"));
const mkdir_recursive_1 = __importDefault(require("mkdir-recursive"));
const fs = require("fs");
/**
* The user profile stored in the database
*/
class UserDataWrapper {
    constructor(init) {
        if (init) {
            this.initialize(init);
        }
    }
    get basePath() {
        let thePath = path_1.default.join(dbUtils_1.DbUtils.getDbFilePath(), `/${this.plainEmail.replace(/[^\w\d]/gi, '-')}/`);
        if (!fs.existsSync(thePath)) {
            mkdir_recursive_1.default.mkdirSync(thePath);
        }
        return thePath;
    }
    get exportDataPath() {
        let thePath = path_1.default.join(this.basePath, statics_1.CONSTANTS.EXPORT_DATA_SUBFOLDER);
        if (!fs.existsSync(thePath)) {
            mkdir_recursive_1.default.mkdirSync(thePath);
        }
        return thePath;
    }
    get cliCommadOutputFilename() {
        return path_1.default.join(this.exportDataPath, statics_1.CONSTANTS.CLI_OUTPUT_FILE_NAME);
    }
    // --------------- Methods ---------- //
    initialize(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
        this.id = this.id || appUtils_1.AppUtils.makeId();
        this.orgs = this.orgs || [
            new org_1.Org({
                orgName: statics_1.CONSTANTS.CSV_FILES_SOURCENAME,
                name: statics_1.CONSTANTS.CSV_FILES_DISPLAY_SOURCENAME,
                id: appUtils_1.AppUtils.makeId(),
                media: statics_1.DATA_MEDIA_TYPE.File
            })
        ];
        this.configs = this.configs || [
            // Creates default configuration
            new config_1.Config({
                id: appUtils_1.AppUtils.makeId(),
                name: "Default",
                userData: this
            })
        ];
    }
    isValid() {
        return true;
    }
    /**
     * Converts the current TS object
     * to the secured JS object to store in the database
     * removing circular references.
     */
    toSecuredObject() {
        var simpleCrypto = new simple_crypto_js_1.default(this.plainPassword);
        return {
            id: this.id,
            data: simpleCrypto.encrypt(this.toStringifiedObject()),
            email: simpleCrypto.encrypt(this.plainEmail),
            password: simpleCrypto.encrypt(this.plainPassword)
        };
    }
    toStringifiedObject() {
        return appUtils_1.AppUtils.stringifyObj(this);
    }
    /**
     * Converts secured JS object coming from the databse
     * into this object format
     */
    fromSecuredObject(securedObject, plainPassword) {
        if (!securedObject) {
            return this;
        }
        try {
            this.plainPassword = plainPassword; //plainPassword
            Object.assign(this, securedObject); // data, email, password, id
            var simpleCrypto = new simple_crypto_js_1.default(this.plainPassword);
            this.plainEmail = simpleCrypto.decrypt(this.email); // plain email
            let plainDataObject = simpleCrypto.decrypt(this.data); //configs,orgs,id + other data            
            Object.assign(this, class_transformer_2.plainToClass(UserDataWrapper, plainDataObject)); //Asign all to the current object
            this.configs.forEach(config => config.initialize({ userData: this }));
        }
        catch (ex) {
        }
        return this;
    }
}
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], UserDataWrapper.prototype, "email", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], UserDataWrapper.prototype, "password", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], UserDataWrapper.prototype, "data", void 0);
__decorate([
    class_transformer_1.Type(() => config_1.Config),
    __metadata("design:type", Array)
], UserDataWrapper.prototype, "configs", void 0);
__decorate([
    class_transformer_1.Type(() => org_1.Org),
    __metadata("design:type", Array)
], UserDataWrapper.prototype, "orgs", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], UserDataWrapper.prototype, "plainEmail", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], UserDataWrapper.prototype, "plainPassword", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], UserDataWrapper.prototype, "errorMessage", void 0);
exports.UserDataWrapper = UserDataWrapper;
//# sourceMappingURL=userDataWrapper.js.map