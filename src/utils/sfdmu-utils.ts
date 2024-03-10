import { parseQuery } from "soql-parser-js";
import { CONSTANTS } from "../common";
import { IOption, IParsedSoql, OrgDescribe, SFieldDescribe, SObjectDescribe, ScriptObject } from "../models";


export type FullQuery = {
    sObject: ScriptObject,
    fields: string[],
    query: string
}


/**
 * A utility class for shared SFDMU functionality.
 */
export class SfdmuUtils {

    /**
     * Gets the default external ID for the specified object name and connection.
     * @param name The name of the object.
     * @param orgDescribe The organization describe.
     * @returns The default external ID.
     */
    static getDefaultExternalId(name: string, orgDescribe: OrgDescribe): string {
        if (name === CONSTANTS.SFDMU.RECORD_TYPE_SOBJECT_NAME) {
            return CONSTANTS.SFDMU.DEFAULT_RECORD_TYPE_ID_EXTERNAL_ID_FIELD_NAME;
        }

        if (!orgDescribe.isInitialized) {
            return "Id";
        }

        if (CONSTANTS.SFDMU.DEFAULT_EXTERNAL_IDS[name]) {
            return CONSTANTS.SFDMU.DEFAULT_EXTERNAL_IDS[name];
        }

        const sObjectDescribe = orgDescribe.objectsMap.get(name);
        if (!sObjectDescribe || !sObjectDescribe.isDescribed) {
            return "Id";
        }

        return (
            [].concat(
                [...sObjectDescribe.fieldsMap.values()].filter(field => field.nameField),
                [...sObjectDescribe.fieldsMap.values()].filter(field => field.autoNumber),
                [...sObjectDescribe.fieldsMap.values()].filter(field => field.unique)
            )[0] || { name: "Id" }
        )["name"];

    }

    /**
     *  Creates a sort expression to sort fields by name, with Id first.
     * @param a The first field name.
     * @param b The second field name.
     */
    static sortFieldExpression(a: string, b: string): number {
        return a == "Id" ? -1 : (a > b ? 1 : b == a ? 0 : -1);
    }


    /**
     * Sets the SOQL fields for the script object.
     * @param object  The script object.
     * @param fields  The fields to include in the query string.
     * @param addIdField  Whether to add the Id field to the query string.
     * @returns  The query string and fields. Parameters: { fields, query }.
     */
    static setSOQLFields(object: ScriptObject, fields?: string[], addIdField = false): void {
        const data = SfdmuUtils.createQueryString(object, fields, addIdField);
        object.query = data.query;
        object.fields = data.fields;
        object.polymorphicFields = object.polymorphicFields && object.polymorphicFields
            .innerJoin(data.fields,
                (polymorphic, soqlField) => polymorphic.name == soqlField,
                (polymorphic) => polymorphic);
        object.excludedFields = object.excludedFields && object.excludedFields
            .innerJoin(data.fields,
                (excluded, soqlField) => excluded == soqlField,
                (excluded) => excluded);
        object.excludedFromUpdateFields = object.excludedFromUpdateFields && object.excludedFromUpdateFields
            .innerJoin(data.fields,
                (excluded, soqlField) => excluded == soqlField,
                (excluded) => excluded);
    }

