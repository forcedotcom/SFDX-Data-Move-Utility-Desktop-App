// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Exclude, Expose, Type } from "class-transformer";
import * as jsforce from "jsforce";
import 'reflect-metadata';
import { IEntityBase, StatusCode } from "./common.models";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CONSTANTS, DataCacheTypes, DataSource, ExcludeIfDefault, Operation } from "../common";
import { CommonUtils, SfdmuUtils } from "../utils";
import { Connection } from "./database-models";


/* #region Base Classes */
/**
 * Represents a base abstract class for script entities.
 * @implements {IEntityBase}
 */
export abstract class ScriptEntityBase implements IEntityBase {

    /**
     * The unique identifier of the entity.
     */
    @Expose({ groups: ['db'] })
    id: string;

    /**
     * An array of error messages associated with the entity.
     */
    @Exclude()
    protected _errorMessages = new Array<string>();

    /**
     * Retrieves the error messages of the entity.
     */
    public get errorMessages() {
        return this._errorMessages;
    }

    /**
     * Sets the error messages of the entity.
     */
    public set errorMessages(value) {
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
    init(): void {
        // Override in derived classes
    }
}

/**
 * Represents a base abstract class for describing entities.
 * @implements {IEntityBase}
 */
export abstract class DescribeBase implements IEntityBase {

    /**
     * The unique identifier of the entity.
     */
    id = "";

    /**
     * The name of the entity.
     */
    name = "";

    /**
     * The label of the entity.
     */
    label = "";

    /**
     * The data source of the entity.
     */
    dataSource: DataSource = DataSource.unknown;

    /**
     * An array of error messages associated with the entity.
     */
    @Exclude()
    private _errorMessages = new Array<string>();

    /**
     * Retrieves the error messages of the entity.
     */
    public get errorMessages() {
        return this._errorMessages;
    }

    /**
     * Sets the error messages of the entity.
     */
    public set errorMessages(value) {
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
    get isValid(): boolean {
        return this.isInitialized && !this.errorMessages.length;
    }

    /**
     * Checks if the entity has errors.
     */
    get hasErrors(): boolean {
        return this.errorMessages?.length > 0;
    }

    /**
     * Initializes the entity.
     * This method should be overridden in derived classes.
     */
    init(): void {
        // Override in derived classes
    }
}

/* #endregion */


/* #region Metadata Describe Models */
/**
 * Represents a class for describing a specific field.
 * @extends {DescribeBase}
 */
export class SFieldDescribe extends DescribeBase {

    constructor(init: Partial<SFieldDescribe>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * The type of the field.
     */
    type = "";

    /**
     * Indicates whether the field can be updated.
     */
    updateable = false;

    /**
     * Indicates whether the field can be created.
     */
    creatable = false;

    /**
     * Indicates whether the field supports cascade delete.
     */
    cascadeDelete = false;

    /**
     * Indicates whether the field is an auto number field.
     */
    autoNumber = false;

    /**
     * Indicates whether the field is unique.
     */
    unique = false;

    /**
     * Indicates whether the field is a name field.
     */
    nameField = false;

    /**
     * Indicates whether the field is custom.
     */
    custom = false;

    /**
     * Indicates whether the field is a calculated field.
     */
    calculated = false;

    /**
     * Indicates whether the field is a name pointing field.
     */
    namePointing = false;

    /**
     * Indicates whether the field is a lookup field.
     */
    lookup = false;

    /**
     * The object type being referenced by the field.
     */
    referencedObjectType = "";

    /**
     * The polymorphic object type being referenced by the field.
     */
    polymorphicReferenceObjectType = "";

    /**
     * The objects being referenced by the field.
     */
    referenceTo: Array<string> = new Array<string>();



    // -------------------------------------------------------------------------
    /**
     * The object name associated with the field.
     */
    objectName = "";

    /**
     * The group associated with the field.
     */
    group = "";


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
            && CONSTANTS.SFDMU.FIELDS_IGNORE_POLYMORPHIC.indexOf(this.name) < 0;
    }

