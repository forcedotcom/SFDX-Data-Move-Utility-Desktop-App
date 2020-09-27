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
exports.ScriptObject = void 0;
const scriptMockField_1 = require("./scriptMockField");
const scriptMappingItem_1 = require("./scriptMappingItem");
const class_transformer_1 = require("class-transformer");
const statics_1 = require("../components/statics");
const appUtils_1 = require("../components/appUtils");
const userDataWrapper_1 = require("./userDataWrapper");
const config_1 = require("./config");
const sobjectDescribe_1 = require("./sobjectDescribe");
const org_1 = require("./org");
const fieldItem_1 = require("./fieldItem");
const sfieldDescribe_1 = require("./sfieldDescribe");
const ScriptObjectField_1 = require("./ScriptObjectField");
const resources_1 = require("../components/resources");
const soql_parser_js_1 = require("soql-parser-js");
/**
 * Parsed object
 * from the script file
 */
class ScriptObject {
    // ------------ Constructor -----------------------//
    constructor(init) {
        this.operation = statics_1.OPERATION[statics_1.OPERATION.Upsert].toString();
        this.externalId = statics_1.CONSTANTS.DEFAULT_EXTERNAL_ID_FIELD_NAME;
        // Optionals --
        this.mockFields = new Array();
        this.fieldMapping = new Array();
        this.deleteOldData = false;
        this.updateWithMockData = false;
        this.mockCSVData = false;
        this.targetRecordsFilter = "";
        this.excluded = false;
        this.useCSVValuesMapping = false;
        this.useFieldMapping = false;
        this.useValuesMapping = false;
        this.master = true;
        this.excludedFields = new Array();
        // Other members ----------------------------     
        this.deleteAllData = false;
        this.fields = new Array();
        this.fieldItems = new Array();
        this.fullQueryFields = new Array();
        this.availableFieldItemsForFieldMapping = new Array();
        this.availableFieldItemsForMocking = new Array();
        this.availableTargetSObjectNamesForFieldMapping = new Array();
        this.availableTargetSFieldsNamesForFieldMapping = new Array();
        this.mockPatterns = new Array();
        this._polymorphicFields = new Array();
        if (init) {
            this.initialize(init);
        }
    }
    // ------------- JSON --------------
    // Mandatories ---
    get query() {
        return this.getQueryTemplate().format(this.fields.map(field => field.name).join(', '));
    }
    get deleteQuery() {
        if (this.deleteOldData || this.enumOperation == statics_1.OPERATION.Delete) {
            if (this.deleteWhere)
                return `SELECT Id FROM ${this.name} WHERE ${this.deleteWhere}`;
            else if (this.deleteAllData)
                return `SELECT Id FROM ${this.name}`;
            else
                return undefined;
        }
        else
            return undefined;
    }
    get isComplexExternalId() {
        return (this.externalId || "").indexOf(statics_1.CONSTANTS.COMPLEX_FIELDS_SEPARATOR) >= 0;
    }
    get selectedFieldItems() {
        return this.fieldItems.filter(fieldItem => fieldItem.selected);
    }
    get label() {
        return this.sObjectDescribe.name || this.name;
    }
    get enumOperation() {
        return appUtils_1.AppUtils.getOperation(this.operation);
    }
    get userData() {
        return this.config && this.config.userData || new userDataWrapper_1.UserDataWrapper();
    }
    get sourceOrg() {
        return this.userData.orgs && this.userData.orgs.filter(org => org.sourceType == statics_1.SOURCE_TYPE.Source)[0];
    }
    get targetOrg() {
        return this.userData.orgs && this.userData.orgs.filter(org => org.sourceType == statics_1.SOURCE_TYPE.Target)[0];
    }
    get org() {
        let sourceOrg = this.sourceOrg;
        let targetOrg = this.targetOrg;
        if (!sourceOrg && !targetOrg) {
            return new org_1.Org({
                media: statics_1.DATA_MEDIA_TYPE.Unknown
            });
        }
        let org = new org_1.Org(sourceOrg.isOrg() ? sourceOrg : targetOrg);
        sourceOrg.isOrg() && sourceOrg.objectsMap.forEach((describe, name) => {
            if (!org.objectsMap.has(name)) {
                org.objectsMap.set(name, describe);
            }
        });
        targetOrg.isOrg() && targetOrg.objectsMap.forEach((describe, name) => {
            if (!org.objectsMap.has(name)) {
                org.objectsMap.set(name, describe);
            }
        });
        return org;
    }
    get sourceSObjectDescribe() {
        if (this.sourceOrg.isOrg())
            return this.sourceOrg.objectsMap.get(this.name) || new sobjectDescribe_1.SObjectDescribe();
        return this.targetSObjectDescribe;
    }
    get targetSObjectDescribe() {
        if (this.targetOrg.isOrg())
            return this.targetOrg.objectsMap.get(this.name) || new sobjectDescribe_1.SObjectDescribe();
        return this.sourceSObjectDescribe;
    }
    get sObjectDescribe() {
        return this.org.objectsMap.get(this.name) || new sobjectDescribe_1.SObjectDescribe();
    }
    get defaultExternalId() {
        if (this.name == statics_1.CONSTANTS.RECORD_TYPE_SOBJECT_NAME) {
            return statics_1.CONSTANTS.DEFAULT_RECORD_TYPE_ID_EXTERNAL_ID_FIELD_NAME;
        }
        if (!this.isOrgDescribed) {
            return "Id";
        }
        return ([].concat([...this.sObjectDescribe.fieldsMap.values()].filter(field => field.nameField), [...this.sObjectDescribe.fieldsMap.values()].filter(field => field.autoNumber), [...this.sObjectDescribe.fieldsMap.values()].filter(field => field.unique))[0]
            || { name: "Id" })["name"];
    }
    get isOrgDescribed() {
        return this.sObjectDescribe.isValid();
    }
    get specialQueryFields() {
        let multiFields = new Array();
        // Multiselect fields //////////////
        let multiselectFields = this.fields.filter(field => statics_1.CONSTANTS.MULTISELECT_SOQL_KEYWORDS.some(name => field.name == name));
        if (multiselectFields.length > 0) {
            let pattern = multiselectFields.reduce((acc, field) => {
                let name = field.name == "all" ? "all_true" : field.name;
                let parts = name.split('_');
                acc[parts[0]] = parts[1] == "true";
                return acc;
            }, {});
            multiFields = multiFields.concat([...this.sObjectDescribe.fieldsMap.values()].filter(fieldDescribe => {
                if ((___compare(pattern.all != "undefined", pattern.all == true)
                    || !Object.keys(pattern).some(prop => ___compare(fieldDescribe[prop], pattern[prop], true)))) {
                    if (!(fieldDescribe.lookup && statics_1.CONSTANTS.OBJECTS_NOT_TO_USE_IN_QUERY_MULTISELECT.indexOf(fieldDescribe.referencedObjectType) >= 0)) {
                        return fieldDescribe;
                    }
                }
            }).filter(x => !!x));
        }
        // Compound fields //////////////
        if (this.name == "Account") {
            let compoundFields = this.fields.filter(field => [...statics_1.CONSTANTS.COMPOUND_FIELDS.keys()].some(name => field.name == name));
            compoundFields.forEach(compoundField => {
                let queryFields = statics_1.CONSTANTS.COMPOUND_FIELDS.get(compoundField.name);
                let describes = [...this.sObjectDescribe.fieldsMap.values()].filter(describe => {
                    return queryFields.some(queryField => queryField == describe.name);
                });
                multiFields = multiFields.concat(describes);
            });
        }
        return multiFields;
        // ------------- Local functions ---------------------//
        function ___compare(fieldDescribeProperty, patternProperty, negative = false) {
            if (!negative)
                return fieldDescribeProperty == patternProperty || typeof patternProperty == "undefined";
            else
                return fieldDescribeProperty != patternProperty && typeof fieldDescribeProperty != "undefined";
        }
    }
    get polymorphicFields() {
        return this._polymorphicFields;
    }
    get hasPolymorphicFields() {
        return this.polymorphicFields.length > 0;
    }
    get unresolvedPolymorphicFields() {
        return this.polymorphicFields.filter(field => field.name.indexOf(statics_1.CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR) < 0);
    }
    get hasUnresolvedPolymorphicFields() {
        return this.unresolvedPolymorphicFields.length > 0;
    }
    get hasInvalidFields() {
        return this.fieldItems.some(item => !item.isValid());
    }
    get excludedFieldsItems() {
        return this.fullQueryFields.filter(field => field != "Id" && field != this.externalId).map(name => new fieldItem_1.FieldItem({
            name,
            selected: this.excludedFields.some(f => f == name),
            isExcludedItem: true
        }));
    }
    get externalIdFieldItems() {
        return this.fieldItems.filter(field => field.sFieldDescribe && field.sFieldDescribe.canBeExternalId);
    }
    get included() {
        return !this.excluded;
    }
    set included(value) {
        this.excluded = !value;
    }
    get targetSobjectNameForFieldMapping() {
        let item = this.fieldMapping.filter(item => !!item.targetObject)[0];
        return item && item.targetObject;
    }
    get hasNonBreakingIssues() {
        return this.hasInvalidFieldMappings;
    }
    get hasInvalidFieldMappings() {
        return this.fieldMapping.some(field => !field.isValid());
    }
    // ------ Methods ------------- //
    initialize(init) {
        if (init) {
            appUtils_1.AppUtils.objectAssignSafe(this, init);
        }
    }
    isValid() {
        let errors = [];
        if (this.sourceOrg.isDescribed() && !this.sourceSObjectDescribe.isDescribed()) {
            errors.push(resources_1.RESOURCES.ValidationError_MissingSObjectInSourceOrg);
        }
        if (this.targetOrg.isDescribed() && !this.targetSObjectDescribe.isDescribed()) {
            errors.push(resources_1.RESOURCES.ValidationError_MissingSObjectInTargetOrg);
        }
        if (this.sourceSObjectDescribe.isValid() && this.targetSObjectDescribe.isValid()) {
            if (this.hasInvalidFields) {
                errors.push(resources_1.RESOURCES.ValidationError_FieldMetadataErrors);
            }
        }
        this.errorMessage = errors.join(resources_1.RESOURCES.ValidationError_Separator);
        return errors.length == 0 || this.excluded;
    }
    isInitialized() {
        return !!this.name;
    }
    isMissingInBothOrgs() {
        return !this.sObjectDescribe.isValid();
    }
    getSelectedFieldItems() {
        return this.fields.map(field => {
            return new fieldItem_1.FieldItem({
                name: field.name,
                selected: true,
                sFieldDescribe: this.sObjectDescribe.fieldsMap.get(field.cleanName) || new sfieldDescribe_1.SFieldDescribe()
            });
        });
    }
    getFieldItems() {
        if (!this.isInitialized())
            return new Array();
        // --------- All object fields -------------------// 
        let items = this.getSelectedFieldItems();
        this._polymorphicFields = this.getPolymorphicFields();
        let compoundFields = this.name == "Account" ? [...statics_1.CONSTANTS.COMPOUND_FIELDS.keys()] : new Array();
        items = items.concat(
        // --------- All SObject metadata fields -------------------// 
        [...this.sObjectDescribe.fieldsMap.keys()]
            .filter(field => !this.sObjectDescribe.fieldsMap.get(field).readonly)
            .map(field => {
            return new fieldItem_1.FieldItem({
                name: field,
                selected: false
            });
        }), 
        // --------- Multiselect keywords + Compound fields + Other fields -------------------// 
        [].concat(statics_1.CONSTANTS.MULTISELECT_SOQL_KEYWORDS, compoundFields, "Id").map(field => {
            return new fieldItem_1.FieldItem({
                name: field,
                selected: false
            });
        }));
        let unresolvedPolymorphicFields = this.unresolvedPolymorphicFields;
        items.forEach(item => {
            item.sFieldDescribe = this.sObjectDescribe.fieldsMap.get(item.cleanName) || new sfieldDescribe_1.SFieldDescribe();
            item.isMultiselect = [].concat(statics_1.CONSTANTS.MULTISELECT_SOQL_KEYWORDS, compoundFields).some(keyword => item.name == keyword);
            let sourceDescribe = this.sourceSObjectDescribe.fieldsMap.get(item.cleanName) || new sfieldDescribe_1.SFieldDescribe();
            let targetDescribe = this.targetSObjectDescribe.fieldsMap.get(item.cleanName) || new sfieldDescribe_1.SFieldDescribe();
            if (!item.isMultiselect) {
                let errors = [];
                if (!sourceDescribe.isValid() && this.sourceOrg.isOrg()) {
                    errors.push(resources_1.RESOURCES.ValidationError_MissingFieldInSourceOrg);
                }
                if (!targetDescribe.isValid() && this.targetOrg.isOrg()) {
                    errors.push(resources_1.RESOURCES.ValidationError_MissingFieldInTargetOrg);
                }
                if (unresolvedPolymorphicFields.some(fieldItem => fieldItem.name == item.name)) {
                    errors.push(resources_1.RESOURCES.ValidationError_UnresolvedPolymorphicField);
                }
                item.errorMessage = errors.join(resources_1.RESOURCES.ValidationError_Separator);
            }
        });
        items = appUtils_1.AppUtils.distinctArray(items, "cleanName");
        // Field Mapping errors
        this.fieldMapping.forEach(field => {
            let errors = [];
            if (field.targetObject && this.org.isDescribed && !this.org.objectsMap.has(field.targetObject)) {
                errors.push(resources_1.RESOURCES.ValidationError_FieldMappingTargetSObjectIsNotExist);
            }
            if (field.sourceField && this.sObjectDescribe.isDescribed()
                && this.sObjectDescribe.fieldsMap.size > 0
                && !this.sObjectDescribe.fieldsMap.has(field.sourceField)) {
                errors.push(resources_1.RESOURCES.ValidationError_FieldMappingSourceFieldDoesNotExist);
            }
            if (field.targetField
                && this.org.isDescribed
                && this.org.objectsMap.has(this.targetSobjectNameForFieldMapping)
                && this.org.objectsMap.get(this.targetSobjectNameForFieldMapping).fieldsMap.size > 0
                && !this.org.objectsMap.get(this.targetSobjectNameForFieldMapping).fieldsMap.has(field.targetField)) {
                errors.push(resources_1.RESOURCES.ValidationError_FieldMappingTargetFieldDoesNotExist);
            }
            field.errorMessage = errors.join('; ');
        });
        return appUtils_1.AppUtils.sortArray(items, "category", "cleanName");
    }
    getFullQueryFields() {
        let fields = [].concat(this.specialQueryFields.map(field => field.name), this.fields.map(x => x.cleanName), !this.isComplexExternalId ? this.externalId : undefined).filter(field => !!field);
        fields = appUtils_1.AppUtils.exclude(fields, statics_1.CONSTANTS.MULTISELECT_SOQL_KEYWORDS);
        fields = appUtils_1.AppUtils.exclude(fields, [...statics_1.CONSTANTS.COMPOUND_FIELDS.keys()]);
        fields = appUtils_1.AppUtils.uniqueArray(fields);
        return fields;
    }
    getFullQueryFieldsDescriptions() {
        return this.getFullQueryFields().map(field => {
            return this.sObjectDescribe.fieldsMap.get(field) || new sfieldDescribe_1.SFieldDescribe();
        });
    }
    getQueryTemplate(limit) {
        return `SELECT {0} FROM ${this.name}${this.where ? ' WHERE ' + this.where : ''}${this.orderBy ? " ORDER BY " + this.orderBy : ""}${limit || this.limit ? " LIMIT " + (limit || this.limit) : ""}`;
    }
    getFullQuery(limit) {
        return this.getQueryTemplate(limit).format(this.fullQueryFields.join(', '));
    }
    getTestQuery(limit) {
        let testQueryFields = appUtils_1.AppUtils.exclude(this.fullQueryFields, this.excludedFields);
        return this.getQueryTemplate(limit).format(testQueryFields.join(', '));
    }
    getPolymorphicFields() {
        if (!this.org.isValid())
            return [];
        let sobjects = [...this.org.objectsMap.values()];
        let polymorphic = this.getSelectedFieldItems().filter(field => field.sFieldDescribe && field.sFieldDescribe.isPolymorphic);
        return polymorphic
            .filter(field => field.sFieldDescribe && field.sFieldDescribe.isPolymorphic)
            .map(field => ({
            name: field.name,
            referencedToSObjects: sobjects.filter(object => field.sFieldDescribe.referenceTo.indexOf(object.name) >= 0),
            referencedTo: field.sFieldDescribe.referenceTo,
            fieldItem: field,
            parentSObject: field.referencedObjectType
        }));
    }
    getAvailableFieldItemsForFieldMapping() {
        return this.getFullQueryFieldsDescriptions().filter(fieldDescr => {
            return fieldDescr.name != "Id"
                && !fieldDescr.lookup
                && fieldDescr.isValid()
                && statics_1.CONSTANTS.FIELDS_NOT_TO_USE_IN_FIELD_MAPPING.indexOf(fieldDescr.name) < 0;
        }).map(fieldItem => {
            let item = this.fieldItems.filter(item => item.name == fieldItem.name)[0];
            if (item) {
                return item;
            }
            return new fieldItem_1.FieldItem({
                name: fieldItem.name,
                sFieldDescribe: fieldItem,
            });
        });
    }
    getAvailableFieldItemsForMocking() {
        return this.getFullQueryFieldsDescriptions().filter(fieldDescr => {
            return fieldDescr.name != "Id"
                && !fieldDescr.lookup
                && !fieldDescr.readonly
                // Can't anonymize external id fields
                && this.externalId
                && this.externalId.indexOf(fieldDescr.name) < 0
                && fieldDescr.isValid()
                && !this.mockFields.some(field => field.name == fieldDescr.name)
                && statics_1.CONSTANTS.FIELDS_NOT_TO_USE_IN_FIELD_MOCKING.indexOf(fieldDescr.name) < 0;
        }).map(fieldItem => {
            let item = this.fieldItems.filter(item => item.name == fieldItem.name)[0];
            if (item) {
                return item;
            }
            return new fieldItem_1.FieldItem({
                name: fieldItem.name,
                sFieldDescribe: fieldItem,
            });
        });
    }
    parseQueryString(query) {
        if (!this.org.isValid())
            return {};
        let parsedQuery = soql_parser_js_1.parseQuery(query);
        let invalidFields = parsedQuery.fields
            .filter(field => field.type != "Field")
            .map(field => (field.rawValue || field.field));
        if (invalidFields.length > 0) {
            throw new Error(resources_1.RESOURCES.Config_ReferencedFieldsNotAllowedToUse.format(invalidFields.filter(x => !!x).join(', ')));
        }
        let objectFields = this.sObjectDescribe.fields.map(field => field.name);
        let queryFields = new Array("Id");
        parsedQuery.fields.forEach(field => {
            let f = field;
            let normalizedField = appUtils_1.AppUtils.searchClosest(f.rawValue || f.field, objectFields);
            queryFields.push(normalizedField);
        });
        queryFields = appUtils_1.AppUtils.uniqueArray(queryFields);
        parsedQuery.fields = queryFields.map(field => soql_parser_js_1.getComposedField(field));
        parsedQuery.sObject = this.name;
        return parsedQuery;
    }
    getMockPatterns() {
        return [
            {
                text: "Country",
                value: "country",
            },
            {
                text: "City",
                value: "city",
            },
            {
                text: "Zip",
                value: "zip()",
            },
            {
                text: "Street",
                value: "street",
            },
            {
                text: "Address",
                value: "address",
            },
            {
                text: "Address1",
                value: "address1",
            },
            {
                text: "Address2",
                value: "address2",
            },
            {
                text: "State",
                value: "state",
            },
            {
                text: "State abbr",
                value: "state_abbr",
            },
            {
                text: "Latitude",
                value: "latitude",
            },
            {
                text: "Longitude",
                value: "longitude",
            },
            {
                text: "Building number",
                value: "building_number",
            },
            {
                text: "Sentence",
                value: "sentence",
            },
            {
                text: "Title",
                value: "title",
            },
            {
                text: "Text",
                value: "text",
            },
            {
                text: "Short text",
                value: "string",
            },
            {
                text: "Description",
                value: "description",
            },
            {
                text: "Short description",
                value: "short_description",
            },
            {
                text: "Word",
                value: "word",
            },
            {
                text: "Letter",
                value: "letter",
            },
            {
                text: "IP Address",
                value: "ip",
            },
            {
                text: "Domain",
                value: "domain",
            },
            {
                text: "Url",
                value: "url",
            },
            {
                text: "Email",
                value: "email",
            },
            {
                text: "Browser user agent",
                value: "user_agent",
            },
            {
                text: "Name",
                value: "name",
            },
            {
                text: "Usernaconfigme",
                value: "username",
            },
            {
                text: "Fist name",
                value: "first_name",
            },
            {
                text: "Last name",
                value: "last_name",
            },
            {
                text: "Full name",
                value: "full_name",
            },
            {
                text: "Password",
                value: "full_name",
            },
            {
                text: "Name prefix",
                value: "name_prefix",
            },
            {
                text: "Name suffix",
                value: "name_suffix",
            },
            {
                text: "Company name",
                value: "company_name",
            },
            {
                text: "Company suffix",
                value: "company_suffix",
            },
            {
                text: "Catch phrase",
                value: "catch_phrase",
            },
            {
                text: "Phone",
                value: "phone",
            },
            {
                text: "From 0 to 1",
                value: "random",
            },
            {
                text: "Integer",
                value: "integer()",
            },
            {
                text: "Double",
                value: "double()",
            },
            {
                text: "Date",
                value: "date()",
            },
            {
                text: "Time",
                value: "time()",
            },
            {
                text: "Century",
                value: "century",
            },
            {
                text: "AM/PM",
                value: "am_pm",
            },
            {
                text: "Day of year",
                value: "day_of_year",
            },
            {
                text: "Day of month",
                value: "day_of_month",
            },
            {
                text: "Day of week",
                value: "day_of_week",
            },
            {
                text: "Month number",
                value: "month_number",
            },
            {
                text: "Year",
                value: "year",
            },
            {
                text: "Timezone",
                value: "timezone",
            },
            {
                text: "Credit card number",
                value: "card_number('Visa')",
            },
            {
                text: "Credit card type",
                value: "card_type",
            },
            {
                text: "Credit card exp",
                value: "card_exp",
            },
            {
                text: "Country code",
                value: "country_code",
            },
            {
                text: "Language code",
                value: "language_code",
            },
            {
                text: "Locale",
                value: "locale",
            },
            {
                text: "Currency code",
                value: "currency_code",
            },
            {
                text: "Currency symbol",
                value: "currency_symbol",
            },
            {
                text: "Currency name",
                value: "currency_name",
            },
            {
                text: "Mime type",
                value: "mime_type",
            },
            {
                text: "File extension",
                value: "file_extension",
            },
            {
                text: "Boolean",
                value: "boolean",
            },
            {
                text: "UUID",
                value: "uuid",
            },
            {
                text: "Color name",
                value: "color_name",
            },
            {
                text: "RGB HEX Color name",
                value: "rgb_hex",
            },
            {
                text: "Incremented days",
                value: `c_seq_date('2018-01-01','d')`
            },
            {
                text: "Autonumber",
                value: `c_seq_number('${this.name.replace("__c", "")}_',1,1)`
            },
            {
                text: "Record Id",
                value: `ids`
            }
        ].sort((a, b) => (a.text > b.text) ? 1 : -1);
    }
    /**
    * This method is intended to update the properties only once
    * to avoid circular digests of angualar framework.
    * So we could not use getters.
    */
    updateFieldItems() {
        this.fieldItems = this.getFieldItems();
        this.fullQueryFields = this.getFullQueryFields();
        this.availableFieldItemsForFieldMapping = this.getAvailableFieldItemsForFieldMapping();
        this.availableFieldItemsForMocking = this.getAvailableFieldItemsForMocking();
        this.mockPatterns = this.getMockPatterns();
    }
}
__decorate([
    appUtils_1.SerializableGetter([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], ScriptObject.prototype, "query", null);
__decorate([
    appUtils_1.NonSerializableIfDefault([], [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    class_transformer_1.Type(() => scriptMockField_1.ScriptMockField),
    __metadata("design:type", Array)
], ScriptObject.prototype, "mockFields", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault([], [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    class_transformer_1.Type(() => scriptMappingItem_1.ScriptMappingItem),
    __metadata("design:type", Array)
], ScriptObject.prototype, "fieldMapping", void 0);
__decorate([
    appUtils_1.SerializableGetter([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], ScriptObject.prototype, "deleteQuery", null);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "deleteOldData", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "updateWithMockData", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "mockCSVData", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault("", [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", String)
], ScriptObject.prototype, "targetRecordsFilter", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "excluded", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "useCSVValuesMapping", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "useFieldMapping", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(false, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "useValuesMapping", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault(true, [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "master", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "allRecords", void 0);
__decorate([
    appUtils_1.NonSerializableIfDefault([], [statics_1.CONSTANTS.EXPORT_JSON_TAG]),
    __metadata("design:type", Array)
], ScriptObject.prototype, "excludedFields", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "deleteAllData", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    class_transformer_1.Type(() => ScriptObjectField_1.ScriptObjectField),
    __metadata("design:type", Array)
], ScriptObject.prototype, "fields", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", String)
], ScriptObject.prototype, "where", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", String)
], ScriptObject.prototype, "deleteWhere", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", Number)
], ScriptObject.prototype, "limit", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", String)
], ScriptObject.prototype, "orderBy", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", config_1.Config)
], ScriptObject.prototype, "config", void 0);
__decorate([
    appUtils_1.NonSerializable([statics_1.CONSTANTS.EXPORT_JSON_TAG, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG]),
    __metadata("design:type", String)
], ScriptObject.prototype, "name", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", String)
], ScriptObject.prototype, "errorMessage", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Array)
], ScriptObject.prototype, "fieldItems", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Array)
], ScriptObject.prototype, "fullQueryFields", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Array)
], ScriptObject.prototype, "availableFieldItemsForFieldMapping", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Array)
], ScriptObject.prototype, "availableFieldItemsForMocking", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Array)
], ScriptObject.prototype, "availableTargetSObjectNamesForFieldMapping", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Array)
], ScriptObject.prototype, "availableTargetSFieldsNamesForFieldMapping", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Array)
], ScriptObject.prototype, "mockPatterns", void 0);
__decorate([
    appUtils_1.NonSerializable(),
    __metadata("design:type", Array)
], ScriptObject.prototype, "_polymorphicFields", void 0);
exports.ScriptObject = ScriptObject;
//# sourceMappingURL=scriptObject.js.map