    /**
     * Builds the query string for the script object.
     * @param object  The script object.
     * @param fields  The fields to include in the query string.
     * @param addIdField  Whether to add the Id field to the query string.
     * @param removeOffsetAndLimitAndOrderBy  Whether to remove the offset and limit from the query string.
     * @returns  The query string and fields. Parameters: { fields, query }.
     */
    static createQueryString(object: ScriptObject, fields?: string[], addIdField = true, removeOffsetAndLimitAndOrderBy = false): FullQuery {

        if (!fields || fields.length == 0) {
            fields = object.fields || [];
        }

        fields = [...fields];

        if (!fields.includesIgnoreCase('Id') && addIdField) {
            fields.push('Id');
        }
        fields = fields.sort(SfdmuUtils.sortFieldExpression);

        /**
         * The query string to append after the FROM keyword in the query.
         */
        const buildQueryAppendix = (object: ScriptObject): string => {
            let ret = object.where ? 'WHERE ' + object.where : '';

            if (object.orderBy && !removeOffsetAndLimitAndOrderBy) {
                ret += (ret ? ' ' : '') + 'ORDER BY ' + object.orderBy;
            }
            if (object.limit && !removeOffsetAndLimitAndOrderBy) {
                ret += (ret ? ' ' : '') + 'LIMIT ' + object.limit;
            }
            if (object.offset && !removeOffsetAndLimitAndOrderBy) {
                ret += (ret ? ' ' : '') + 'OFFSET ' + object.offset;
            }
            return ret.trim();
        }

        return {
            query: `SELECT ${fields.join(', ')} FROM ${object.name} ${buildQueryAppendix(object)}`.trim(),
            fields,
            sObject: object
        };
    }

    /**
     * Builds the count query string for the script object.
     * @param object  The script object.
     * @returns  The count query string.
     */
    static createCountQueryString(object: ScriptObject): string {
        return SfdmuUtils.createQueryString(object, ['COUNT(Id) cnt'], false, true).query;
    }

    /**
     * Builds the limited query string for the script object.
     * @param object  The script object.
     * @param limit  The limit.
     * @returns  The limited query string.
     */
    static createLimitedQueryString(object: ScriptObject, limit = 10): { sObject: ScriptObject, fields: string[], query: string } {
        const clonedObject = object.clone();
        clonedObject.limit = clonedObject.limit > 0 && clonedObject.limit < limit ? clonedObject.limit : limit;
        return SfdmuUtils.createQueryString(clonedObject);
    }

    /**
     *  Validates the query string for the script object.
     * @param query The query string.
     * @returns  True if the query string is valid; otherwise, false.
     */
    static validateSoql(query: string): boolean {
        try {
            if (!query) return true;
            parseQuery(query);
        } catch (error) {
            return false;
        }
        return true;
    }

    /**
     *  Parses the query string for the script object.
     * @param soql  The query string.
     * @param extractAliasesFromAggregadedFields  Whether to extract aliases from aggregated fields.
     * @returns  The parsed query.
     */
    static parseSoql(soql: string, extractAliasesFromAggregadedFields = false): IParsedSoql {

        soql = soql.replace(/\n/gm, ' ').replace(/\r/gm, '').trim();

        const fieldMatch = soql.match(/SELECT(.*)FROM/i);
        const fields = (fieldMatch ? fieldMatch[1].split(',').map(field => {
            field = field.trim();
            if (extractAliasesFromAggregadedFields) {
                field = field.replace(/(.*?)\s+(AS\s+)?(.*)/i, '$3');
            }
            return field;
        }) : []).sort(SfdmuUtils.sortFieldExpression);

        const objectNameMatch = soql.match(/FROM\s(.*?)(?:WHERE|ORDER BY|LIMIT|OFFSET|$)/i);
        const objectName = (objectNameMatch ? objectNameMatch[1] : '').trim();

        const whereMatch = soql.match(/WHERE\s(.*?)(?:ORDER BY|LIMIT|OFFSET|$)/i);
        const where = (whereMatch ? whereMatch[1] : '').trim();

        const orderByMatch = soql.match(/ORDER BY\s(.*?)(?:LIMIT|OFFSET|$)/i);
        const orderBy = (orderByMatch ? orderByMatch[1] : '').trim();

        const limitMatch = soql.match(/LIMIT\s(\d+)(?:\s|$)/i);
        const limit = limitMatch ? Number(limitMatch[1]) : 0;

        const offsetMatch = soql.match(/OFFSET\s(\d+)(?:\s|$)/i);
        const offset = offsetMatch ? Number(offsetMatch[1]) : 0;

        return { fields, objectName, where, orderBy, limit, offset };

    }



