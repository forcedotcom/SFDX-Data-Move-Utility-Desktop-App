"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForceOrgDisplayResult = exports.ForceOrg = exports.JSforceConnection = exports.ScriptMockField = exports.ScriptMappingItem = exports.ScriptOrg = exports.PolymorphicField = exports.ScriptObject = exports.ScriptObjectSet = exports.Script = exports.OrgDescribe = exports.SObjectDescribe = exports.SFieldDescribe = exports.DescribeBase = exports.ScriptEntityBase = void 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const class_transformer_1 = require("class-transformer");
const jsforce = __importStar(require("jsforce"));
require("reflect-metadata");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const common_1 = require("../common");
const utils_1 = require("../utils");
const database_models_1 = require("./database-models");
/* #region Base Classes */
/**
 * Represents a base abstract class for script entities.
 * @implements {IEntityBase}
 */
class ScriptEntityBase {
    constructor() {
        /**
         * An array of error messages associated with the entity.
         */
        this._errorMessages = new Array();
    }
    /**
     * Retrieves the error messages of the entity.
     */
    get errorMessages() {
        return this._errorMessages;
    }
    /**
     * Sets the error messages of the entity.
     */
    set errorMessages(value) {
        this._errorMessages = value;
    }
    /**
     * Checks if the entity is initialized.
     */
    get isInitialized() {
        return !!this.id;
    }
    /**
     * Checks if the entity is valid.
     * An entity is considered valid if it is initialized and has no error messages.
     */
    get isValid() {
        return this.isInitialized && !this.errorMessages.length;
    }
    /**
     * Initializes the entity.
     * This method should be overridden in derived classes.
     */
    init() {
        // Override in derived classes
    }
}
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", String)
], ScriptEntityBase.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], ScriptEntityBase.prototype, "_errorMessages", void 0);
exports.ScriptEntityBase = ScriptEntityBase;
/**
 * Represents a base abstract class for describing entities.
 * @implements {IEntityBase}
 */
class DescribeBase {
    constructor() {
        /**
         * The unique identifier of the entity.
         */
        this.id = "";
        /**
         * The name of the entity.
         */
        this.name = "";
        /**
         * The label of the entity.
         */
        this.label = "";
        /**
         * The data source of the entity.
         */
        this.dataSource = common_1.DataSource.unknown;
        /**
         * An array of error messages associated with the entity.
         */
        this._errorMessages = new Array();
    }
    /**
     * Retrieves the error messages of the entity.
     */
    get errorMessages() {
        return this._errorMessages;
    }
    /**
     * Sets the error messages of the entity.
     */
    set errorMessages(value) {
        this._errorMessages = value;
    }
    /**
     * Checks if the entity is initialized.
     */
    get isInitialized() {
        return !!this.name && !!this.id;
    }
    /**
     * Checks if the entity is valid.
     * An entity is considered valid if it is initialized and has no error messages.
     */
    get isValid() {
        return this.isInitialized && !this.errorMessages.length;
    }
    /**
     * Checks if the entity has errors.
     */
    get hasErrors() {
        var _a;
        return ((_a = this.errorMessages) === null || _a === void 0 ? void 0 : _a.length) > 0;
    }
    /**
     * Initializes the entity.
     * This method should be overridden in derived classes.
     */
    init() {
        // Override in derived classes
    }
}
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], DescribeBase.prototype, "_errorMessages", void 0);
exports.DescribeBase = DescribeBase;
/* #endregion */
/* #region Metadata Describe Models */
/**
 * Represents a class for describing a specific field.
 * @extends {DescribeBase}
 */
