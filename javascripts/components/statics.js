"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSTANTS = exports.CONSOLE_COMMAND_EVENT_TYPE = exports.MIGRATION_DIRECTION = exports.SOURCE_TYPE = exports.OPERATION = exports.DATA_MEDIA_TYPE = void 0;
var DATA_MEDIA_TYPE;
(function (DATA_MEDIA_TYPE) {
    DATA_MEDIA_TYPE[DATA_MEDIA_TYPE["Org"] = 0] = "Org";
    DATA_MEDIA_TYPE[DATA_MEDIA_TYPE["File"] = 1] = "File";
    DATA_MEDIA_TYPE[DATA_MEDIA_TYPE["Unknown"] = 2] = "Unknown";
})(DATA_MEDIA_TYPE = exports.DATA_MEDIA_TYPE || (exports.DATA_MEDIA_TYPE = {}));
var OPERATION;
(function (OPERATION) {
    OPERATION[OPERATION["Insert"] = 0] = "Insert";
    OPERATION[OPERATION["Update"] = 1] = "Update";
    OPERATION[OPERATION["Upsert"] = 2] = "Upsert";
    OPERATION[OPERATION["Readonly"] = 3] = "Readonly";
    OPERATION[OPERATION["Delete"] = 4] = "Delete";
    OPERATION[OPERATION["Unknown"] = 5] = "Unknown";
})(OPERATION = exports.OPERATION || (exports.OPERATION = {}));
var SOURCE_TYPE;
(function (SOURCE_TYPE) {
    SOURCE_TYPE[SOURCE_TYPE["Source"] = 0] = "Source";
    SOURCE_TYPE[SOURCE_TYPE["Target"] = 1] = "Target";
    SOURCE_TYPE[SOURCE_TYPE["Unknown"] = 2] = "Unknown";
})(SOURCE_TYPE = exports.SOURCE_TYPE || (exports.SOURCE_TYPE = {}));
var MIGRATION_DIRECTION;
(function (MIGRATION_DIRECTION) {
    MIGRATION_DIRECTION[MIGRATION_DIRECTION["Orgs"] = 0] = "Orgs";
    MIGRATION_DIRECTION[MIGRATION_DIRECTION["Org2File"] = 1] = "Org2File";
    MIGRATION_DIRECTION[MIGRATION_DIRECTION["File2Org"] = 2] = "File2Org";
})(MIGRATION_DIRECTION = exports.MIGRATION_DIRECTION || (exports.MIGRATION_DIRECTION = {}));
var CONSOLE_COMMAND_EVENT_TYPE;
(function (CONSOLE_COMMAND_EVENT_TYPE) {
    CONSOLE_COMMAND_EVENT_TYPE[CONSOLE_COMMAND_EVENT_TYPE["Start"] = 0] = "Start";
    CONSOLE_COMMAND_EVENT_TYPE[CONSOLE_COMMAND_EVENT_TYPE["StdOutData"] = 1] = "StdOutData";
    CONSOLE_COMMAND_EVENT_TYPE[CONSOLE_COMMAND_EVENT_TYPE["StdErrData"] = 2] = "StdErrData";
    CONSOLE_COMMAND_EVENT_TYPE[CONSOLE_COMMAND_EVENT_TYPE["Close"] = 3] = "Close";
    CONSOLE_COMMAND_EVENT_TYPE[CONSOLE_COMMAND_EVENT_TYPE["Exit"] = 4] = "Exit";
    CONSOLE_COMMAND_EVENT_TYPE[CONSOLE_COMMAND_EVENT_TYPE["Error"] = 5] = "Error";
})(CONSOLE_COMMAND_EVENT_TYPE = exports.CONSOLE_COMMAND_EVENT_TYPE || (exports.CONSOLE_COMMAND_EVENT_TYPE = {}));
exports.CONSTANTS = {
    PACKAGE_JSON_REMOTE_URL: "https://raw.githubusercontent.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App/master/package.json",
    DEFAULT_POLLING_INTERVAL_MS: 5000,
    DEFAULT_BULK_API_THRESHOLD_RECORDS: 200,
    DEFAULT_BULK_API_VERSION: '2.0',
    DEFAULT_BULK_API_V1_BATCH_SIZE: 9500,
    DEFAULT_API_VERSION: '49.0',
    DEFAULT_EXTERNAL_ID_FIELD_NAME: "Id",
    DEFAULT_MOCK_PATTERN: "word",
    UI_TOAST_TIMEOUT_MS: 3000,
    UI_SHORT_TOAST_TIMEOUT_MS: 1000,
    DEFAULT_APP_SETTINGS: {
        db_name: "sfdmu_app",
        db_path: "SFDMU_APP/data/",
        db_moveFiles: true
    },
    MAX_CONCURRENT_PARALLEL_REQUESTS: 10,
    MAX_FETCH_SIZE: 100000,
    BULK_QUERY_API_POLL_TIMEOUT: 4 * 60 * 1000,
    DEFAULT_RECORD_TYPE_ID_EXTERNAL_ID_FIELD_NAME: "DeveloperName",
    RECORD_TYPE_SOBJECT_NAME: "RecordType",
    COMPLEX_FIELDS_SEPARATOR: ';',
    REFERENCE_FIELD_OBJECT_SEPARATOR: '$',
    WORKING_SUBFOLDER_NAME_PREFIX: '_',
    DUMMY_DB_USER: 'dummy',
    SCRIPT_FILE_NAME: 'export.json',
    CLI_OUTPUT_FILE_NAME: 'sfdx_result.json',
    USER_SETTINGS_FILE_NAME: 'user.json',
    EXPORT_DATA_SUBFOLDER: "/_export/",
    DB_FILE_EXTENSION: ".db",
    CSV_FILES_SOURCENAME: "csvfile",
    CSV_FILES_DISPLAY_SOURCENAME: "-- csvfile --",
    EXPORT_CONFIGURATION_FILE_EXTENSION: '.cfg',
    DEFAULT_TOAST_TYPE: "success",
    USER_OBJECT_SELECT_FIELDS: {
        email: '1',
        password: '1',
        id: '1',
        data: '1'
    },
    MOCK_PATTERN_ENTIRE_ROW_FLAG: '--row',
    SPECIAL_MOCK_COMMANDS: [
        "c_seq_number",
        "c_seq_date"
    ],
    NOT_SUPPORTED_OBJECTS: [
        'Profile',
        'RecordType',
        'User',
        'Group',
        'DandBCompany'
    ],
    FIELDS_IGNORE_POLYMORPHIC: [
        "OwnerId"
    ],
    MULTISELECT_SOQL_KEYWORDS: [
        "all",
        "readonly_true",
        "readonly_false",
        "custom_true",
        "custom_false",
        "updateable_true",
        "updateable_false",
        "createable_true",
        "createable_false",
        "lookup_true",
        "lookup_false",
        "person_true",
        "person_false"
    ],
    OBJECTS_NOT_TO_USE_IN_QUERY_MULTISELECT: [
        'RecordType',
        'User',
        'Group',
        'DandBCompany'
    ],
    FIELDS_NOT_TO_USE_IN_FIELD_MOCKING: [
        "Body"
    ],
    FIELDS_NOT_TO_USE_IN_FIELD_MAPPING: [
    // TODO:
    ],
    MANDATORY_FIELDS: ["Id"],
    COMPOUND_FIELDS: new Map([
        ["BillingAddress", new Array("BillingGeocodeAccuracy", "BillingCity", "BillingCountry", "BillingLatitude", "BillingLongitude", "BillingPostalCode", "BillingState", "BillingStreet")],
        ["ShippingAddress", new Array("ShippingGeocodeAccuracy", "ShippingCity", "ShippingCountry", "ShippingLatitude", "ShippingLongitude", "ShippingPostalCode", "ShippingState", "ShippingStreet")],
        ["MailingAddress", new Array("MailingGeocodeAccuracy", "MailingCity", "MailingCountry", "MailingLatitude", "MailingLongitude", "MailingPostalCode", "MailingState", "MailingStreet")]
    ]),
    SOQL_KEYWRDS: [
        "SELECT|SELECT",
        "FROM|FROM",
        "WHERE|WHERE",
        "ORDER\s+BY|ORDER BY",
        "LIMIT|LIMIT",
        "OFFSET|OFFSET"
    ],
    MIGRATION_DIRECTIONS: [
        {
            text: "Salesforce Org -> Salesforce Org",
            value: MIGRATION_DIRECTION[MIGRATION_DIRECTION.Orgs]
        },
        {
            text: "Salesforce Org -> CSV File",
            value: MIGRATION_DIRECTION[MIGRATION_DIRECTION.Org2File]
        },
        {
            text: "CSV File -> Salesforce Org",
            value: MIGRATION_DIRECTION[MIGRATION_DIRECTION.File2Org]
        },
    ],
    EXPORT_JSON_TAG: "export.json",
    EXPORT_JSON_FULL_TAG: "export-full.json",
    EXPORT_OBJECT_TAG: "export.object",
};
//# sourceMappingURL=statics.js.map