    /**
    * Checks if a name is a name of a custom sObject or field.  
    * @param {string} name - The name of the sObject or field to check.
    * @returns {boolean} - True if the name is a name of a custom sObject or field; otherwise, false.
    */
    static isCustom(name: string): boolean {
        if (!name) return false;
        return name.endsWith('__c')
            || name.endsWith('__pc')
            || name.endsWith('__s')
            || name.endsWith('__x');
    }

    /**
     *  Gets all the fields to include in the query string. 
     *  Supports multiselect fields like 'all', 'property_true', 'property_false'.
     * @param fields  The field names to include in the query string.
     * @param description  The sObject description.
     * @returns  All fields to include in the query string.
     */
    static getAllQueryStringFields(fields: string[], description: SObjectDescribe): string[] {

        const outputFieldsSet: Set<string> = new Set();
        const fieldsMap: Map<string, SFieldDescribe> = description.fieldsMap;

        const fieldConditionsMap = new Map<string, boolean[]>();
        let hasAll = false;

        for (const fieldName of fields) {

            if (fieldName.includes('.')) {
                outputFieldsSet.add(fieldName);
                continue;
            }

            if (fieldName === 'all') {
                // If 'all', add all field names to the set
                for (const key of fieldsMap.keys()) {
                    if (!SfdmuUtils._isMultiselectKeyword(key)) {
                        outputFieldsSet.add(key);
                    }
                }
                hasAll = true;
                break;
            }

            if (SfdmuUtils._isMultiselectKeyword(fieldName)) {

                const fieldNameParts = fieldName.split('_');
                const property = fieldNameParts[0];

                const expectedValue = fieldNameParts[1] === 'true';
                const expectedType = property == 'type' ? fieldNameParts[1] : null;

                fieldsMap.forEach((value, key) => {
                    const conditions = fieldConditionsMap.get(key) || [];
                    // Check if the property exists and its value matches the expected value
                    if (value.hasOwnProperty(property) && property != 'type') {
                        conditions.push(value[property] === expectedValue);
                        fieldConditionsMap.set(key, conditions);
                    }
                    // Check if the type matches the expected type
                    if (expectedType) {
                        conditions.push(value.type === expectedType);
                        fieldConditionsMap.set(key, conditions);
                    }
                });

            } else {
                // If fieldName format is not 'property_true' or 'property_false', 
                // try to find the field by its name and add it to the set if found
                if (fieldsMap.has(fieldName)) {
                    outputFieldsSet.add(fieldName);
                }
            }
        }

        // Only add a field to the output set if all conditions are true
        for (const [field, conditions] of fieldConditionsMap.entries()) {
            if (conditions.every(condition => condition) || hasAll) {
                outputFieldsSet.add(field);
            }
        }

        // Remove original multi-select keywords from the output set
        for (const fieldName of outputFieldsSet.keys()) {
            if (SfdmuUtils._isMultiselectKeyword(fieldName)) {
                outputFieldsSet.delete(fieldName);
            }
        }

        // Convert the set to an array before returning.
        // Sort the array by field name, preceded by Id.
        return Array.from(outputFieldsSet).sort(SfdmuUtils.sortFieldExpression);
    }

    /**
     * Filter out multiselect fields from all fields.
     * @param allFields  All fields.
     * @param defaultIfEmpty  The default value to return if allFields is empty.
     * @returns  All fields excluding multiselect fields.
     */
    static excludeMultiselectFields(allFields: Map<string, SFieldDescribe>, defaultIfEmpty = ['']): string[] {
        return allFields.size ? [...allFields.values()]
            .filter(field => !field.isMultiSelect)
            .map(field => field.name)
            .sort() : defaultIfEmpty;
    }