class SFieldDescribe extends DescribeBase {
    constructor(init) {
        super();
        /**
         * The type of the field.
         */
        this.type = "";
        /**
         * Indicates whether the field can be updated.
         */
        this.updateable = false;
        /**
         * Indicates whether the field can be created.
         */
        this.creatable = false;
        /**
         * Indicates whether the field supports cascade delete.
         */
        this.cascadeDelete = false;
        /**
         * Indicates whether the field is an auto number field.
         */
        this.autoNumber = false;
        /**
         * Indicates whether the field is unique.
         */
        this.unique = false;
        /**
         * Indicates whether the field is a name field.
         */
        this.nameField = false;
        /**
         * Indicates whether the field is custom.
         */
        this.custom = false;
        /**
         * Indicates whether the field is a calculated field.
         */
        this.calculated = false;
        /**
         * Indicates whether the field is a name pointing field.
         */
        this.namePointing = false;
        /**
         * Indicates whether the field is a lookup field.
         */
        this.lookup = false;
        /**
         * The object type being referenced by the field.
         */
        this.referencedObjectType = "";
        /**
         * The polymorphic object type being referenced by the field.
         */
        this.polymorphicReferenceObjectType = "";
        /**
         * The objects being referenced by the field.
         */
        this.referenceTo = new Array();
        // -------------------------------------------------------------------------
        /**
         * The object name associated with the field.
         */
        this.objectName = "";
        /**
         * The group associated with the field.
         */
        this.group = "";
        /** Indicates whether the field is a multi-select keyword */
        this.isMultiSelect = false;
        if (init) {
            Object.assign(this, init);
        }
    }
    /**
     * Checks if the field is a master-detail relationship.
     */
    get isMasterDetail() {
        return this.lookup && (!this.updateable || this.cascadeDelete);
    }
    /**
     * Checks if the field is a formula field.
     */
    get isFormula() {
        return this.calculated;
    }
    /**
     * Checks if the field is read-only.
     */
    get readonly() {
        return !(this.creatable && !this.isFormula && !this.autoNumber);
    }
    /**
     * Checks if the field represents a person.
     */
    get person() {
        return this.name.endsWith('__pc')
            || this.name.startsWith('Person') && !this.custom;
    }
    /**
     * Checks if the field is polymorphic.
     */
    get isPolymorphic() {
        return this.namePointing
            && this.referenceTo
            && this.referenceTo.length > 0
            && common_1.CONSTANTS.SFDMU.FIELDS_IGNORE_POLYMORPHIC.indexOf(this.name) < 0;
    }
    /**
     * Checks if the field can be used as an external ID.
     */
    get canBeExternalId() {
        return this.isFormula
            || this.nameField
            || this.name == "Id"
            || !this.readonly && !this.lookup;
    }
    /**
     * Checks if the field is a standard field.
     */
    get standard() {
        return !this.custom;
    }
    /**
     * Checks if the field has been described.
     */
    get isDescribed() {
        return !!this.type;
    }
    /**
     * Checks if the field is valid.
     * A field is considered valid if it is described and its base entity is valid.
     */
    get isValid() {
        return super.isValid && this.isDescribed;
    }
}
exports.SFieldDescribe = SFieldDescribe;
/**
 * Represents a class for describing a specific object.
 * @extends {DescribeBase}
 */
class SObjectDescribe extends DescribeBase {
    constructor(init) {
        super();
        /**
         * Indicates whether the object can be updated.
         */
        this.updateable = false;
        /**
         * Indicates whether the object can be created.
         */
        this.creatable = false;
        /**
         * Indicates whether the object can be deleted.
         */
        this.deleteable = false;
        /**
         * Indicates whether the object is custom.
         */
        this.custom = false;
        /**
         * The key prefix of the object.
         */
        this.keyPrefix = "";
        /**
         * A map of field names to field describes for the object.
         */
        this.fieldsMap = new Map();
        if (init) {
            Object.assign(this, init);
        }
    }
    // -------------------------------------------------------------------------
    clone(cloneFrom) {
        Object.assign(this, {
            id: utils_1.CommonUtils.randomString(),
            name: cloneFrom.name,
            label: cloneFrom.label,
            keyPrefix: cloneFrom.keyPrefix,
            custom: cloneFrom.custom,
            creatable: cloneFrom.creatable,
            updateable: cloneFrom.updateable,
            deleteable: cloneFrom.deleteable,
            dataSource: cloneFrom.dataSource
        });
        return this;
    }
    set(setFrom) {
        Object.assign(this, setFrom);
        return this;
    }
    /**
     * Checks if the object is read-only.
     */
    get readonly() {
        return !(this.updateable && this.creatable && this.deleteable
            || this.name == 'RecordType'
            || this.name == 'ContentVersion'
            || this.name == 'ServiceResource');
    }
    /**
     * Checks if the object has been described.
     */
    get isDescribed() {
        var _a;
        return !!((_a = this.fieldsMap) === null || _a === void 0 ? void 0 : _a.size);
    }
    get isValid() {
        return super.isInitialized && this.isDescribed && !this.hasErrors;
    }
}
exports.SObjectDescribe = SObjectDescribe;
/**
 * Represents a class for describing a Salesforce organization.
 * @extends {DescribeBase}
 */
