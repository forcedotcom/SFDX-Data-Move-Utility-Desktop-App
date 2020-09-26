/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ScriptMockField } from "./scriptMockField";
import { ScriptMappingItem } from "./scriptMappingItem";
import { Type } from "class-transformer";
import { OPERATION, CONSTANTS, DATA_MEDIA_TYPE, SOURCE_TYPE } from "../components/statics";
import { NonSerializable, AppUtils, NonSerializableIfDefault, SerializableGetter } from "../components/appUtils";
import { UserDataWrapper } from "./userDataWrapper";
import { Config } from "./config";
import { SObjectDescribe } from "./sobjectDescribe";
import { Org } from "./org";
import { IAppModel, IPolymorphicField } from "../components/helper_interfaces";
import { FieldItem } from "./fieldItem";
import { SFieldDescribe } from "./sfieldDescribe";
import { ScriptObjectField } from "./ScriptObjectField";
import { RESOURCES } from "../components/resources";
import {
    Query as SOQLQuery,
    Field as SOQLField,
    getComposedField,
    parseQuery,
} from 'soql-parser-js';
import { SelectItem } from "../components/helper_classes";


/**
 * Parsed object 
 * from the script file 
 */
export class ScriptObject implements IAppModel {

    // ------------- JSON --------------

    // Mandatories ---
    @SerializableGetter([CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    get query(): string {
        return this.getQueryTemplate().format(this.fields.map(field => field.name).join(', '));
    }
    operation: string = OPERATION[OPERATION.Upsert].toString();
    externalId: string = CONSTANTS.DEFAULT_EXTERNAL_ID_FIELD_NAME;

    // Optionals --
    @NonSerializableIfDefault([], [CONSTANTS.EXPORT_JSON_TAG])
    @Type(() => ScriptMockField)
    mockFields: ScriptMockField[] = new Array<ScriptMockField>();

    @NonSerializableIfDefault([], [CONSTANTS.EXPORT_JSON_TAG])
    @Type(() => ScriptMappingItem)
    fieldMapping: ScriptMappingItem[] = new Array<ScriptMappingItem>();

    @SerializableGetter([CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    get deleteQuery(): string {
        if ((this.deleteOldData || this.enumOperation == OPERATION.Delete) && this.deleteWhere)
            return `SELECT Id FROM ${this.name} WHERE ${this.deleteWhere}`;
        else
            return undefined;
    }

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    deleteOldData: boolean = false;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    updateWithMockData: boolean = false;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    mockCSVData: boolean = false;

    @NonSerializableIfDefault("", [CONSTANTS.EXPORT_JSON_TAG])
    targetRecordsFilter: string = "";

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    excluded: boolean = false;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    useCSVValuesMapping: boolean = false;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    useFieldMapping: boolean = false;

    @NonSerializableIfDefault(false, [CONSTANTS.EXPORT_JSON_TAG])
    useValuesMapping: boolean = false;

    @NonSerializableIfDefault(true, [CONSTANTS.EXPORT_JSON_TAG])
    master: boolean = true;

    @NonSerializable()
    allRecords: boolean;

    @NonSerializableIfDefault([], [CONSTANTS.EXPORT_JSON_TAG])
    excludedFields: Array<string> = new Array<string>();


    // Other members (in memory only) ----------------------------     
    @NonSerializable([CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    @Type(() => ScriptObjectField)
    fields: Array<ScriptObjectField> = new Array<ScriptObjectField>();

    @NonSerializable([CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    where: string;

    @NonSerializable([CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    deleteWhere: string;

    @NonSerializable([CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    limit: number;

    @NonSerializable([CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    orderBy: string;

    // ------------ Constructor -----------------------//
    constructor(init?: Partial<ScriptObject>) {
        if (init) {
            this.initialize(init);
        }
    }



    // ------------ Other -----------------------//
    @NonSerializable()
    config: Config;

    @NonSerializable([CONSTANTS.EXPORT_JSON_TAG, CONSTANTS.EXPORT_JSON_FULL_TAG])
    name: string;

    @NonSerializable()
    errorMessage: string;

    @NonSerializable()
    fieldItems: FieldItem[] = new Array<FieldItem>();

    @NonSerializable()
    fullQueryFields: string[] = new Array<string>();

    @NonSerializable()
    availableFieldItemsForFieldMapping: Array<FieldItem> = new Array<FieldItem>();

    @NonSerializable()
    availableFieldItemsForMocking: Array<FieldItem> = new Array<FieldItem>();

    @NonSerializable()
    availableTargetSObjectNamesForFieldMapping: Array<FieldItem> = new Array<FieldItem>();

    @NonSerializable()
    availableTargetSFieldsNamesForFieldMapping: Array<FieldItem> = new Array<FieldItem>();

    @NonSerializable()
    mockPatterns: SelectItem[] = new Array<SelectItem>();

    @NonSerializable()
    private _polymorphicFields: IPolymorphicField[] = new Array<IPolymorphicField>();

    get isComplexExternalId(): boolean {
        return (this.externalId || "").indexOf(CONSTANTS.COMPLEX_FIELDS_SEPARATOR) >= 0;
    }

    get selectedFieldItems(): FieldItem[] {
        return this.fieldItems.filter(fieldItem => fieldItem.selected);
    }

    get label() {
        return this.sObjectDescribe.name || this.name;
    }

    get enumOperation(): OPERATION {
        return AppUtils.getOperation(this.operation);
    }

    get userData(): UserDataWrapper {
        return this.config && this.config.userData || new UserDataWrapper();
    }

    get sourceOrg(): Org {
        return this.userData.orgs && this.userData.orgs.filter(org => org.sourceType == SOURCE_TYPE.Source)[0];
    }

    get targetOrg(): Org {
        return this.userData.orgs && this.userData.orgs.filter(org => org.sourceType == SOURCE_TYPE.Target)[0];
    }

    get org(): Org {
        let sourceOrg = this.sourceOrg;
        let targetOrg = this.targetOrg;
        if (!sourceOrg && !targetOrg) {
            return new Org({
                media: DATA_MEDIA_TYPE.Unknown
            });
        }
        let org = new Org(sourceOrg.isOrg() ? sourceOrg : targetOrg);
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

    get sourceSObjectDescribe(): SObjectDescribe {
        if (this.sourceOrg.isOrg())
            return this.sourceOrg.objectsMap.get(this.name) || new SObjectDescribe();
        return this.targetSObjectDescribe;
    }

    get targetSObjectDescribe(): SObjectDescribe {
        if (this.targetOrg.isOrg())
            return this.targetOrg.objectsMap.get(this.name) || new SObjectDescribe();
        return this.sourceSObjectDescribe;
    }

    get sObjectDescribe(): SObjectDescribe {
        return this.org.objectsMap.get(this.name) || new SObjectDescribe();
    }

    get defaultExternalId(): string {
        if (this.name == CONSTANTS.RECORD_TYPE_SOBJECT_NAME) {
            return CONSTANTS.DEFAULT_RECORD_TYPE_ID_EXTERNAL_ID_FIELD_NAME;
        }
        if (!this.isOrgDescribed) {
            return "Id";
        }
        return ([].concat(
            [...this.sObjectDescribe.fieldsMap.values()].filter(field => field.nameField),
            [...this.sObjectDescribe.fieldsMap.values()].filter(field => field.autoNumber),
            [...this.sObjectDescribe.fieldsMap.values()].filter(field => field.unique))[0]
            || { name: "Id" })["name"];
    }

    get isOrgDescribed(): boolean {
        return this.sObjectDescribe.isValid();
    }

    get specialQueryFields(): SFieldDescribe[] {

        let multiFields: SFieldDescribe[] = new Array<SFieldDescribe>();

        // Multiselect fields //////////////
        let multiselectFields = this.fields.filter(field => CONSTANTS.MULTISELECT_SOQL_KEYWORDS.some(name => field.name == name));
        if (multiselectFields.length > 0) {
            let pattern: any = multiselectFields.reduce((acc, field) => {
                let name = field.name == "all" ? "all_true" : field.name;
                let parts = name.split('_');
                acc[parts[0]] = parts[1] == "true";
                return acc;
            }, {});

            multiFields = multiFields.concat([...this.sObjectDescribe.fieldsMap.values()].filter(fieldDescribe => {
                if ((___compare(pattern.all != "undefined", pattern.all == true)
                    || !Object.keys(pattern).some(prop => ___compare(fieldDescribe[prop], pattern[prop], true)))) {
                    if (!(fieldDescribe.lookup && CONSTANTS.OBJECTS_NOT_TO_USE_IN_QUERY_MULTISELECT.indexOf(fieldDescribe.referencedObjectType) >= 0)) {
                        return fieldDescribe;
                    }
                }
            }).filter(x => !!x));
        }

        // Compound fields //////////////
        if (this.name == "Account") {
            let compoundFields = this.fields.filter(field => [...CONSTANTS.COMPOUND_FIELDS.keys()].some(name => field.name == name));
            compoundFields.forEach(compoundField => {
                let queryFields = CONSTANTS.COMPOUND_FIELDS.get(compoundField.name);
                let describes = [...this.sObjectDescribe.fieldsMap.values()].filter(describe => {
                    return queryFields.some(queryField => queryField == describe.name);
                });
                multiFields = multiFields.concat(describes);
            });
        }

        return multiFields;

        // ------------- Local functions ---------------------//
        function ___compare(fieldDescribeProperty: any, patternProperty: any, negative: boolean = false): boolean {
            if (!negative)
                return fieldDescribeProperty == patternProperty || typeof patternProperty == "undefined";
            else
                return fieldDescribeProperty != patternProperty && typeof fieldDescribeProperty != "undefined";
        }

    }

    get polymorphicFields(): IPolymorphicField[] {
        return this._polymorphicFields;
    }

    get hasPolymorphicFields(): boolean {
        return this.polymorphicFields.length > 0;
    }

    get unresolvedPolymorphicFields(): IPolymorphicField[] {
        return this.polymorphicFields.filter(field => field.name.indexOf(CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR) < 0);
    }

    get hasUnresolvedPolymorphicFields(): boolean {
        return this.unresolvedPolymorphicFields.length > 0;
    }

    get hasInvalidFields(): boolean {
        return this.fieldItems.some(item => !item.isValid());
    }

    get excludedFieldsItems(): Array<FieldItem> {
        return this.fullQueryFields.filter(field => field != "Id" && field != this.externalId).map(name => new FieldItem({
            name,
            selected: this.excludedFields.some(f => f == name),
            isExcludedItem: true
        }));
    }

    get externalIdFieldItems(): FieldItem[] {
        return this.fieldItems.filter(field => field.sFieldDescribe && field.sFieldDescribe.canBeExternalId);
    }

    get included(): boolean {
        return !this.excluded;
    }
    set included(value: boolean) {
        this.excluded = !value;
    }

    get targetSobjectNameForFieldMapping(): string {
        let item = this.fieldMapping.filter(item => !!item.targetObject)[0];
        return item && item.targetObject;
    }

    get hasNonBreakingIssues(): boolean {
        return this.hasInvalidFieldMappings;
    }

    get hasInvalidFieldMappings(): boolean {
        return this.fieldMapping.some(field => !field.isValid());
    }



    // ------ Methods ------------- //
    initialize(init?: Partial<ScriptObject>) {
        if (init) {
            AppUtils.objectAssignSafe(this, init);
        }
    }

    isValid(): boolean {
        let errors = [];
        if (this.sourceOrg.isDescribed() && !this.sourceSObjectDescribe.isDescribed()) {
            errors.push(RESOURCES.ValidationError_MissingSObjectInSourceOrg);
        }
        if (this.targetOrg.isDescribed() && !this.targetSObjectDescribe.isDescribed()) {
            errors.push(RESOURCES.ValidationError_MissingSObjectInTargetOrg);
        }
        if (this.sourceSObjectDescribe.isValid() && this.targetSObjectDescribe.isValid()) {
            if (this.hasInvalidFields) {
                errors.push(RESOURCES.ValidationError_FieldMetadataErrors);
            }
        }
        this.errorMessage = errors.join(RESOURCES.ValidationError_Separator);
        return errors.length == 0 || this.excluded;
    }

    isInitialized(): boolean {
        return !!this.name;
    }

    isMissingInBothOrgs(): boolean {
        return !this.sObjectDescribe.isValid();
    }

    getSelectedFieldItems(): FieldItem[] {
        return this.fields.map(field => {
            return new FieldItem({
                name: field.name,
                selected: true,
                sFieldDescribe: this.sObjectDescribe.fieldsMap.get(field.cleanName) || new SFieldDescribe()
            });
        });
    }

    getFieldItems(): FieldItem[] {

        if (!this.isInitialized()) return new Array<FieldItem>();

        // --------- All object fields -------------------// 
        let items = this.getSelectedFieldItems();
        this._polymorphicFields = this.getPolymorphicFields();

        let compoundFields = this.name == "Account" ? [...CONSTANTS.COMPOUND_FIELDS.keys()] : new Array<string>();

        items = items.concat
            (
                // --------- All SObject metadata fields -------------------// 
                [...this.sObjectDescribe.fieldsMap.keys()]
                    .filter(field => !this.sObjectDescribe.fieldsMap.get(field).readonly)
                    .map(field => {
                        return new FieldItem({
                            name: field,
                            selected: false
                        });
                    }),

                // --------- Multiselect keywords + Compound fields + Other fields -------------------// 
                [].concat(CONSTANTS.MULTISELECT_SOQL_KEYWORDS, compoundFields, "Id").map(field => {
                    return new FieldItem({
                        name: field,
                        selected: false
                    });
                })
            );

        let unresolvedPolymorphicFields = this.unresolvedPolymorphicFields;
        items.forEach(item => {
            item.sFieldDescribe = this.sObjectDescribe.fieldsMap.get(item.cleanName) || new SFieldDescribe();
            item.isMultiselect = [].concat(CONSTANTS.MULTISELECT_SOQL_KEYWORDS, compoundFields).some(keyword => item.name == keyword);

            let sourceDescribe = this.sourceSObjectDescribe.fieldsMap.get(item.cleanName) || new SFieldDescribe();
            let targetDescribe = this.targetSObjectDescribe.fieldsMap.get(item.cleanName) || new SFieldDescribe();
            if (!item.isMultiselect) {
                let errors = [];
                if (!sourceDescribe.isValid() && this.sourceOrg.isOrg()) {
                    errors.push(RESOURCES.ValidationError_MissingFieldInSourceOrg);
                }
                if (!targetDescribe.isValid() && this.targetOrg.isOrg()) {
                    errors.push(RESOURCES.ValidationError_MissingFieldInTargetOrg);
                }
                if (unresolvedPolymorphicFields.some(fieldItem => fieldItem.name == item.name)) {
                    errors.push(RESOURCES.ValidationError_UnresolvedPolymorphicField);
                }
                item.errorMessage = errors.join(RESOURCES.ValidationError_Separator);
            }
        });
        items = AppUtils.distinctArray(items, "cleanName");

        // Field Mapping errors
        this.fieldMapping.forEach(field => {
            let errors = [];
            if (field.targetObject && this.org.isDescribed && !this.org.objectsMap.has(field.targetObject)) {
                errors.push(RESOURCES.ValidationError_FieldMappingTargetSObjectIsNotExist);
            }
            if (field.sourceField && this.sObjectDescribe.isDescribed()
                && this.sObjectDescribe.fieldsMap.size > 0
                && !this.sObjectDescribe.fieldsMap.has(field.sourceField)) {
                errors.push(RESOURCES.ValidationError_FieldMappingSourceFieldDoesNotExist);
            }
            if (field.targetField
                && this.org.isDescribed
                && this.org.objectsMap.has(this.targetSobjectNameForFieldMapping)
                && this.org.objectsMap.get(this.targetSobjectNameForFieldMapping).fieldsMap.size > 0
                && !this.org.objectsMap.get(this.targetSobjectNameForFieldMapping).fieldsMap.has(field.targetField)) {
                errors.push(RESOURCES.ValidationError_FieldMappingTargetFieldDoesNotExist);
            }
            field.errorMessage = errors.join('; ');
        });

        return AppUtils.sortArray(items, "category", "cleanName");
    }

    getFullQueryFields(): string[] {
        let fields: Array<string> = [].concat(
            this.specialQueryFields.map(field => field.name),
            this.fields.map(x => x.cleanName),
            !this.isComplexExternalId ? this.externalId : undefined
        ).filter(field => !!field);
        fields = AppUtils.exclude(fields, CONSTANTS.MULTISELECT_SOQL_KEYWORDS);
        fields = AppUtils.exclude(fields, [...CONSTANTS.COMPOUND_FIELDS.keys()]);
        fields = AppUtils.uniqueArray(fields);
        return fields;
    }

    getFullQueryFieldsDescriptions(): SFieldDescribe[] {
        return this.getFullQueryFields().map(field => {
            return this.sObjectDescribe.fieldsMap.get(field) || new SFieldDescribe();
        });
    }

    getQueryTemplate(limit?: number): string {
        return `SELECT {0} FROM ${this.name}${this.where ? ' WHERE ' + this.where : ''}${this.orderBy ? " ORDER BY " + this.orderBy : ""}${limit || this.limit ? " LIMIT " + (limit || this.limit) : ""}`;
    }

    getFullQuery(limit?: number): string {
        return this.getQueryTemplate(limit).format(this.fullQueryFields.join(', '));
    }

    getTestQuery(limit?: number): string {
        let testQueryFields = AppUtils.exclude(this.fullQueryFields, this.excludedFields);
        return this.getQueryTemplate(limit).format(testQueryFields.join(', '));
    }

    getPolymorphicFields(): IPolymorphicField[] {
        if (!this.org.isValid()) return [];
        let sobjects = [...this.org.objectsMap.values()];
        let polymorphic = this.getSelectedFieldItems().filter(field => field.sFieldDescribe && field.sFieldDescribe.isPolymorphic);
        return polymorphic
            .filter(field => field.sFieldDescribe && field.sFieldDescribe.isPolymorphic)
            .map(field => <IPolymorphicField>{
                name: field.name,
                referencedToSObjects: sobjects.filter(object => field.sFieldDescribe.referenceTo.indexOf(object.name) >= 0),
                referencedTo: field.sFieldDescribe.referenceTo,
                fieldItem: field,
                parentSObject: field.referencedObjectType
            });
    }

    getAvailableFieldItemsForFieldMapping(): FieldItem[] {    
        return this.getFullQueryFieldsDescriptions().filter(fieldDescr => {
            return fieldDescr.name != "Id"
                && !fieldDescr.lookup
                && fieldDescr.isValid()
                && CONSTANTS.FIELDS_NOT_TO_USE_IN_FIELD_MAPPING.indexOf(fieldDescr.name) < 0
        }).map(fieldItem => {
            let item = this.fieldItems.filter(item => item.name == fieldItem.name)[0];
            if (item) {
                return item;
            }
            return new FieldItem({
                name: fieldItem.name,
                sFieldDescribe: fieldItem,
            });
        });
    }

    getAvailableFieldItemsForMocking(): FieldItem[] {     
        return this.getFullQueryFieldsDescriptions().filter(fieldDescr => {
            return fieldDescr.name != "Id"
                && !fieldDescr.lookup
                && !fieldDescr.readonly

                // Can't anonymize external id fields
                && this.externalId
                && this.externalId.indexOf(fieldDescr.name) < 0
                
                && fieldDescr.isValid()
                && !this.mockFields.some(field => field.name == fieldDescr.name)
                && CONSTANTS.FIELDS_NOT_TO_USE_IN_FIELD_MOCKING.indexOf(fieldDescr.name) < 0

        }).map(fieldItem => {
            let item = this.fieldItems.filter(item => item.name == fieldItem.name)[0];
            if (item) {
                return item;
            }
            return new FieldItem({
                name: fieldItem.name,
                sFieldDescribe: fieldItem,
            });
        });
    }

    parseQueryString(query: string): SOQLQuery {
        if (!this.org.isValid()) return <SOQLQuery>{};
        let parsedQuery = parseQuery(query);
        let invalidFields = parsedQuery.fields
            .filter(field => (<SOQLField>field).type != "Field")
            .map(field => ((<SOQLField>field).rawValue || (<SOQLField>field).field));
        if (invalidFields.length > 0) {
            throw new Error(RESOURCES.Config_ReferencedFieldsNotAllowedToUse.format(invalidFields.filter(x => !!x).join(', ')));
        }
        let objectFields = this.sObjectDescribe.fields.map(field => field.name);
        let queryFields = new Array<string>("Id");
        parsedQuery.fields.forEach(field => {
            let f = <SOQLField>field;
            let normalizedField = AppUtils.searchClosest(f.rawValue || f.field, objectFields);
            queryFields.push(normalizedField);
        });
        queryFields = AppUtils.uniqueArray(queryFields);
        parsedQuery.fields = queryFields.map(field => getComposedField(field));
        parsedQuery.sObject = this.name;
        return parsedQuery;
    }

    getMockPatterns(): SelectItem[] {
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