    /**
     *  Gett options for the field mock patterns.
     * @param sobject  The sObject to get the field mock patterns for.
     * @returns  The field mock pattern options.
     */
    static getFieldMockPatternOptions(sobject: ScriptObject): IOption[] {
        return ([
            { label: "Country", value: "country" },
            { label: "City", value: "city" },
            { label: "Zip", value: "zip()" },
            { label: "Street", value: "street" },
            { label: "Address", value: "address" },
            { label: "Address1", value: "address1" },
            { label: "Address2", value: "address2" },
            { label: "State", value: "state" },
            { label: "State abbr", value: "state_abbr" },
            { label: "Latitude", value: "latitude" },
            { label: "Longitude", value: "longitude" },
            { label: "Building number", value: "building_number" },
            { label: "Sentence", value: "sentence" },
            { label: "Title", value: "title" },
            { label: "Text", value: "text" },
            { label: "Short text", value: "string" },
            { label: "Description", value: "description" },
            { label: "Short description", value: "short_description" },
            { label: "Word", value: "word" },
            { label: "Letter", value: "letter" },
            { label: "IP Address", value: "ip" },
            { label: "Domain", value: "domain" },
            { label: "Url", value: "url" },
            { label: "Email", value: "email" },
            { label: "Browser user agent", value: "user_agent" },
            { label: "Name", value: "name" },
            { label: "Username", value: "username" },
            { label: "First name", value: "first_name" },
            { label: "Last name", value: "last_name" },
            { label: "Full name", value: "full_name" },
            { label: "Password", value: "full_name" },
            { label: "Name prefix", value: "name_prefix" },
            { label: "Name suffix", value: "name_suffix" },
            { label: "Company name", value: "company_name" },
            { label: "Company suffix", value: "company_suffix" },
            { label: "Catch phrase", value: "catch_phrase" },
            { label: "Phone", value: "phone" },
            { label: "From 0 to 1", value: "random" },
            { label: "Integer", value: "integer()" },
            { label: "Double", value: "double()" },
            { label: "Date", value: "date()" },
            { label: "Time", value: "time()" },
            { label: "Century", value: "century" },
            { label: "AM/PM", value: "am_pm" },
            { label: "Day of year", value: "day_of_year" },
            { label: "Day of month", value: "day_of_month" },
            { label: "Day of week", value: "day_of_week" },
            { label: "Month number", value: "month_number" },
            { label: "Year", value: "year" },
            { label: "Timezone", value: "timezone" },
            { label: "Credit card number", value: "card_number('Visa')" },
            { label: "Credit card type", value: "card_type" },
            { label: "Credit card exp", value: "card_exp" },
            { label: "Country code", value: "country_code" },
            { label: "Language code", value: "language_code" },
            { label: "Locale", value: "locale" },
            { label: "Currency code", value: "currency_code" },
            { label: "Currency symbol", value: "currency_symbol" },
            { label: "Currency name", value: "currency_name" },
            { label: "Mime type", value: "mime_type" },
            { label: "File extension", value: "file_extension" },
            { label: "Boolean", value: "boolean" },
            { label: "UUID", value: "uuid" },
            { label: "Color name", value: "color_name" },
            { label: "RGB HEX Color name", value: "rgb_hex" },
            { label: "Incremented days", value: `c_seq_date('2018-01-01','d')` },
            { label: "Autonumber", value: `c_seq_number('${sobject.name.replace("__c", "")}_',1,1)` },
            { label: "Record Id", value: `ids` }
        ] as IOption[]).sort((item1, item2) => item1.label.localeCompare(item2.label));
    }

   


    /* #region Helper / Private methods */
    /**
     * Checks if a keyword is a multiselect keyword.
     * @param keyword  The keyword to check.
     * @returns  True if the keyword is a multiselect keyword; otherwise, false.
     */
    private static _isMultiselectKeyword(keyword: string): boolean {
        return keyword === 'all' || keyword.endsWith('_true') || keyword.endsWith('_false') || keyword.startsWith('type_');
    }
    /* #endregion */

}