class OrgDescribe extends DescribeBase {
    constructor(init) {
        super();
        /**
         * A map of object names to object describes for the organization.
         */
        this.objectsMap = new Map();
        if (init) {
            Object.assign(this, init);
        }
    }
    // -------------------------------------------------------------------------
    /**
     * Checks if the organization is fully described.
     */
    get isDescribed() {
        var _a;
        return !!((_a = this.objectsMap) === null || _a === void 0 ? void 0 : _a.size);
    }
    get isInitialized() {
        return !!this.id;
    }
    get isValid() {
        return this.isInitialized && this.isDescribed;
    }
}
exports.OrgDescribe = OrgDescribe;
/* #endregion */
/* #region SFDMU export.json Models */
/**
 * Represents an export.json configuration file.
 * @extends {ScriptEntityBase}
 */
class Script extends ScriptEntityBase {
    constructor(init) {
        super();
        /**
         * An array of script organizations.
         */
        this.orgs = new Array();
        /**
         * An array of script objects.
         */
        this.objects = new Array();
        /**
         * An array of excluded objects.
         */
        this.excludedObjects = new Array();
        /**
         * An array of script object sets.
         */
        this.objectSets = new Array();
        /**
         * The polling interval in milliseconds.
         */
        this.pollingIntervalMs = common_1.CONSTANTS.SFDMU.DEFAULT_POLLING_INTERVAL_MS;
        /**
         * The concurrency mode of the script.
         */
        this.concurrencyMode = common_1.CONSTANTS.SFDMU.DEFAULT_BULK_API_CONCURRENCY_MODE;
        /**
         * The bulk threshold for Bulk API.
         */
        this.bulkThreshold = common_1.CONSTANTS.SFDMU.DEFAULT_BULK_API_THRESHOLD_RECORDS;
        /** Bulk API batch size */
        this.bulkApiV1BatchSize = 9500;
        /** Rest API batch size */
        this.restApiBatchSize = 9500;
        /** All or none. Breaks the batch if there is an error */
        this.allOrNone = false;
        /**
         * Indicates whether to prompt for missing parent objects.
         */
        this.promptOnMissingParentObjects = true;
        /**
         * Indicates whether to prompt for issues in CSV files.
         */
        this.promptOnIssuesInCSVFiles = true;
        /** Indicates whether to validate CSV files only and not to proceed with the execution */
        this.validateCSVFilesOnly = false;
        /**
         * Whether to use separated csv file sources for each object set.
         */
        this.useSeparatedCSVFiles = false;
        /**
         * The API version to use.
         */
        this.apiVersion = common_1.CONSTANTS.SFDMU.DEFAULT_API_VERSION;
        /**
         * Indicates whether to create target CSV files.
         */
        this.createTargetCSVFiles = true;
        /**
         * Indicates whether to create target CSV files.
         */
        this.importCSVFilesAsIs = false;
        /**
         * Indicates whether to always use the REST API to update records.
         */
        this.alwaysUseRestApiToUpdateRecords = false;
        /**
         * Indicates whether to exclude IDs from CSV files.
         */
        this.excludeIdsFromCSVFiles = false;
        /**
         * Indicates whether to keep the object order while executing.
         */
        this.keepObjectOrderWhileExecute = false;
        /**
         * Indicates whether to allow field truncation.
         */
        this.allowFieldTruncation = false;
        /**
         * Indicates whether the script is running in simulation mode.
         */
        this.simulationMode = false;
        /**
         * The delimiter used when reading CSV files.
         */
        this.csvReadFileDelimiter = common_1.CONSTANTS.SFDMU.DEFAULT_CSV_FILE_DELIMITER;
        /**
         * The delimiter used when writing CSV files.
         */
        this.csvWriteFileDelimiter = common_1.CONSTANTS.SFDMU.DEFAULT_CSV_FILE_DELIMITER;
        /**
         * The type of binary data cache.
         */
        this.binaryDataCache = common_1.DataCacheTypes.InMemory;
        /**
         * The type of source records cache.
         */
        this.sourceRecordsCache = common_1.DataCacheTypes.InMemory;
        /**
         * The number of parallel binary downloads.
         */
        this.parallelBinaryDownloads = common_1.CONSTANTS.SFDMU.DEFAULT_MAX_PARALLEL_BLOB_DOWNLOADS;
        /**
         * The number of parallel Bulk API jobs.
         */
        this.parallelBulkJobs = 1;
        /**
         * The number of parallel REST API jobs.
         */
        this.parallelRestJobs = 1;
        /**
         * The timeout for polling queries in milliseconds.
         */
        this.pollingQueryTimeoutMs = common_1.CONSTANTS.SFDMU.DEFAULT_POLLING_QUERY_TIMEOUT_MS;
        /**
         * The query threshold for using Bulk API.
         */
        this.queryBulkApiThreshold = common_1.CONSTANTS.SFDMU.QUERY_BULK_API_THRESHOLD;
        if (init) {
            Object.assign(this, init);
        }
    }
    // -------------------------------------------------------------------------
    /**
     * Initializes the script object.
     */
    init() {
        utils_1.CommonUtils.initializeObject(this, Script, {
            id: this.id || utils_1.CommonUtils.randomString()
        });
        this.orgs.forEach(org => {
            org.init();
        });
        if (this.objects.length) {
            this.objectSets.unshift(new ScriptObjectSet({
                objects: this.objects
            }));
            this.objects = new Array();
        }
        this.objectSets.forEach(objectSet => {
            objectSet.init();
        });
    }
    resetId() {
        this.id = utils_1.CommonUtils.randomString();
        this.objectSets.forEach(objectSet => {
            objectSet.resetId();
        });
    }
}
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['export+orgs'] }),
    (0, class_transformer_1.Type)(() => ScriptOrg),
    __metadata("design:type", Object)
], Script.prototype, "orgs", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => ScriptObject),
    __metadata("design:type", Object)
], Script.prototype, "objects", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)([]),
    __metadata("design:type", Object)
], Script.prototype, "excludedObjects", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => ScriptObjectSet),
    (0, common_1.ExcludeIfDefault)([]),
    __metadata("design:type", Object)
], Script.prototype, "objectSets", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_POLLING_INTERVAL_MS),
    __metadata("design:type", Number)
], Script.prototype, "pollingIntervalMs", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_BULK_API_CONCURRENCY_MODE),
    __metadata("design:type", String)
], Script.prototype, "concurrencyMode", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_BULK_API_THRESHOLD_RECORDS),
    __metadata("design:type", Number)
], Script.prototype, "bulkThreshold", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(9500),
    __metadata("design:type", Object)
], Script.prototype, "bulkApiV1BatchSize", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(9500),
    __metadata("design:type", Object)
], Script.prototype, "restApiBatchSize", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_BULK_API_VERSION),
    __metadata("design:type", String)
], Script.prototype, "bulkApiVersion", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "allOrNone", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(true),
    __metadata("design:type", Object)
], Script.prototype, "promptOnMissingParentObjects", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(true),
    __metadata("design:type", Object)
], Script.prototype, "promptOnIssuesInCSVFiles", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "validateCSVFilesOnly", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "useSeparatedCSVFiles", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_API_VERSION),
    __metadata("design:type", String)
], Script.prototype, "apiVersion", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(true),
    __metadata("design:type", Object)
], Script.prototype, "createTargetCSVFiles", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "importCSVFilesAsIs", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "alwaysUseRestApiToUpdateRecords", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "excludeIdsFromCSVFiles", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "keepObjectOrderWhileExecute", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "allowFieldTruncation", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], Script.prototype, "simulationMode", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_CSV_FILE_DELIMITER),
    __metadata("design:type", String)
], Script.prototype, "csvReadFileDelimiter", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_CSV_FILE_DELIMITER),
    __metadata("design:type", String)
], Script.prototype, "csvWriteFileDelimiter", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.DataCacheTypes.InMemory),
    __metadata("design:type", Object)
], Script.prototype, "binaryDataCache", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.DataCacheTypes.InMemory),
    __metadata("design:type", String)
], Script.prototype, "sourceRecordsCache", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_MAX_PARALLEL_BLOB_DOWNLOADS),
    __metadata("design:type", Object)
], Script.prototype, "parallelBinaryDownloads", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(1),
    __metadata("design:type", Object)
], Script.prototype, "parallelBulkJobs", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(1),
    __metadata("design:type", Object)
], Script.prototype, "parallelRestJobs", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.DEFAULT_POLLING_QUERY_TIMEOUT_MS),
    __metadata("design:type", Number)
], Script.prototype, "pollingQueryTimeoutMs", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.QUERY_BULK_API_THRESHOLD),
    __metadata("design:type", Number)
], Script.prototype, "queryBulkApiThreshold", void 0);
exports.Script = Script;
/**
 * Represents an object set entity from the export.json configuration file.
 * @extends {ScriptEntityBase}
 */