    /**
     * Checks if the field can be used as an external ID.
     */
    get canBeExternalId(): boolean {
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

    /** Indicates whether the field is a multi-select keyword */
    isMultiSelect = false;

    /**
     * Checks if the field has been described.
     */
    get isDescribed(): boolean {
        return !!this.type;
    }

    /**
     * Checks if the field is valid.
     * A field is considered valid if it is described and its base entity is valid.
     */
    get isValid(): boolean {
        return super.isValid && this.isDescribed;
    }
}

/**
 * Represents a class for describing a specific object.
 * @extends {DescribeBase}
 */
export class SObjectDescribe extends DescribeBase {

    constructor(init?: Partial<SObjectDescribe>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * Indicates whether the object can be updated.
     */
    updateable = false;

    /**
     * Indicates whether the object can be created.
     */
    creatable = false;

    /**
     * Indicates whether the object can be deleted.
     */
    deleteable = false;

    /**
     * Indicates whether the object is custom.
     */
    custom = false;

    /**
     * The key prefix of the object.
     */
    keyPrefix = "";


    // -------------------------------------------------------------------------
    clone(cloneFrom: SObjectDescribe) {
        Object.assign(this, {
            id: CommonUtils.randomString(),
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

    set(setFrom: Partial<SObjectDescribe>) {
        Object.assign(this, setFrom);
        return this;
    }


    /**
     * A map of field names to field describes for the object.
     */
    fieldsMap: Map<string, SFieldDescribe> = new Map<string, SFieldDescribe>();

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
        return !!this.fieldsMap?.size;
    }

    get isValid(): boolean {
        return super.isInitialized && this.isDescribed && !this.hasErrors;
    }

}

/**
 * Represents a class for describing a Salesforce organization.
 * @extends {DescribeBase}
 */
export class OrgDescribe extends DescribeBase {

    constructor(init?: Partial<OrgDescribe>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * A map of object names to object describes for the organization.
     */
    objectsMap = new Map<string, SObjectDescribe>();


    // -------------------------------------------------------------------------
    /**
     * Checks if the organization is fully described.
     */
    get isDescribed(): boolean {
        return !!this.objectsMap?.size;
    }

    get isInitialized(): boolean {
        return !!this.id;
    }

    get isValid(): boolean {
        return this.isInitialized && this.isDescribed;
    }
}

/* #endregion */


/* #region SFDMU export.json Models */
/**
 * Represents an export.json configuration file.
 * @extends {ScriptEntityBase}
 */
export class Script extends ScriptEntityBase {
    constructor(init?: Partial<Script>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * An array of script organizations.
     */
    @Expose({ groups: ['export+orgs'] })
    @Type(() => ScriptOrg)
    orgs = new Array<ScriptOrg>();

    /**
     * An array of script objects.
     */
    @Type(() => ScriptObject)
    objects = new Array<ScriptObject>();

    /**
     * An array of excluded objects.
     */
    @ExcludeIfDefault([])
    excludedObjects = new Array<string>();

    /**
     * An array of script object sets.
     */
    @Type(() => ScriptObjectSet)
    @ExcludeIfDefault([])
    objectSets = new Array<ScriptObjectSet>();

    /**
     * The polling interval in milliseconds.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_POLLING_INTERVAL_MS)
    pollingIntervalMs: number = CONSTANTS.SFDMU.DEFAULT_POLLING_INTERVAL_MS;

    /**
     * The concurrency mode of the script.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_BULK_API_CONCURRENCY_MODE)
    concurrencyMode: ConcurrencyMode = CONSTANTS.SFDMU.DEFAULT_BULK_API_CONCURRENCY_MODE as any;

    /**
     * The bulk threshold for Bulk API.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_BULK_API_THRESHOLD_RECORDS)
    bulkThreshold: number = CONSTANTS.SFDMU.DEFAULT_BULK_API_THRESHOLD_RECORDS;

    /** Bulk API batch size */
    @ExcludeIfDefault(9500)
    bulkApiV1BatchSize = 9500

    /** Rest API batch size */
    @ExcludeIfDefault(9500)
    restApiBatchSize = 9500;

    /** Bulk API version */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_BULK_API_VERSION)
    bulkApiVersion: string;

    /** All or none. Breaks the batch if there is an error */
    @ExcludeIfDefault(false)
    allOrNone = false;

    /**
     * Indicates whether to prompt for missing parent objects.
     */
    @ExcludeIfDefault(true)
    promptOnMissingParentObjects = true;

    /**
     * Indicates whether to prompt for issues in CSV files.
     */
    @ExcludeIfDefault(true)
    promptOnIssuesInCSVFiles = true;

    /** Indicates whether to validate CSV files only and not to proceed with the execution */
    @ExcludeIfDefault(false)
    validateCSVFilesOnly = false;

    /**
     * Whether to use separated csv file sources for each object set.
     */
    @ExcludeIfDefault(false)
    useSeparatedCSVFiles = false;

    /**
     * The API version to use.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_API_VERSION)
    apiVersion: string = CONSTANTS.SFDMU.DEFAULT_API_VERSION;

    /**
     * Indicates whether to create target CSV files.
     */
    @ExcludeIfDefault(true)
    createTargetCSVFiles = true;

    /**
     * Indicates whether to create target CSV files.
     */
    @ExcludeIfDefault(false)
    importCSVFilesAsIs = false;

    /**
     * Indicates whether to always use the REST API to update records.
     */
    @ExcludeIfDefault(false)
    alwaysUseRestApiToUpdateRecords = false;

    /**
     * Indicates whether to exclude IDs from CSV files.
     */
    @ExcludeIfDefault(false)
    excludeIdsFromCSVFiles = false;

    /**
     * Indicates whether to keep the object order while executing.
     */
    @ExcludeIfDefault(false)
    keepObjectOrderWhileExecute = false;

    /**
     * Indicates whether to allow field truncation.
     */
    @ExcludeIfDefault(false)
    allowFieldTruncation = false;

    /**
     * Indicates whether the script is running in simulation mode.
     */
    @ExcludeIfDefault(false)
    simulationMode = false;

    /**
     * The URL of the proxy server.
     */
    proxyUrl: string;

    /**
     * The delimiter used when reading CSV files.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_CSV_FILE_DELIMITER)
    csvReadFileDelimiter: ',' | ';' = CONSTANTS.SFDMU.DEFAULT_CSV_FILE_DELIMITER as any;

    /**
     * The delimiter used when writing CSV files.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_CSV_FILE_DELIMITER)
    csvWriteFileDelimiter: ',' | ';' = CONSTANTS.SFDMU.DEFAULT_CSV_FILE_DELIMITER as any;

    /**
     * The type of binary data cache.
     */
    @ExcludeIfDefault(DataCacheTypes.InMemory)
    binaryDataCache = DataCacheTypes.InMemory;

    /**
     * The type of source records cache.
     */
    @ExcludeIfDefault(DataCacheTypes.InMemory)
    sourceRecordsCache: DataCacheTypes = DataCacheTypes.InMemory;

    /**
     * The number of parallel binary downloads.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_MAX_PARALLEL_BLOB_DOWNLOADS)
    parallelBinaryDownloads = CONSTANTS.SFDMU.DEFAULT_MAX_PARALLEL_BLOB_DOWNLOADS;

    /**
     * The number of parallel Bulk API jobs.
     */
    @ExcludeIfDefault(1)
    parallelBulkJobs = 1;

    /**
     * The number of parallel REST API jobs.
     */
    @ExcludeIfDefault(1)
    parallelRestJobs = 1;

    /**
     * The timeout for polling queries in milliseconds.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.DEFAULT_POLLING_QUERY_TIMEOUT_MS)
    pollingQueryTimeoutMs: number = CONSTANTS.SFDMU.DEFAULT_POLLING_QUERY_TIMEOUT_MS;

    /**
     * The query threshold for using Bulk API.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.QUERY_BULK_API_THRESHOLD)
    queryBulkApiThreshold: number = CONSTANTS.SFDMU.QUERY_BULK_API_THRESHOLD;


    // Addons
    // TODO: UI for all addon definitions not implemented yet
    /**
     * Addon definitions which are executed before the script is executed.
     *
     * @type {any[]}
     * @memberof Script
     */
    @ExcludeIfDefault([])
    beforeAddons: any[] = [];

    /**
     * Addon definitions which are executed after the script is executed.
     *
     * @type {any[]}
     * @memberof Script
     */
    @ExcludeIfDefault([])
    afterAddons: any[] = [];


    /**
     * Addon definitions which are executed when the source org is queried for the first time.
     *
     * @type {any[]}
     * @memberof Script
     */
    @ExcludeIfDefault([])
    dataRetrievedAddons: any[] = [];

    // -------------------------------------------------------------------------
    /**
     * Initializes the script object.
     */
    init() {

        CommonUtils.initializeObject(this, Script, {
            id: this.id || CommonUtils.randomString()
        } as Script);

        this.orgs.forEach(org => {
            org.init();
        });

        if (this.objects.length) {
            this.objectSets.unshift(new ScriptObjectSet({
                objects: this.objects
            }));
            this.objects = new Array<ScriptObject>();
        }

        this.objectSets.forEach(objectSet => {
            objectSet.init();
        });

    }

    resetId() {
        this.id = CommonUtils.randomString();
        this.objectSets.forEach(objectSet => {
            objectSet.resetId();
        });
    }


}

/**
 * Represents an object set entity from the export.json configuration file.
 * @extends {ScriptEntityBase}
 */
export class ScriptObjectSet extends ScriptEntityBase {


    constructor(init?: Partial<ScriptObjectSet>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * An array of script objects.
     */
    @Type(() => ScriptObject)
    objects = new Array<ScriptObject>();


    // -------------------------------------------------------------------------
    /**
     * The name of the script object set.
     */
    @Expose({ groups: ['db'] })
    name = CONSTANTS.SFDMU.DEFAULT_ENTITY_NAME;

    /**
     * Initializes the script object set.
     */
    init(): void {

        CommonUtils.initializeObject(this, ScriptObjectSet, {
            id: this.id || CommonUtils.randomString()
        } as ScriptObjectSet);

        this.objects.forEach(object => {
            object.init();
        });
    }

    resetId() {
        this.id = CommonUtils.randomString();
        this.objects.forEach(object => {
            object.resetId();
        });
    }
}

/**
 * Represents a script object entity from the array of object sets
 * in the export.json configuration file.
 * @extends {ScriptEntityBase}
 */
export class ScriptObject extends ScriptEntityBase {

    constructor(init?: Partial<ScriptObject>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * An array of script mock fields.
     */
    @ExcludeIfDefault([])
    @Type(() => ScriptMockField)
    mockFields = new Array<ScriptMockField>();

    /**
     * An array of script mapping items.
     */
    @ExcludeIfDefault([])
    @Type(() => ScriptMappingItem)
    fieldMapping = new Array<ScriptMappingItem>();

    /**
     * The query string for the script object.
     */
    @ExcludeIfDefault("")
    query = "";

    /**
     * The delete query for the script object.
     */
    @ExcludeIfDefault("")
    deleteQuery = "";

    /**
     * The operation type for the script object.
     */
    @ExcludeIfDefault(Operation.Readonly)
    operation: Operation = Operation.Readonly;

    /**
     * The external ID for the script object.
     */
    @Expose({ groups: ['db'] })
    private _externalId: string;

    @Expose()
    @ExcludeIfDefault("Id")
    get externalId(): string {
        return this._externalId || this.defaultExternalId;
    }
    set externalId(value: string) {
        this._externalId = value.trimEnd(';');
    }

    /**
     * Indicates whether to delete old data for the script object.
     */
    @ExcludeIfDefault(false)
    deleteOldData = false;

    /**
     * Indicates whether to delete records from the source for the script object.
     */
    @ExcludeIfDefault(false)
    deleteFromSource = false;

    /**
     * Indicates whether to delete records by hierarchy for the script object.
     */
    @ExcludeIfDefault(false)
    deleteByHierarchy = false;

    /**
     * Indicates whether to perform hard delete for the script object.
     */
    @ExcludeIfDefault(false)
    hardDelete = false;

    /**
     * Indicates whether to update with mock data for the script object.
     */
    @ExcludeIfDefault(false)
    updateWithMockData = false;

    /**
     * Indicates whether to use source CSV file for the script object.
     */
    @ExcludeIfDefault(false)
    useSourceCSVFile = false;

    /**
     * Sets whether should skip records comparison for the script object to identify records to update.
     */
    @ExcludeIfDefault(false)
    skipRecordsComparison = false;

    /**
     * The target records filter for the script object.
     */
    @ExcludeIfDefault("")
    targetRecordsFilter = "";

    /**
     * Indicates whether the script object is excluded.
     */
    @ExcludeIfDefault(false)
    excluded = false;

    /**
     * Indicates whether to use values mapping for the script object defined in the csv file.
     */
    @ExcludeIfDefault(false)
    useCSVValuesMapping = false;

    /**
     * Indicates whether to use values mapping for the script object defined in the export.json configuration file.
     */
    @ExcludeIfDefault(false)
    useValuesMapping: boolean;

    /**
     * Indicates whether to use field mapping for the script object.
     */
    @ExcludeIfDefault(false)
    useFieldMapping = false;

    /**
     * Indicates whether the script object is a master record.
     */
    @ExcludeIfDefault(true)
    master = true;

    /**
     * An array of excluded fields for the script object.
     */
    @ExcludeIfDefault([])
    excludedFields = new Array<string>();

    /**
     * An array of fields excluded from update for the script object.
     */
    @ExcludeIfDefault([])
    excludedFromUpdateFields = new Array<string>();

    /**
     * The batch size for Bulk API v1 for the script object.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.BULK_API_V1_DEFAULT_BATCH_SIZE)
    bulkApiV1BatchSize = CONSTANTS.SFDMU.BULK_API_V1_DEFAULT_BATCH_SIZE;

    /**
     * The batch size for REST API for the script object.
     */
    @ExcludeIfDefault(CONSTANTS.SFDMU.REST_API_DEFAULT_BATCH_SIZE)
    restApiBatchSize = CONSTANTS.SFDMU.REST_API_DEFAULT_BATCH_SIZE;

    /**
     * Indicates whether to use queryAll for the script object.
     */
    @ExcludeIfDefault(false)
    useQueryAll = false;

    /**
     * Indicates whether the queryAll target is enabled for the script object.
     */
    @ExcludeIfDefault(false)
    queryAllTarget = false;

    /**
     * Indicates whether to skip existing records for the script object.
     */
    @ExcludeIfDefault(false)
    skipExistingRecords = false;

    /**
     * The number of parallel Bulk API jobs for the script object.
     */
    @ExcludeIfDefault(1)
    parallelBulkJobs = 1;

    /**
     * The number of parallel REST API jobs for the script object.
     */
    @ExcludeIfDefault(1)
    parallelRestJobs = 1;


    // TODO:  UI for all addon definitions not implemented yet
    /**
     * Addon definitions which are executed before this object processed, even before it is queried.
     *
     * @type {any[]}
     * @memberof ScriptObject
     */
    @ExcludeIfDefault([])
    beforeAddons: any[] = [];

    /**
     * Addon definitions which are executed after this object is fully processed.
     *
     * @type {any[]}
     * @memberof ScriptObject
     */
    @ExcludeIfDefault([])
    afterAddons: any[] = [];

    /**
     *  Addon definitions which are executed just before the target org is updated on this object.
     *
     * @type {any[]}
     * @memberof ScriptObject
     */
    @ExcludeIfDefault([])
    beforeUpdateAddons: any[] = [];


    /**
     * Addon definitions which are executed after the target org is updated on this object.
     *
     * @type {any[]}
     * @memberof ScriptObject
     */
    @ExcludeIfDefault([])
    afterUpdateAddons: any[] = [];

    /**
     *  Addon definitions which are executed when the update records are prepared to update the target org, i.e. filter records.
     *
     * @type {any[]}
     * @memberof ScriptObject
     */
    @ExcludeIfDefault([])
    filterRecordsAddons: any[] = [];


    //-------------------------------------------------------------------------
    /**
     * The WHERE clause of the query.
     */
    @Expose({ groups: ['db'] })
    where = ""

    /**
     * The ORDER BY clause of the query.
     */
    @Expose({ groups: ['db'] })
    orderBy = "";

    /**
     * The LIMIT clause of the query.
     */
    @Expose({ groups: ['db'] })
    limit = 0

    /**
     * The OFFSET clause of the query.
     */
    @Expose({ groups: ['db'] })
    offset = 0;

    /**
     * The WHERE clause of the delete query.
     */
    get deleteQueryWhere(): string {
        return ((this.deleteQuery || '').split("WHERE")[1] || '').trim();
    }
    set deleteQueryWhere(value: string) {
        this.deleteQuery = value ? `SELECT Id FROM ${this.name} WHERE ${value}` : '';
    }

    /**
     * The fields of the query.
     */
    @Expose({ groups: ['db'] })
    fields: Array<string> = [];

    /**
     * The name of the sObject for the script object.
     */
    @Expose({ groups: ['db'] })
    name = "";

    /**
     * The default external ID for the script object.
     */
    @Expose({ groups: ['db'] })
    defaultExternalId: string;

    /**
     * Indicates whether describing the script object in the source org failed.
     */
    @Exclude()
    failedToDescribeInSourceOrg = false;

    /**
     * Indicates whether describing the script object in the target org failed.
     */
    @Exclude()
    failedToDescribeInTargetOrg = false;


    /**
     * Represents polymorphic fields for the script object.
     */
    @Type(() => PolymorphicField)
    @Expose({ groups: ['db'] })
    polymorphicFields = new Array<PolymorphicField>();


    /**
     * Initializes the script object.
     */
    init(): void {

        CommonUtils.initializeObject(this, ScriptObject, {
            id: this.id || CommonUtils.randomString()
        } as ScriptObject);

        if (!this.fields.length) {
            const parsed = SfdmuUtils.parseSoql(this.query);
            this.fields = parsed.fields;
            this.name = parsed.objectName;
            this.where = parsed.where;
            this.orderBy = parsed.orderBy;
            this.limit = parsed.limit;
            this.offset = parsed.offset;
            SfdmuUtils.setSOQLFields(this);
        }

        this.mockFields.forEach(mockField => {
            mockField.init();
        });

        this.fieldMapping.forEach(fieldMapping => {
            fieldMapping.init();
        });
    }

    resetId() {
        this.id = CommonUtils.randomString();
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
    clone(): ScriptObject {
        return CommonUtils.clone(this);
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
        SfdmuUtils.setSOQLFields(this, fields);
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
        SfdmuUtils.setSOQLFields(this, fields);
    }

    /** 
     * Returns True if the external id is already set 
     * and False if the external id should be set after this object is described for the first time.
     */
    get isExternalIdSet(): boolean {
        return !!this._externalId;
    }

    /**
     * Returns the target sObject if field mapping is used.
     */
    get targetObject(): string {
        return this.fieldMapping.find(fm => !!fm.targetObject)?.targetObject || this.name;
    }

    /**
     * Returns the mapping between source and target fields when field mapping is used.
     */
    get targetFields(): Map<string, ScriptMappingItem> {
        const targetFields = new Map<string, ScriptMappingItem>();
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
    get hasFieldMapping(): boolean {
        return this.fieldMapping.length > 0;
    }


}

/**
 * Represents a polymorphic field entity wihin the ScriptObject.
 */
export class PolymorphicField extends ScriptEntityBase {
    constructor(init?: Partial<PolymorphicField>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }
    /**
     * The name of the polymorphic field.
     */
    name = "";

    /**
     * The object type being referenced by the polymorphic field.
     */
    objectName = "";
}


/**
 * Represents a script organization entity from the array of orgs
 * in the export.json configuration file.
 * @extends {ScriptEntityBase}
 */
export class ScriptOrg extends ScriptEntityBase {
    constructor(init?: Partial<ScriptOrg>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * The name of the organization.
     */
    @ExcludeIfDefault("")
    name = "";

    /**
     * The instance URL of the organization.
     */
    @Expose({ groups: ['export+orgs'] })
    @ExcludeIfDefault("")
    instanceUrl = "";

    /**
     * The access token of the organization.
     */
    @Expose({ groups: ['export+orgs'] })
    accessToken = "";


    //-------------------------------------------------------------------------
    /**
     * The username of the organization.
     */
    @Expose({ groups: ['db'] })
    @ExcludeIfDefault("")
    orgUserName = "";

    init(): void {
        CommonUtils.initializeObject(this, ScriptOrg, {
            id: this.id || CommonUtils.randomString()
        } as ScriptOrg);
    }
}

/**
 * Represents a field mapping item entity in the export.json configuration file.
 * @extends {ScriptEntityBase}
 */
export class ScriptMappingItem extends ScriptEntityBase {

    constructor(init?: Partial<ScriptMappingItem>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * The target object of the mapping.
     */
    @ExcludeIfDefault(null)
    targetObject: string;

    /**
     * The source field of the mapping.
     */
    @ExcludeIfDefault(null)
    sourceField: string;

    /**
     * The target field of the mapping.
     */
    @ExcludeIfDefault(null)
    targetField: string;

    //-------------------------------------------------------------------------
    @Exclude()
    id: string;

    init(): void {
        CommonUtils.initializeObject(this, ScriptMappingItem, {
            id: this.id || CommonUtils.randomString()
        } as ScriptMappingItem);
    }

    resetId() {
        this.id = CommonUtils.randomString();
    }

}

/**
 * Represents a script mock field entity in the export.json configuration file
 *  used for data anonymization.
 * @extends {ScriptEntityBase}
 */
export class ScriptMockField extends ScriptEntityBase {

    constructor(init?: Partial<ScriptMockField>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * The name of the mock field.
     */
    @ExcludeIfDefault("")
    name = "";

    /**
     * The pattern of the mock field.
     */
    @ExcludeIfDefault("")
    pattern = "";

    /**
     * The excluded regex pattern for the mock field.
     */
    @ExcludeIfDefault("")
    excludedRegex = "";

    /**
     * The included regex pattern for the mock field.
     */
    @ExcludeIfDefault("")
    includedRegex = "";

    /**
     * An array of names to exclude for the mock field.
     */
    @ExcludeIfDefault([])
    excludeNames = new Array<string>();

    //-------------------------------------------------------------------------
    @Exclude()
    id: string;

    @Exclude()
    patternName = "";

    @Exclude()
    customPatternParameters = "";


    init(): void {
        CommonUtils.initializeObject(this, ScriptMockField, {
            id: this.id || CommonUtils.randomString()
        } as ScriptMockField);
    }

    resetId() {
        this.id = CommonUtils.randomString();
    }


}

/* #endregion */


/* #region SFDMU Types */

/**
 * The concurrency mode for script execution.
 */
export type ConcurrencyMode = "Serial" | "Parallel";

/* #endregion */


/* #region SFDMU Interfaces */

/**
 * Represents the result of a query operation.
 */
export interface IQueryResult<T> extends jsforce.QueryResult<T>, IApiResultBase {
}

/**
 * Represents the result of a data operation.
 */
export interface IDataResult<T> extends IApiResultBase {
    /**
     * The data returned by the operation.
     */
    data: T[];
}

/**
 * The base interface for API entities.
 */
export interface IApiEntityBase {
    /**
     * Indicates whether an error occurred.
     */
    isError?: boolean;

    /**
     * The error message.
     */
    errorMessage?: string;
}

/**
 * The base interface for API results.
 */
export interface IApiResultBase extends IApiEntityBase {
    /**
     * The status code of the result.
     */
    statusCode?: StatusCode;
}


/* #endregion */


/* #region JSForce Connection */

/**
 * Represents a JSForce connection with extended properties.
 */
export class JSforceConnection extends jsforce.Connection {

    /**
     * The username associated with the connection.
     */
    userName: string;

    constructor(connection?: Partial<JSforceConnection | Connection>) {
        if (connection) {
            if (connection instanceof Connection) {
                super({
                    accessToken: connection.accessToken,
                    instanceUrl: connection.instanceUrl,
                    version: (connection as Connection).apiVersion,
                });
            } else {
                super({
                    accessToken: connection.accessToken,
                    instanceUrl: connection.instanceUrl,
                    version: CONSTANTS.SFDMU.DEFAULT_API_VERSION,
                });
            }
            if (connection instanceof JSforceConnection
                || connection instanceof Connection) {
                Object.assign(this, {
                    userName: connection.userName
                });
            }
        }
    }
}

/* #endregion */


/* #region  Extra Interfaces */
export interface IParsedSoql {
    fields: Array<string>,
    objectName: string,
    where: string,
    orderBy: string,
    limit: number,
    offset: number
}

/* #endregion */

/* #region force:org:list command */

/**
 * Represents the result of the force:org:list command.
 */
export interface IForceOrgListResult extends IApiResultBase {
    /**
     * An array of organization information.
     */
    orgs: Array<ForceOrg>;

    /**
     * The output of the command.
     */
    commandOutput?: string;
}

/**
 * Represents the response of the force:org:list command.
 */
export interface IForceOrgListResponse {
    /**
     * The status code of the response.
     */
    status: number;

    /**
     * The result body of the response.
     */
    result: IForceOrgListResponseBody;

    /**
     * The message of the response.
     */
    message: string;
}

/**
 * Represents the body of the force:org:list response.
 */
export interface IForceOrgListResponseBody {
    /**
     * An array of non-scratch org information.
     */
    nonScratchOrgs: ForceOrg[];

    /**
     * An array of scratch org information.
     */
    scratchOrgs: ForceOrg[];
}

/**
 * Represents an organization.
 */
export class ForceOrg {
    /**
     * The access token of the organization.
     */
    accessToken: string;

    /**
     * The ID of the organization.
     */
    orgId: string;

    /**
     * Indicates whether the organization is a Dev Hub.
     */
    isDevHub: boolean;

    /**
     * The API version of the organization instance.
     */
    instanceApiVersion: string;

    /**
     * The URL of the organization instance.
     */
    instanceUrl: string;

    /**
     * The login URL of the organization.
     */
    loginUrl: string;

    /**
     * The username associated with the organization.
     */
    username: string;

    /**
     * The client ID of the organization.
     */
    clientId: string;

    /**
     * The connected status of the organization.
     */
    connectedStatus: 'Connected';

    /**
     * The alias of the organization.
     */
    alias?: string;

    /**
     * Indicates whether the organization is a scratch org.
     */
    isScratchOrg = false;

    /**
     * Indicates whether the organization is connected.
     */
    get isConnected(): boolean {
        return this.connectedStatus == "Connected";
    }
}

/* #endregion */


/* #region force:org:display command */

/**
 * Represents the result of the force:org:display command.
 */
export class ForceOrgDisplayResult implements IApiResultBase {
    constructor(init?: Partial<ForceOrgDisplayResult>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * The id of the organization.
     */
    id: string;

    /**
     * The access token of the organization.
     */
    accessToken: string;

    /**
     * The client ID of the organization.
     */
    clientId: string;

    /**
     * The connected status of the organization.
     */
    connectedStatus: 'Connected' | 'Active';

    /**
     * The status of the organization.
     */
    status: string;

    /**
     * The ID of the organization.
     */
    orgId: string;

    /**
     * The ID of the user.
     */
    userId: string;

    /**
     * The instance URL of the organization.
     */
    instanceUrl: string;

    /**
     * The username associated with the organization.
     */
    username: string;

    /**
     * The output of the command.
     */
    commandOutput: string;

    /**
     * The CLI command used.
     */
    cliCommand: string;

    /**
     * Indicates whether an error occurred.
     */
    isError: boolean;

    /**
     * The error message.
     */
    errorMessage: string;

    /**
     * The status code of the result.
     */
    statusCode: StatusCode;

    /**
     * The API version of the organization instance.
     */
    apiVersion: string;

    /**
     * Tha alias of the organization.
     */
    alias: string;

    /**
     * Indicates whether the organization is connected.
     */
    get isConnected(): boolean {
        return this.connectedStatus == "Connected" || this.status == "Active";
    }
}

export interface IForceOrgDisplayResponse {
    status: number;
    result: ForceOrgDisplayResult;
    message: string;
}

/* #endregion */


/* #region Common data sfdmu commands */
/**
 * Represents the result of a data operation.
 */
export interface IDataResult<T> extends IApiResultBase {
    /**
     * The data returned by the operation.
     */
    data: T[];
}

/* #endregion */

/* #region sfdx Command execution */

/**
 * Represents the result of executing an sfdx command.
 */
export interface IExecSfdxCommandResult extends IApiResultBase {
    /**
     * The output of the command.
     */
    commandOutput: string;

    /**
     * The CLI command used.
     */
    cliCommand: string;
}

/* #endregion */


