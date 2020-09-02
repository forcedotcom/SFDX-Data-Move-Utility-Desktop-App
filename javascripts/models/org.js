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
exports.Org = void 0;
const appUtils_1 = require("../components/appUtils");
const statics_1 = require("../components/statics");
require("reflect-metadata");
require("es6-shim");
/**
 * Represents  salesforce org
 */
class Org {
    constructor(init) {
        this.name = "";
        this.media = statics_1.DATA_MEDIA_TYPE.Unknown;
        this.sourceType = statics_1.SOURCE_TYPE.Unknown;
        this.objectsMap = new Map();
        if (init) {
            this.initialize(init);
        }
    }
    get objects() {
        return [...this.objectsMap.values()];
    }
    get connectionData() {
        return {
            instanceUrl: this.instanceUrl,
            accessToken: this.accessToken,
            apiVersion: statics_1.CONSTANTS.DEFAULT_API_VERSION
        };
    }
    getConnection() {
        return appUtils_1.AppUtils.createOrgConnection(this.connectionData);
    }
    get isConnected() {
        return !!this.accessToken || this.isFile();
    }
    // --------------- Methods ---------- //
    initialize(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
        this.id = this.id || appUtils_1.AppUtils.makeId();
    }
    isValid() {
        return this.media != statics_1.DATA_MEDIA_TYPE.Unknown;
    }
    isDescribed() {
        return this.objectsMap.size > 0;
    }
    isOrg() {
        return this.media == statics_1.DATA_MEDIA_TYPE.Org;
    }
    isFile() {
        return this.media == statics_1.DATA_MEDIA_TYPE.File;
    }
}
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], Org.prototype, "orgId", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], Org.prototype, "instanceUrl", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], Org.prototype, "accessToken", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Number)
], Org.prototype, "sourceType", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Map)
], Org.prototype, "objectsMap", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], Org.prototype, "errorMessage", void 0);
exports.Org = Org;
//# sourceMappingURL=org.js.map