class ScriptObjectSet extends ScriptEntityBase {
    constructor(init) {
        super();
        /**
         * An array of script objects.
         */
        this.objects = new Array();
        // -------------------------------------------------------------------------
        /**
         * The name of the script object set.
         */
        this.name = common_1.CONSTANTS.SFDMU.DEFAULT_ENTITY_NAME;
        if (init) {
            Object.assign(this, init);
        }
    }
    /**
     * Initializes the script object set.
     */
    init() {
        utils_1.CommonUtils.initializeObject(this, ScriptObjectSet, {
            id: this.id || utils_1.CommonUtils.randomString()
        });
        this.objects.forEach(object => {
            object.init();
        });
    }
    resetId() {
        this.id = utils_1.CommonUtils.randomString();
        this.objects.forEach(object => {
            object.resetId();
        });
    }
}
__decorate([
    (0, class_transformer_1.Type)(() => ScriptObject),
    __metadata("design:type", Object)
], ScriptObjectSet.prototype, "objects", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", Object)
], ScriptObjectSet.prototype, "name", void 0);
exports.ScriptObjectSet = ScriptObjectSet;
/**
 * Represents a script object entity from the array of object sets
 * in the export.json configuration file.
 * @extends {ScriptEntityBase}
 */
class ScriptObject extends ScriptEntityBase {
    constructor(init) {
        super();
        /**
         * An array of script mock fields.
         */
        this.mockFields = new Array();
        /**
         * An array of script mapping items.
         */
        this.fieldMapping = new Array();
        /**
         * The query string for the script object.
         */
        this.query = "";
        /**
         * The delete query for the script object.
         */
        this.deleteQuery = "";
        /**
         * The operation type for the script object.
         */
        this.operation = common_1.Operation.Readonly;
        /**
         * Indicates whether to delete old data for the script object.
         */
        this.deleteOldData = false;
        /**
         * Indicates whether to delete records from the source for the script object.
         */
        this.deleteFromSource = false;
        /**
         * Indicates whether to delete records by hierarchy for the script object.
         */
        this.deleteByHierarchy = false;
        /**
         * Indicates whether to perform hard delete for the script object.
         */
        this.hardDelete = false;
        /**
         * Indicates whether to update with mock data for the script object.
         */
        this.updateWithMockData = false;
        /**
         * Indicates whether to use source CSV file for the script object.
         */
        this.useSourceCSVFile = false;
        /**
         * The target records filter for the script object.
         */
        this.targetRecordsFilter = "";
        /**
         * Indicates whether the script object is excluded.
         */
        this.excluded = false;
        /**
         * Indicates whether to use values mapping for the script object defined in the csv file.
         */
        this.useCSVValuesMapping = false;
        /**
         * Indicates whether to use field mapping for the script object.
         */
        this.useFieldMapping = false;
        /**
         * Indicates whether the script object is a master record.
         */
        this.master = true;
        /**
         * An array of excluded fields for the script object.
         */
        this.excludedFields = new Array();
        /**
         * An array of fields excluded from update for the script object.
         */
        this.excludedFromUpdateFields = new Array();
        /**
         * The batch size for Bulk API v1 for the script object.
         */
        this.bulkApiV1BatchSize = common_1.CONSTANTS.SFDMU.BULK_API_V1_DEFAULT_BATCH_SIZE;
        /**
         * The batch size for REST API for the script object.
         */
        this.restApiBatchSize = common_1.CONSTANTS.SFDMU.REST_API_DEFAULT_BATCH_SIZE;
        /**
         * Indicates whether to use queryAll for the script object.
         */
        this.useQueryAll = false;
        /**
         * Indicates whether the queryAll target is enabled for the script object.
         */
        this.queryAllTarget = false;
        /**
         * Indicates whether to skip existing records for the script object.
         */
        this.skipExistingRecords = false;
        /**
         * The number of parallel Bulk API jobs for the script object.
         */
        this.parallelBulkJobs = 1;
        /**
         * The number of parallel REST API jobs for the script object.
         */
        this.parallelRestJobs = 1;
        //-------------------------------------------------------------------------
        /**
         * The WHERE clause of the query.
         */
        this.where = "";
        /**
         * The ORDER BY clause of the query.
         */
        this.orderBy = "";
        /**
         * The LIMIT clause of the query.
         */
        this.limit = 0;
        /**
         * The OFFSET clause of the query.
         */
        this.offset = 0;
        /**
         * The fields of the query.
         */
        this.fields = [];
        /**
         * The name of the sObject for the script object.
         */
        this.name = "";
        /**
         * Indicates whether describing the script object in the source org failed.
         */
        this.failedToDescribeInSourceOrg = false;
        /**
         * Indicates whether describing the script object in the target org failed.
         */
        this.failedToDescribeInTargetOrg = false;
        /**
         * Represents polymorphic fields for the script object.
         */
        this.polymorphicFields = new Array();
        if (init) {
            Object.assign(this, init);
        }
    }
    get externalId() {
        return this._externalId || this.defaultExternalId;
    }
    set externalId(value) {
        this._externalId = value;
    }
    /**
     * The WHERE clause of the delete query.
     */
    get deleteQueryWhere() {
        return ((this.deleteQuery || '').split("WHERE")[1] || '').trim();
    }
    set deleteQueryWhere(value) {
        this.deleteQuery = value ? `SELECT Id FROM ${this.name} WHERE ${value}` : '';
    }
    /**
     * Initializes the script object.
     */
    init() {
        utils_1.CommonUtils.initializeObject(this, ScriptObject, {
            id: this.id || utils_1.CommonUtils.randomString()
        });
        if (!this.fields.length) {
            const parsed = utils_1.SfdmuUtils.parseSoql(this.query);
            this.fields = parsed.fields;
            this.name = parsed.objectName;
            this.where = parsed.where;
            this.orderBy = parsed.orderBy;
            this.limit = parsed.limit;
            this.offset = parsed.offset;
            utils_1.SfdmuUtils.setSOQLFields(this);
        }
        this.mockFields.forEach(mockField => {
            mockField.init();
        });
        this.fieldMapping.forEach(fieldMapping => {
            fieldMapping.init();
        });
    }
    resetId() {
        this.id = utils_1.CommonUtils.randomString();
        this.mockFields.forEach(mockField => {
            mockField.resetId();
        });
        this.fieldMapping.forEach(fieldMapping => {
            fieldMapping.resetId();
        });
    }
    /**
     *  Clones the script object.
     * @returns  {ScriptObject} The cloned script object.
     */
    clone() {
        return utils_1.CommonUtils.clone(this);
    }
    /**
     * Modified the poplymorphic fields in the soql query according to the SFDMU convention.
     */
    includePolymorphicFields() {
        //  Modify each field to include polymorphic fields $ in the fields list
        const fields = this.fields.map(field => {
            const pf = this.polymorphicFields.find(pf => pf.name == field);
            if (pf) {
                return `${field}$${pf.objectName}`;
            }
            return field;
        });
        // Modify the soql query to include polymorphic fields
        utils_1.SfdmuUtils.setSOQLFields(this, fields);
    }
    extractPolymorphicFields() {
        // Extract polymorphic fields
        this.polymorphicFields = this.fields
            .filter(field => field.includes('$'))
            .map(field => {
            const [name, objectName] = field.split('$');
            return new PolymorphicField({
                name,
                objectName
            });
        });
        // Modify each field to exclude polymorphic fields $ from the fields list
        const fields = this.fields.map(field => {
            if (field.includes('$')) {
                return field.split('$')[0];
            }
            return field;
        });
        // Modify the soql query to exclude polymorphic fields
        utils_1.SfdmuUtils.setSOQLFields(this, fields);
    }
    /**
     * Returns True if the external id is already set
     * and False if the external id should be set after this object is described for the first time.
     */
    get isExternalIdSet() {
        return !!this._externalId;
    }
    /**
     * Returns the target sObject if field mapping is used.
     */
    get targetObject() {
        var _a;
        return ((_a = this.fieldMapping.find(fm => !!fm.targetObject)) === null || _a === void 0 ? void 0 : _a.targetObject) || this.name;
    }
    /**
     * Returns the mapping between source and target fields when field mapping is used.
     */
    get targetFields() {
        const targetFields = new Map();
        this.fieldMapping.forEach(fm => {
            if (fm.targetField) {
                targetFields.set(fm.sourceField, fm);
            }
        });
        return targetFields;
    }
    /**
     * Whether the script object has field mapping.
     */
    get hasFieldMapping() {
        return this.fieldMapping.length > 0;
    }
}
__decorate([
    (0, common_1.ExcludeIfDefault)([]),
    (0, class_transformer_1.Type)(() => ScriptMockField),
    __metadata("design:type", Object)
], ScriptObject.prototype, "mockFields", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)([]),
    (0, class_transformer_1.Type)(() => ScriptMappingItem),
    __metadata("design:type", Object)
], ScriptObject.prototype, "fieldMapping", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptObject.prototype, "query", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptObject.prototype, "deleteQuery", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.Operation.Readonly),
    __metadata("design:type", String)
], ScriptObject.prototype, "operation", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", String)
], ScriptObject.prototype, "_externalId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, common_1.ExcludeIfDefault)("Id"),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], ScriptObject.prototype, "externalId", null);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "deleteOldData", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "deleteFromSource", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "deleteByHierarchy", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "hardDelete", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "updateWithMockData", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "useSourceCSVFile", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptObject.prototype, "targetRecordsFilter", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "excluded", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "useCSVValuesMapping", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Boolean)
], ScriptObject.prototype, "useValuesMapping", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "useFieldMapping", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(true),
    __metadata("design:type", Object)
], ScriptObject.prototype, "master", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)([]),
    __metadata("design:type", Object)
], ScriptObject.prototype, "excludedFields", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)([]),
    __metadata("design:type", Object)
], ScriptObject.prototype, "excludedFromUpdateFields", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.BULK_API_V1_DEFAULT_BATCH_SIZE),
    __metadata("design:type", Object)
], ScriptObject.prototype, "bulkApiV1BatchSize", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.CONSTANTS.SFDMU.REST_API_DEFAULT_BATCH_SIZE),
    __metadata("design:type", Object)
], ScriptObject.prototype, "restApiBatchSize", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "useQueryAll", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "queryAllTarget", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(false),
    __metadata("design:type", Object)
], ScriptObject.prototype, "skipExistingRecords", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(1),
    __metadata("design:type", Object)
], ScriptObject.prototype, "parallelBulkJobs", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(1),
    __metadata("design:type", Object)
], ScriptObject.prototype, "parallelRestJobs", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", Object)
], ScriptObject.prototype, "where", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", Object)
], ScriptObject.prototype, "orderBy", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", Object)
], ScriptObject.prototype, "limit", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", Object)
], ScriptObject.prototype, "offset", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", Array)
], ScriptObject.prototype, "fields", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", Object)
], ScriptObject.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", String)
], ScriptObject.prototype, "defaultExternalId", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], ScriptObject.prototype, "failedToDescribeInSourceOrg", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], ScriptObject.prototype, "failedToDescribeInTargetOrg", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => PolymorphicField),
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    __metadata("design:type", Object)
], ScriptObject.prototype, "polymorphicFields", void 0);
exports.ScriptObject = ScriptObject;
/**
 * Represents a polymorphic field entity wihin the ScriptObject.
 */
