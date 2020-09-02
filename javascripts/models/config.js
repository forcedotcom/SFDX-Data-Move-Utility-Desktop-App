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
exports.Config = void 0;
const script_1 = require("./script");
const appUtils_1 = require("../components/appUtils");
require("reflect-metadata");
require("es6-shim");
const class_transformer_1 = require("class-transformer");
const userDataWrapper_1 = require("./userDataWrapper");
const statics_1 = require("../components/statics");
const path_1 = __importDefault(require("path"));
const mkdir_recursive_1 = __importDefault(require("mkdir-recursive"));
const fs = require("fs");
const resources_1 = require("../components/resources");
const scriptOrg_1 = require("./scriptOrg");
/**
* Represents migration configuration
*/
class Config extends script_1.Script {
    constructor(init) {
        super();
        this.useFileSource = false;
        this.useFileTarget = false;
        this.errorMessage = resources_1.RESOURCES.ValidationError_ConfigNotSelected;
        if (init) {
            this.initialize(init);
        }
    }
    get fileName() {
        return this.name.replace(/[^\w\d]/gi, '-');
    }
    get exportJsonFilepath() {
        let thisPath = path_1.default.join(this.userData.basePath, `/${this.fileName}/`);
        if (!fs.existsSync(thisPath)) {
            mkdir_recursive_1.default.mkdirSync(thisPath);
        }
        return thisPath;
    }
    get exportDataPath() {
        let thisPath = path_1.default.join(this.exportJsonFilepath, statics_1.CONSTANTS.EXPORT_DATA_SUBFOLDER);
        if (!fs.existsSync(thisPath)) {
            mkdir_recursive_1.default.mkdirSync(thisPath);
        }
        return thisPath;
    }
    get exportJsonFilename() {
        return path_1.default.join(this.exportJsonFilepath, statics_1.CONSTANTS.SCRIPT_FILE_NAME);
    }
    get exportObjectFilename() {
        return path_1.default.join(this.exportDataPath, this.fileName + statics_1.CONSTANTS.EXPORT_CONFIGURATION_FILE_EXTENSION);
    }
    // --------------- Methods ---------- //
    initialize(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
        // Init objects
        this.objects.forEach(object => {
            object.config = this;
            object.master = typeof object.allRecords != 'undefined' ? object.allRecords : object.master;
        });
    }
    toExportJson(ui, addOrgsProperty, scriptName) {
        let scriptOrgs = [];
        if (ui.state.sourceOrg().media == statics_1.DATA_MEDIA_TYPE.Org) {
            scriptOrgs.push(new scriptOrg_1.ScriptOrg().fromOrg(ui.state.sourceOrg()));
        }
        if (ui.state.targetOrg().media == statics_1.DATA_MEDIA_TYPE.Org) {
            scriptOrgs.push(new scriptOrg_1.ScriptOrg().fromOrg(ui.state.targetOrg()));
        }
        this.orgs = !addOrgsProperty ? undefined : scriptOrgs;
        let json = appUtils_1.AppUtils.stringifyObj(this, scriptName);
        return appUtils_1.AppUtils.pretifyJson(json);
    }
    toExportObjectJson() {
        this.orgs = undefined;
        let json = appUtils_1.AppUtils.stringifyObj(this, statics_1.CONSTANTS.EXPORT_OBJECT_TAG);
        return appUtils_1.AppUtils.pretifyJson(json);
    }
    fromExportObjectJson(json) {
        let exportObject = class_transformer_1.plainToClass(Config, JSON.parse(json));
        this.orgs = undefined;
        this.initialize(exportObject);
        return this;
    }
    isValid() {
        if (!this.isInitialized()) {
            this.errorMessage = resources_1.RESOURCES.ValidationError_ConfigNotSelected;
            return false;
        }
        let errors = [];
        if (this.objects.length == 0) {
            errors.push(resources_1.RESOURCES.ValidationError_MissingSObjects);
        }
        if (this.objects.some(object => !object.isValid())) {
            errors.push(resources_1.RESOURCES.ValidationError_ConfigErrors);
        }
        this.errorMessage = errors.join(resources_1.RESOURCES.ValidationError_Separator);
        return errors.length == 0;
    }
    isInitialized() {
        return !!this.name;
    }
}
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_OBJECT_TAG, statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", String)
], Config.prototype, "id", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_OBJECT_TAG, statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", String)
], Config.prototype, "name", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_OBJECT_TAG, statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", Boolean)
], Config.prototype, "useFileSource", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_OBJECT_TAG, statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", Boolean)
], Config.prototype, "useFileTarget", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", userDataWrapper_1.UserDataWrapper)
], Config.prototype, "userData", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], Config.prototype, "errorMessage", void 0);
exports.Config = Config;
//# sourceMappingURL=config.js.map