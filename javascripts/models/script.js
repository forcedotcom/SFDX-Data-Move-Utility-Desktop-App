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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Script = void 0;
require("reflect-metadata");
require("es6-shim");
const class_transformer_1 = require("class-transformer");
const scriptObject_1 = require("./scriptObject");
const statics_1 = require("../components/statics");
const appUtils_1 = require("../components/appUtils");
/**
 * The script object which is parsed from the script file
 */
class Script {
    constructor() {
        // ------------- JSON --------------
        this.objects = new Array();
        this.pollingIntervalMs = statics_1.CONSTANTS.DEFAULT_POLLING_INTERVAL_MS;
        this.bulkThreshold = statics_1.CONSTANTS.DEFAULT_BULK_API_THRESHOLD_RECORDS;
        this.bulkApiVersion = statics_1.CONSTANTS.DEFAULT_BULK_API_VERSION;
        this.bulkApiV1BatchSize = statics_1.CONSTANTS.DEFAULT_BULK_API_V1_BATCH_SIZE;
        this.keepObjectOrderWhileExecute = false;
        this.allOrNone = false;
        this.simulationMode = false;
        this.promptOnUpdateError = true;
        this.promptOnMissingParentObjects = false; // Other then default
        this.promptOnIssuesInCSVFiles = false; // Other then default
        this.validateCSVFilesOnly = false;
        this.apiVersion = statics_1.CONSTANTS.DEFAULT_API_VERSION;
        this.createTargetCSVFiles = true;
        this.importCSVFilesAsIs = false;
        this.alwaysUseRestApiToUpdateRecords = false;
        this.excludeIdsFromCSVFiles = false;
        this.fileLog = true;
        this.allowFieldTruncation = false;
    }
}
__decorate([
    class_transformer_1.Type(() => scriptObject_1.ScriptObject),
    __metadata("design:type", Array)
], Script.prototype, "objects", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(statics_1.CONSTANTS.DEFAULT_POLLING_INTERVAL_MS, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Number)
], Script.prototype, "pollingIntervalMs", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(statics_1.CONSTANTS.DEFAULT_BULK_API_THRESHOLD_RECORDS, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Number)
], Script.prototype, "bulkThreshold", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(statics_1.CONSTANTS.DEFAULT_BULK_API_VERSION, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", String)
], Script.prototype, "bulkApiVersion", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(statics_1.CONSTANTS.DEFAULT_BULK_API_V1_BATCH_SIZE, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Number)
], Script.prototype, "bulkApiV1BatchSize", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "keepObjectOrderWhileExecute", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "allOrNone", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "simulationMode", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(true, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "promptOnUpdateError", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(true, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "promptOnMissingParentObjects", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(true, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "promptOnIssuesInCSVFiles", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "validateCSVFilesOnly", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(statics_1.CONSTANTS.DEFAULT_API_VERSION, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", String)
], Script.prototype, "apiVersion", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(true, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "createTargetCSVFiles", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "importCSVFilesAsIs", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "alwaysUseRestApiToUpdateRecords", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "excludeIdsFromCSVFiles", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(true, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "fileLog", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], Script.prototype, "allowFieldTruncation", void 0);
exports.Script = Script;
//# sourceMappingURL=script.js.map