class PolymorphicField extends ScriptEntityBase {
    constructor(init) {
        super();
        /**
         * The name of the polymorphic field.
         */
        this.name = "";
        /**
         * The object type being referenced by the polymorphic field.
         */
        this.objectName = "";
        if (init) {
            Object.assign(this, init);
        }
    }
}
exports.PolymorphicField = PolymorphicField;
/**
 * Represents a script organization entity from the array of orgs
 * in the export.json configuration file.
 * @extends {ScriptEntityBase}
 */
class ScriptOrg extends ScriptEntityBase {
    constructor(init) {
        super();
        /**
         * The name of the organization.
         */
        this.name = "";
        /**
         * The instance URL of the organization.
         */
        this.instanceUrl = "";
        /**
         * The access token of the organization.
         */
        this.accessToken = "";
        //-------------------------------------------------------------------------
        /**
         * The username of the organization.
         */
        this.orgUserName = "";
        if (init) {
            Object.assign(this, init);
        }
    }
    init() {
        utils_1.CommonUtils.initializeObject(this, ScriptOrg, {
            id: this.id || utils_1.CommonUtils.randomString()
        });
    }
}
__decorate([
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptOrg.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['export+orgs'] }),
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptOrg.prototype, "instanceUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['export+orgs'] }),
    __metadata("design:type", Object)
], ScriptOrg.prototype, "accessToken", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ groups: ['db'] }),
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptOrg.prototype, "orgUserName", void 0);
exports.ScriptOrg = ScriptOrg;
/**
 * Represents a field mapping item entity in the export.json configuration file.
 * @extends {ScriptEntityBase}
 */
