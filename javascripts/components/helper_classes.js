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
exports.SelectItem = exports.ObjectEditData = exports.ForceOrgDisplayResult = exports.ForceOrgListCommandResponse = exports.ForceOrgListCommandResponseBody = exports.ForceOrgListResult = void 0;
require("reflect-metadata");
require("es6-shim");
const class_transformer_1 = require("class-transformer");
const appUtils_1 = require("./appUtils");
let ForceOrgListResult = class ForceOrgListResult {
    constructor() {
        this.isScratchOrg = false;
    }
    get isConnected() {
        return this.connectedStatus == "Connected";
    }
};
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", String)
], ForceOrgListResult.prototype, "orgId", void 0);
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", String)
], ForceOrgListResult.prototype, "instanceUrl", void 0);
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", String)
], ForceOrgListResult.prototype, "loginUrl", void 0);
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", String)
], ForceOrgListResult.prototype, "username", void 0);
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", String)
], ForceOrgListResult.prototype, "clientId", void 0);
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", String)
], ForceOrgListResult.prototype, "connectedStatus", void 0);
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", String)
], ForceOrgListResult.prototype, "alias", void 0);
ForceOrgListResult = __decorate([
    class_transformer_1.Expose()
], ForceOrgListResult);
exports.ForceOrgListResult = ForceOrgListResult;
let ForceOrgListCommandResponseBody = class ForceOrgListCommandResponseBody {
};
__decorate([
    class_transformer_1.Expose(),
    class_transformer_1.Type(() => ForceOrgListResult),
    __metadata("design:type", Array)
], ForceOrgListCommandResponseBody.prototype, "nonScratchOrgs", void 0);
__decorate([
    class_transformer_1.Expose(),
    class_transformer_1.Type(() => ForceOrgListResult),
    __metadata("design:type", Array)
], ForceOrgListCommandResponseBody.prototype, "scratchOrgs", void 0);
ForceOrgListCommandResponseBody = __decorate([
    class_transformer_1.Expose()
], ForceOrgListCommandResponseBody);
exports.ForceOrgListCommandResponseBody = ForceOrgListCommandResponseBody;
let ForceOrgListCommandResponse = class ForceOrgListCommandResponse {
};
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", Number)
], ForceOrgListCommandResponse.prototype, "status", void 0);
__decorate([
    class_transformer_1.Expose(),
    __metadata("design:type", ForceOrgListCommandResponseBody)
], ForceOrgListCommandResponse.prototype, "result", void 0);
ForceOrgListCommandResponse = __decorate([
    class_transformer_1.Expose()
], ForceOrgListCommandResponse);
exports.ForceOrgListCommandResponse = ForceOrgListCommandResponse;
class ForceOrgDisplayResult {
    constructor(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
    }
    get isConnected() {
        return this.connectedStatus == "Connected" || this.status == "Active";
    }
}
exports.ForceOrgDisplayResult = ForceOrgDisplayResult;
class ObjectEditData {
    constructor(init) {
        this.isSource = true;
        this.isOpen = false;
        this.noRecords = false;
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
    }
}
exports.ObjectEditData = ObjectEditData;
class SelectItem {
    constructor(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
    }
}
exports.SelectItem = SelectItem;
//# sourceMappingURL=helper_classes.js.map