"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SObjectOptionData = void 0;
const common_1 = require("../common");
/**
 * Contains data and settings for an SObject option.
 * @class
 */
class SObjectOptionData {
    /**
     * Constructs an instance of SObjectOptionData.
     * @param {SObjectDescribe} [describe] - The description of the SObject.
     * @param {any} [translate={}] - Object containing translation information.
     */
    constructor(describe, translate = {}) {
        /** List of fields missing in the source */
        this.missingFieldsInSource = [];
        /** List of fields missing in the target */
        this.missingFieldsInTarget = [];
        /** List of fields that have anonymization but no field descriptions */
        this.anonymizationWithoutFieldDescriptions = [];
        /** List of mapped fields that are missing in the target */
        this.mappedFieldsMissingInTarget = [];
        this.objectError = (describe === null || describe === void 0 ? void 0 : describe.dataSource) === common_1.DataSource.source ? translate.missingInTarget
            : (describe === null || describe === void 0 ? void 0 : describe.dataSource) === common_1.DataSource.target ? translate.missingInSource
                : describe == undefined || describe.dataSource == common_1.DataSource.unknown ? translate.missingInBoth : null;
    }
}
exports.SObjectOptionData = SObjectOptionData;
//# sourceMappingURL=ui-models.js.map