class ScriptMappingItem extends ScriptEntityBase {
    constructor(init) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }
    init() {
        utils_1.CommonUtils.initializeObject(this, ScriptMappingItem, {
            id: this.id || utils_1.CommonUtils.randomString()
        });
    }
    resetId() {
        this.id = utils_1.CommonUtils.randomString();
    }
}
__decorate([
    (0, common_1.ExcludeIfDefault)(null),
    __metadata("design:type", String)
], ScriptMappingItem.prototype, "targetObject", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(null),
    __metadata("design:type", String)
], ScriptMappingItem.prototype, "sourceField", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(null),
    __metadata("design:type", String)
], ScriptMappingItem.prototype, "targetField", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], ScriptMappingItem.prototype, "id", void 0);
exports.ScriptMappingItem = ScriptMappingItem;
/**
 * Represents a script mock field entity in the export.json configuration file
 *  used for data anonymization.
 * @extends {ScriptEntityBase}
 */
class ScriptMockField extends ScriptEntityBase {
    constructor(init) {
        super();
        /**
         * The name of the mock field.
         */
        this.name = "";
        /**
         * The pattern of the mock field.
         */
        this.pattern = "";
        /**
         * The excluded regex pattern for the mock field.
         */
        this.excludedRegex = "";
        /**
         * The included regex pattern for the mock field.
         */
        this.includedRegex = "";
        /**
         * An array of names to exclude for the mock field.
         */
        this.excludeNames = new Array();
        if (init) {
            Object.assign(this, init);
        }
    }
    init() {
        utils_1.CommonUtils.initializeObject(this, ScriptMockField, {
            id: this.id || utils_1.CommonUtils.randomString()
        });
    }
    resetId() {
        this.id = utils_1.CommonUtils.randomString();
    }
}
__decorate([
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptMockField.prototype, "name", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptMockField.prototype, "pattern", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptMockField.prototype, "excludedRegex", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)(""),
    __metadata("design:type", Object)
], ScriptMockField.prototype, "includedRegex", void 0);
__decorate([
    (0, common_1.ExcludeIfDefault)([]),
    __metadata("design:type", Object)
], ScriptMockField.prototype, "excludeNames", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], ScriptMockField.prototype, "id", void 0);
exports.ScriptMockField = ScriptMockField;
/* #endregion */
/* #region JSForce Connection */
/**
 * Represents a JSForce connection with extended properties.
 */
class JSforceConnection extends jsforce.Connection {
    constructor(connection) {
        if (connection) {
            if (connection instanceof database_models_1.Connection) {
                super({
                    accessToken: connection.accessToken,
                    instanceUrl: connection.instanceUrl,
                    version: connection.apiVersion,
                });
            }
            else {
                super({
                    accessToken: connection.accessToken,
                    instanceUrl: connection.instanceUrl,
                    version: common_1.CONSTANTS.SFDMU.DEFAULT_API_VERSION,
                });
            }
            if (connection instanceof JSforceConnection
                || connection instanceof database_models_1.Connection) {
                Object.assign(this, {
                    userName: connection.userName
                });
            }
        }
    }
}
exports.JSforceConnection = JSforceConnection;
/**
 * Represents an organization.
 */
class ForceOrg {
    constructor() {
        /**
         * Indicates whether the organization is a scratch org.
         */
        this.isScratchOrg = false;
    }
    /**
     * Indicates whether the organization is connected.
     */
    get isConnected() {
        return this.connectedStatus == "Connected";
    }
}
exports.ForceOrg = ForceOrg;
/* #endregion */
/* #region force:org:display command */
/**
 * Represents the result of the force:org:display command.
 */
class ForceOrgDisplayResult {
    constructor(init) {
        if (init) {
            Object.assign(this, init);
        }
    }
    /**
     * Indicates whether the organization is connected.
     */
    get isConnected() {
        return this.connectedStatus == "Connected" || this.status == "Active";
    }
}
exports.ForceOrgDisplayResult = ForceOrgDisplayResult;
/* #endregion */
//# sourceMappingURL=sfdmu-models.js.map