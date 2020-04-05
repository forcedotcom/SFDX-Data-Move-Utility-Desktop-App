import parseJson = require('parse-json');
import SimpleCrypto from "simple-crypto-js";
import {
    SOrg,
    Enums,
    SFieldDescribe,
    SObjectDescribe,
    IExternalIdField,
    CONSTANTS as SFDMU_CONSTANTS,
    ScriptMockField,
    CONSTANTS
} from '../sfdmu-plugin/modules/models';
import jsforce = require('jsforce');
import { Type, Expose } from "class-transformer";
import "reflect-metadata";
import "es6-shim";
import { plainToClass } from "class-transformer";
import AppUtils from './appUtils';
import express = require('express');
import { isNumber } from 'soql-parser-js/dist/src/utils';
import { SfdxUtils } from '../sfdmu-plugin/modules/sfdx';
import { Database } from './db';
const stringSimilarity = require('string-similarity');
const path = require("path");
const fs = require('fs');
const mkdir = require('mkdir-recursive');



// EXTENSIONS -------------------------------------------------------------
// ----------------------------------------------------------------------

express.response["jsonExt"] = function (this: express.Response, body?: any): express.Response {
    body = parseJson(AppUtils.stringifyObj(body));
    return this.json(body);
}



// DECORATORS -------------------------------------------------------------
// ----------------------------------------------------------------------

function serializable() {
    return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        let p = Object.getOwnPropertyDescriptor(target, '_serializableKeys');
        if (!p) {
            Object.defineProperty(target, "_serializableKeys", {
                enumerable: false,
                value: [propertyKey],
                writable: true
            });
        } else {
            target["_serializableKeys"] = target["_serializableKeys"].concat(propertyKey);
        }


        descriptor.enumerable = true;
        Object.defineProperty(target, propertyKey, descriptor);

    };
}






// INTERFACES -------------------------------------------------------------
// ----------------------------------------------------------------------


/**
 * Represents each section of external id key separated by semicolon (;), like: Account.MyField__r.Name;Language__r.Name
 */
interface IExternalIdFieldSection {

    /**
     * Full section name string, like: Account.MyField__r.Name
     */
    name: string;


    /**
     * All metadata errors for this section
     */
    dataError: string;


    /**
     * Represents parts of the ext id field, separated by comma, like: Account.MyField__r.Name => it contains 3 parts
     */
    items: Array<IExternalIdFieldSectionItem>;
}



export interface IExternalIdFieldSectionItem {

    /**
     * All metadata errors for this section
     */
    dataError: string;


    /**
     * First part object name like Account__c for Account_r.MyField__c
     */
    objectName: string;


    /**
     * Name of the section, like: MyField__c for simple field and MyField__r for reference field
     */
    fieldName: string,

    /**
     * Description of the  current field
     */
    field: IExternalIdField,

    /**
     * List of describtions of all available fields for this section extracted from the current SObject metadata
     */
    availableFields: Array<IExternalIdField>
}


export interface ExtendedResponse extends express.Response {
    jsonExt(this: express.Response, body?: any): express.Response;
}




// MAIN MODELS -------------------------------------------------------------
// ----------------------------------------------------------------------
export class User {

    constructor(init?: Partial<object>) {
        Object.assign(this, init);
        this.orgs = this.orgs || new Array<Org>();
        this.configs = this.configs || new Array<SecureData>();
        this.id = this.id || AppUtils.makeId();

        for (let index = 0; index < this.orgs.length; index++) {
            this.orgs[index] = new Org(this.orgs[index]);
        }

        this.configList = new Array<Config>();
        this.configs.forEach(x => {
            this.configList.push(new Config().fromSecureObject(this.userPassword, x));
        });
    }

    // Main members ---------------
    /**
     * App User profile email
     * Encrypted => in DB
     */
    email: string;



    /**
     * App User Passsword
     * Encrypted => in DB
     */
    password: string;


    /**
     * Id of the database row
     * Plain => in DB
     */
    id: string;


    /**
     * Common data of the org in the User profile
     * Encrypted => in DB
     */
    @Type(() => Org)
    orgs: Array<Org>;


    /**
     * Data of ALL package configuration in the User profile
     * Encrypted => in DB
     */
    @Type(() => SecureData)
    configs: Array<SecureData>; // Internaly encrypted => in DB




    // Utils members ---------------
    /**
     * Plain User profile name
     * Plain => In the server memory only
     */
    userName: string;


    /**
     * Plain User profile password
     * Plain => In the server memory only
     */
    userPassword: string;


    /**
     * Plain version of "configs"
     * after it is decrypted from DB.
     */
    @Type(() => Config)
    configList: Array<Config>;



    toObject(): object {
        return parseJson(AppUtils.stringifyObj(this));
    }

    toSequreObject(): object {

        let obj = this.toObject();

        delete obj["userName"];
        delete obj["userPassword"];

        for (let index = 0; index < obj["orgs"].length; index++) {
            obj["orgs"][index] = new Org(obj["orgs"][index]).toSequreObject();
        }

        obj["configs"] = new Array<SecureData>();
        this.configs = [];
        this.configList.forEach(config => {
            let cfg = new Config(config).toSequreObject(this.userPassword);
            obj["configs"].push(cfg);
            this.configs.push(cfg);
        });
        delete obj["configList"];

        return obj;
    }


    getUserDirectoryName(): string {
        return this.userName.replace(/[^\w]/gi, '-');
    }

    getOrgUsername(org: Org): string {
        var simpleCrypto = new SimpleCrypto(this.userPassword);
        return simpleCrypto.decrypt(org.username) as string;
    }

    getConfigListItems(userData: UserData): SelectListItem[] {
        return this.configList.map((config: Config) => {
            let dataError = [];
            config.objects.forEach(o => {
                if (!userData.sourceSObjectsMap.has(o.name)) {
                    dataError[0] = "Missing some SObjects in the source org metadata."
                }
                if (!userData.targetSObjectsMap.has(o.name)) {
                    dataError[1] = "Missing some SObjects in the target org metadata."
                }
            });
            return new SelectListItem({
                value: config.id,
                text: config.name,
                dataError: dataError.join(' ').trim()
            });
        });
    }

    getOrgListItems(res: any): SelectListItem[] {
        let orgs = this.orgs.map((org: Org) => {
            return new SelectListItem({
                value: org.id,
                text: this.getOrgUsername(org),
                sortOrder: 1
            });
        });
        if (orgs.length > 0) {
            let state = res.locals.state as PageStateBase;
            if (!state.isWebApp) {
                orgs = orgs.concat(new SelectListItem({
                    value: APP_CONSTANTS.CSV_FILE_SOURCE_ID,
                    text: "- CSV Files -",
                    sortOrder: 0
                }));
            }
        }
        return orgs;
    }

    async saveUser(req: express.Request, userData: UserData, config: Config) {

        AppUtils.removeBy(this.configList, "id", config.id);
        this.configList = this.configList.concat(config);

        let db = await AppUtils.db_loadOrCreateDatabaseAsync();
        await AppUtils.db_updateUserAsync(db, this)
        AppUtils.setCurrentUser(req, this);
        AppUtils.setServerUserData(req, userData);
    }



}


export class Org {

    constructor(init?: Partial<Org>) {
        Object.assign(this, init);
        this.id = this.id || AppUtils.makeId();
    }


    // Secure members
    username: string; // Encrypted => in DB
    loginUrl: string; // Open => in DB
    id: string; // Open => in DB


    // Unsecure members => in memory only
    @Type(() => SOrg)
    sOrg: SOrg;

    userId: string;
    orgId: string;




    // Helping members
    toObject(): object {
        return parseJson(AppUtils.stringifyObj(this));
    }

    toSequreObject(): object {
        let obj = this.toObject();
        delete obj["sOrg"];
        delete obj["userId"];
        delete obj["orgId"];
        delete obj["password"];

        return obj;
    }

    get connected() {
        return !!this.sOrg;
    }

    get isSource() {
        if (!this.connected) return false;
        return this.sOrg.isSource;
    }

    get orgUsername() {
        return !this.sOrg ? "" : this.sOrg.name;
    }

    get sObjectsMap(): Map<string, SObjectDescribe> {
        return this.sOrg && this.sOrg.sObjectsMap;
    }

    create(userPassword: string, username: string, loginUrl: string): Org {
        var simpleCrypto = new SimpleCrypto(userPassword);
        this.username = simpleCrypto.encrypt(username) as string;
        this.loginUrl = loginUrl;
        return this;
    }

    async connectAsync(userPassword: string, isSource: boolean): Promise<SOrg> {
        var simpleCrypto = new SimpleCrypto(userPassword);
        let un = simpleCrypto.decrypt(this.username) as string;
        let _this = this;
        return new Promise(async (resolve, reject) => {
            try {
                let orgInfo = await AppUtils.sfdxCLI_ForceOrgDisplay(un);
                if (!orgInfo.AccessToken || !orgInfo.isConnected) {
                    reject("Unable to connect. Please, verify user's access within SFDX CLI.");
                    return;
                }
                _this.sOrg = new SOrg(un, orgInfo.AccessToken, orgInfo.InstanceUrl, "", Enums.DATA_MEDIA_TYPE.Org, isSource);
                _this.userId = orgInfo.UserId;
                _this.orgId = orgInfo.OrgId;
                resolve(_this.sOrg);
            } catch (ex) {
                reject("Unable to connect. Please, verify user's access within SFDX CLI.");
            }
        });
    };

    disconnect() {
        this.sOrg = undefined;
    }

    getOrgObjectListItems(selectedConfig: Config, userData: UserData, excludeExistingObjects: boolean = true): SelectListObjectItem[] {
        let secondOrg = userData.sourceOrg.id == this.id ? userData.targetOrg : userData.sourceOrg;
        let objs = excludeExistingObjects ? selectedConfig.objects.map(x => x.name) : [];
        let objects = [...this.sObjectsMap.values()].map(o => {
            let item = new SelectListObjectItem({
                value: o.name,
                text: `${o.label} (${o.name})`
            });
            item.sObjectDescribe = o;
            return item;
        }).filter(o => {
            return objs.indexOf(o.value) < 0
                && secondOrg.sObjectsMap.has(o.value)
                && o.usableForDataMigration
        });
        return objects;
    }

    isEquals(org2: Org) {
        return this.orgId == org2.orgId;
    }


}


export class Config {

    constructor(init?: Partial<Config>) {
        Object.assign(this, init);
        this.id = this.id || AppUtils.makeId();
        this.objects = this.objects || new Array<ConfigObject>();
    }

    // Main members ---------------
    name: string;

    id: string;

    allOrNone: boolean = true;

    encryptDataFiles: boolean = false;

    pollingIntervalMs: number = 5000;

    bulkThreshold: number = 200;

    apiVersion: string = "47.0";

    validateCSVFilesOnly: boolean = false;

    importCSVFilesAsIs: boolean = false;

    createTargetCSVFiles: boolean = true;

    bulkApiV1BatchSize: number = 9500;

    bulkApiVersion: "1.0" | "2.0" = "2.0";


    @Type(() => ConfigObject)
    objects: ConfigObject[];



    // Utils members ---------------
    passwordSecured: boolean = false;

    useFileSource: boolean = false;

    useFileTarget: boolean = false;

    scriptDirectory: string;

    scriptPath: string;

    commandString: string;

    toObject(): object {
        return parseJson(AppUtils.stringifyObj(this));
    }

    toSequreObject(userPassword: string): SecureData {
        var simpleCrypto = new SimpleCrypto(userPassword);
        return new SecureData({
            data: simpleCrypto.encrypt(AppUtils.stringifyObj(this)) as string
        });
    }

    fromObject(obj: object) {
        Object.assign(this, obj);
    }

    fromSecureObject(userPassword: string, secureObject: object): Config {
        let simpleCrypto = new SimpleCrypto(userPassword);
        let obj = plainToClass(SecureData, secureObject);
        if (obj && obj.data) {
            try {
                let plainObject = JSON.parse(simpleCrypto.decrypt(obj.data) as string);
                this.fromObject(plainObject);
            } catch (e) { }
        }
        return this;
    }

    toExportableObject(): object {
        return parseJson(AppUtils.stringifyObj({
            name: this.name,
            allOrNone: this.allOrNone,
            bulkApiV1BatchSize: this.bulkApiV1BatchSize,
            bulkApiVersion: this.bulkApiVersion,
            createTargetCSVFiles: this.createTargetCSVFiles,
            encryptDataFiles: this.encryptDataFiles,
            pollingIntervalMs: this.pollingIntervalMs,
            bulkThreshold: this.bulkThreshold,
            apiVersion: this.apiVersion,
            validateCSVFilesOnly: this.validateCSVFilesOnly,
            importCSVFilesAsIs: this.importCSVFilesAsIs,
            objects: this.objects,
            passwordSecured: this.passwordSecured,
            useFileSource: this.useFileSource,
            useFileTarget: this.useFileTarget
        }));
    }

    getFileName(): string {
        return this.name.replace(/[^\d\w_\-]/gi, "");
    }

    async getConfigObjectListItems(userData: UserData, req: express.Request): Promise<[SelectListObjectItem[], string]> {

        let objects: Array<SelectListObjectItem> = new Array<SelectListObjectItem>();


        for (let index = 0; index < this.objects.length; index++) {

            const o = this.objects[index];

            let dataError = [];

            if (!userData.sourceSObjectsMap.has(o.name)) {
                dataError[0] = "This SObject does not exist in the source org metadata."
            }

            if (!userData.targetSObjectsMap.has(o.name)) {
                dataError[1] = "This SObject does not exist the target org metadata."
            }

            let objectExtraData: any = {};

            if (dataError.length == 0) {
                objectExtraData = await o.getObjectExtraData(userData, req, false);
                o.fixExtraDataAndObjectParameters(userData, this, objectExtraData, false)
                if (objectExtraData["externalIdDataError"]) {
                    dataError[2] = objectExtraData["externalIdDataError"];
                }
                if (userData.migrationDirection == DATA_MIGRATION_DIRECTIONS.File2Org && !objectExtraData.csvSourceFileExist) {
                    dataError[3] = "Missing sorce CSV file for this object.";
                }

            }


            let ob = new SelectListObjectItem({
                value: o.name,
                text: `${o.label} (${o.name})`,
                id: o.name,
                serializedObjectExtraData: JSON.stringify(objectExtraData)
            });

            ob.sObjectDescribe = userData.sourceSObjectsMap.get(o.name);

            ob.fields = o.getSelectedFieldListItems(userData);
            ob.sourceFields = o.getSourceFieldListItems(userData).concat(ob.fields);

            if (ob.fields.filter(f => {
                return !!f.dataError;
            }).length > 0) {
                dataError[4] = "This object has some errors in the field definitions."
            }

            if (ob.fields.length == 0) {
                dataError[5] = "This object has no fields selected for the migration."
            }

            ob.dataError = o.included && dataError.join(' ').trim();

            objects.push(ob);
        }

        objects = AppUtils.distinctBy(objects, "id");

        let configExtraData = await this.getConfigExtraData(userData, objects);

        let configDataError = "";

        if (!configExtraData.isCSVFilesExist
            && userData.migrationDirection == DATA_MIGRATION_DIRECTIONS.File2Org) {
            configDataError += "Missing source CSV files.";
        }

        if (objects.length == 0) {
            configDataError += " Missing objects definition.";
        }

        if (objects.filter(o => !!o.dataError).length > 0) {
            configDataError += " There are errors in the objects definition.";
        }

        return [objects, configDataError];

    }


    generatePackageScriptJsonString(userData: UserData, userPassword: string, addOrgsSection: boolean): string {

        let script: any = {

            orgs: addOrgsSection ? [] : undefined,
            objects: [],

            promptOnMissingParentObjects: false, // Always false
            allOrNone: this.allOrNone,
            bulkApiV1BatchSize: this.bulkApiV1BatchSize,
            bulkApiVersion: this.bulkApiVersion,
            createTargetCSVFiles: this.createTargetCSVFiles,
            validateCSVFilesOnly: this.validateCSVFilesOnly,
            importCSVFilesAsIs: this.importCSVFilesAsIs,
            promptOnUpdateError: false, // Always false
            encryptDataFiles: this.encryptDataFiles,
            pollingIntervalMs: this.pollingIntervalMs,
            bulkThreshold: this.bulkThreshold,
            apiVersion: this.apiVersion
        };

        if (script.orgs) {
            if (this.passwordSecured) {
                var simpleCrypto = new SimpleCrypto(userPassword);
                script.orgs.push({
                    instanceUrl: simpleCrypto.encrypt(userData.sourceOrg.sOrg.instanceUrl),
                    name: simpleCrypto.encrypt(userData.sourceOrg.sOrg.name),
                    accessToken: simpleCrypto.encrypt(userData.sourceOrg.sOrg.accessToken)
                });
                if (userData.sourceOrg.orgId != userData.targetOrg.orgId) {
                    script.orgs.push({
                        instanceUrl: simpleCrypto.encrypt(userData.targetOrg.sOrg.instanceUrl),
                        name: simpleCrypto.encrypt(userData.targetOrg.sOrg.name),
                        accessToken: simpleCrypto.encrypt(userData.targetOrg.sOrg.accessToken)
                    });
                }
            } else {
                script.orgs.push({
                    instanceUrl: userData.sourceOrg.sOrg.instanceUrl,
                    name: userData.sourceOrg.sOrg.name,
                    accessToken: userData.sourceOrg.sOrg.accessToken
                });
                if (userData.sourceOrg.orgId != userData.targetOrg.orgId) {
                    script.orgs.push({
                        instanceUrl: userData.targetOrg.sOrg.instanceUrl,
                        name: userData.targetOrg.sOrg.name,
                        accessToken: userData.targetOrg.sOrg.accessToken
                    });
                }
            }
        }

        this.objects.forEach(object => {
            script.objects.push({
                name: object.name,
                operation: OPERATIONS[object.operation],
                externalId: object.externalId,
                mockFields: object.mockFields,
                updateWithMockData: object.updateWithMockData,
                mockCSVData: object.mockCSVData,
                deleteOldData: object.deleteOldData,
                allRecords: object.allRecords,
                useCSVValuesMapping: object.useCSVValuesMapping,
                excluded: object.included ? undefined : true,
                targetRecordsFilter: object.targetRecordsFilter,
                query: (`SELECT Id, ${object.fields.map(f => f.name).join(', ')} FROM ${object.name}${object.where ? " WHERE " + object.where.trim() : ""}${object.orderBy ? " ORDER BY " + object.orderBy.trim() : ""}${object.limit ? " LIMIT " + object.limit : ""}`).trim(),
                deleteQuery: object.operation == OPERATIONS.Delete || object.deleteOldData ?
                    (
                        object.deleteAll ? `SELECT Id FROM ${object.name}`
                            : object.deleteWhere ? `SELECT Id FROM ${object.name} WHERE ${object.deleteWhere}` : ""
                    ) : ""
            });
        });


        let str = JSON.stringify(script,
            function replacer(key, value) {
                if (String(key).startsWith("_") || String(key).startsWith("$"))
                    return undefined;
                else
                    return value;
            }, 4);

        return str;

    }


    async createAndGetScriptDirectory(userData: UserData, getRootFolder?: boolean): Promise<string> {
        let db = await AppUtils.db_loadOrCreateDatabaseAsync();
        if (getRootFolder) {
            return db.getFilepath();
        }
        let scriptDirectory = path.join(db.getFilepath(), "/" + userData.userDirectory + "/" + this.getFileName() + "/");
        if (!fs.existsSync(scriptDirectory)) {
            mkdir.mkdirSync(scriptDirectory);
        }
        return scriptDirectory;
    }

    async getConfigExtraData(userData: UserData, objectItems: SelectListObjectItem[]): Promise<any> {

        let objectExtraDataMap: Map<string, any> = new Map<string, any>();
        objectItems.forEach(object => {
            let extraData = JSON.parse(object.serializedObjectExtraData || '{}');
            objectExtraDataMap.set(object.value, extraData);
        })

        let showAddMissingParentObjectButton: boolean = objectItems.filter(object => {
            let extraData = objectExtraDataMap.get(object.value);
            return !(extraData && extraData.initialized);
        }).length == 0;

        let scriptDirectory = await this.createAndGetScriptDirectory(userData);

        let isCSVFilesExist = scriptDirectory
            && fs.existsSync(scriptDirectory)
            && fs.readdirSync(scriptDirectory).filter(fn => fn.endsWith('.csv')).length > 0;

        let showImportConfigurationFromFileButton = isCSVFilesExist;

        return {

            showAddMissingParentObjectButton: showAddMissingParentObjectButton,
            showImportConfigurationFromFileButton: showImportConfigurationFromFileButton,

            migrationDirection: userData.migrationDirection,

            isCSVFilesExist: isCSVFilesExist,

            isFileMigration: userData.migrationDirection == DATA_MIGRATION_DIRECTIONS.File2Org
                || userData.migrationDirection == DATA_MIGRATION_DIRECTIONS.Org2File,

            isFileMigrationSource: userData.migrationDirection == DATA_MIGRATION_DIRECTIONS.File2Org,

            isFileMigrationTarget: userData.migrationDirection == DATA_MIGRATION_DIRECTIONS.Org2File

        };

    }


}


export class ConfigObject {

    constructor(init?: Partial<ConfigObject>) {
        Object.assign(this, init);
        this.fields = this.fields || new Array<ConfigField>();
        this.mockFields = this.mockFields || new Array<ScriptMockField>();
        //if (this.name == "User")
        //  this.operation = OPERATIONS.Readonly;

    }

    // Main members ---------------
    name: string;
    label: string;
    operation: OPERATIONS = OPERATIONS.Upsert;
    externalId: string;
    limit: number;
    where: string;
    deleteWhere: string;
    orderBy: string;

    @Type(() => ConfigField)
    fields: ConfigField[];

    @Type(() => ScriptMockField)
    mockFields: Array<ScriptMockField>;

    updateWithMockData: Boolean = false;
    mockCSVData: Boolean = false;
    deleteOldData: Boolean = false;

    deleteAll: boolean = false;
    allRecords: boolean = true;
    included: boolean = true;
    useCSVValuesMapping: boolean = false;

    targetRecordsFilter: string;


    // Utils members ---------------
    getSourceFieldListItems(userData: UserData): Array<SelectListFieldItem> {

        let f = this.fields.map(x => x.name);

        let s = userData.sourceSObjectsMap.get(this.name);
        let describeSource = s ? [...s.fieldsMap.values()] : [];
        let describeTarget = userData.targetSObjectsMap.get(this.name);

        return describeSource.filter(field => {
            return !field.isReadonly
                    && FIELDS_TO_EXCLUDE_FROM_OBJECT_FIELDS_LIST.indexOf(field.name) < 0
                    && f.indexOf(field.name) < 0
        }).map(field => {
            let dataError = [];
            if (!describeTarget.fieldsMap.has(field.name)) {
                dataError[0] = "The field is missing in the target metadata.";
            }
            let item = new SelectListFieldItem({
                value: field.name,
                text: `${field.label} (${field.name})` + (field.referencedObjectType ? ` [*${field.referencedObjectType}]` : ""),
                dataError: dataError.join(' ').trim()
            });
            item.sFieldDescribe = new SfieldDescribeExtended(field);
            return item;
        });
    }


    getSelectedFieldListItems(userData: UserData): Array<SelectListFieldItem> {
        let describeSource = userData.sourceSObjectsMap.get(this.name);
        let describeTarget = userData.targetSObjectsMap.get(this.name);
        return this.fields.map(field => {
            let dataError = [];
            let item = new SelectListFieldItem({
                value: field.name
            });
            if (describeSource && describeSource.fieldsMap.size > 0 && describeTarget && describeTarget.fieldsMap.size > 0) {
                item.sFieldDescribe = new SfieldDescribeExtended(describeSource.fieldsMap.get(field.name));
                if (!item.sFieldDescribe) {
                    dataError[0] = "The field is missing in the source metadata.";
                    item.sFieldDescribe = new SfieldDescribeExtended(describeTarget.fieldsMap.get(field.name));
                    if (!item.sFieldDescribe) {
                        dataError[1] = "The field is missing in the target metadata.";
                    }
                } else if (!describeTarget.fieldsMap.has(field.name)) {
                    dataError[1] = "The field is missing in the target metadata.";
                }
                if (dataError.length == 0) {
                    item.text = item.text + (item.sFieldDescribe.referencedObjectType ? ` [*${item.sFieldDescribe.referencedObjectType}]` : "");
                    item.text = `${item.sFieldDescribe.label} (${item.sFieldDescribe.name})`;
                } else {
                    item.text = item.value;
                }
                item.dataError = dataError.join(' ').trim();
            } else {
                item.text = item.value;
            }
            return item;

        });

    }


    async getExternalIdFieldSections(userData: UserData, fixWrongExternalId: boolean, req: express.Request): Promise<Array<IExternalIdFieldSection>> {

        let sections: Array<IExternalIdFieldSection> = new Array<IExternalIdFieldSection>();

        let extIdParts = (this.externalId || "").split(SFDMU_CONSTANTS.COMPLEX_FIELDS_SEPARATOR);

        for (let i = 0; i < extIdParts.length; i++) {

            const extIdPart = extIdParts[i];

            let dataError = [];

            let describeSource = userData.sourceSObjectsMap.get(this.name);
            let describeTarget = userData.targetSObjectsMap.get(this.name);

            if (describeSource == null) {
                dataError.push(`${this.name} is missing in the source metadata.`);
            }

            if (describeTarget == null) {
                dataError.push(`${this.name} is missing in the target metadata.`);
            }

            if (!describeSource || !describeTarget) {
                sections.push({
                    name: extIdPart,
                    dataError: dataError.join(' ').trim(),
                    items: []
                });
                continue;
            }

            let complexFields = extIdPart.split('.');

            let sectionItems: Array<IExternalIdFieldSectionItem> = new Array<IExternalIdFieldSectionItem>();

            for (let j = 0; j < complexFields.length; j++) {

                const complexField = complexFields[j];
                dataError = [];

                let complexFieldName = (complexField || "Id").replace('__r', '__c');
                if (!complexFieldName.endsWith("__c") && j < complexFields.length - 1 && complexFields[j + 1] == "Id"
                    || complexFieldName == "RecordType"
                    || complexFieldName == "Profile") {
                    complexFieldName = complexFieldName + "Id";
                }

                if (describeSource.fieldsMap.size == 0) {
                    await SfdxUtils.describeSObjectAsync(describeSource.name, userData.sourceOrg.sOrg, userData.sourceSObjectsMap);
                    describeSource = userData.sourceSObjectsMap.get(describeSource.name);
                    AppUtils.setServerUserData(req, userData);
                }

                if (describeTarget.fieldsMap.size == 0) {
                    await SfdxUtils.describeSObjectAsync(describeTarget.name, userData.targetOrg.sOrg, userData.targetSObjectsMap);
                    describeTarget = userData.targetSObjectsMap.get(describeTarget.name);
                    AppUtils.setServerUserData(req, userData);
                }

                let describeSourcefield: SFieldDescribe;
                let describeTargetfield: SFieldDescribe;

                if (!fixWrongExternalId) {

                    describeSourcefield = describeSource.fieldsMap.get(complexFieldName);
                    describeTargetfield = describeTarget.fieldsMap.get(complexFieldName);

                    if (describeSourcefield == null) {
                        dataError.push(`${complexFieldName} is missing in the source metadata of ${describeSource.name}.`);
                    }

                    if (describeTargetfield == null) {
                        dataError.push(`${complexFieldName} is missing in the target metadata of ${describeTarget.name}.`);
                    }

                } else {

                    let match1 = stringSimilarity.findBestMatch(complexFieldName, [...describeSource.fieldsMap.keys()]);
                    let match2 = stringSimilarity.findBestMatch(complexFieldName, [...describeTarget.fieldsMap.keys()]);

                    describeSourcefield = describeSource.fieldsMap.get(match1.bestMatch.target);
                    describeTargetfield = describeTarget.fieldsMap.get(match2.bestMatch.target);

                    if (describeSourcefield.name != describeTargetfield.name) {
                        if (describeSourcefield == null) {
                            dataError.push(`${complexFieldName} is missing in the source or target metadata of ${describeSource.name}.`);
                        }
                    } else {
                        complexFieldName = describeSourcefield.name;
                    }
                }

                if (!describeSourcefield || !describeTargetfield) {
                    sectionItems.push({
                        objectName: describeSource.name,
                        availableFields: [],
                        dataError: dataError.join(' ').trim(),
                        fieldName: complexFieldName,
                        field: undefined
                    });
                    break;
                }

                let availableFields = describeSource.availableExternalIdFields;
                let extIdField = availableFields.filter(x => x.value == complexFieldName)[0];
                if (!extIdField) {
                    let descr = describeSource.fieldsMap.get(complexFieldName) || new SFieldDescribe({
                        label: complexFieldName,
                        name: complexFieldName
                    });
                    extIdField = {
                        objectName: describeSource.name,
                        isAutoNumber: descr.autoNumber,
                        isFormula: descr.isFormula,
                        isReference: descr.isReference,
                        label: descr.label,
                        value: descr.name
                    };
                }

                let oo = {
                    objectName: describeSource.name,
                    availableFields: availableFields.filter(x => !x.isReference),
                    dataError: "",
                    fieldName: j == complexFieldName.length - 1 ? extIdField.value : extIdField.value.replace("__c", "__r"),
                    field: extIdField
                };

                sectionItems.push(oo);

                if (describeSourcefield.isReference) {
                    describeSource = userData.sourceSObjectsMap.get(describeSourcefield.referencedObjectType);
                    describeTarget = userData.targetSObjectsMap.get(describeSourcefield.referencedObjectType);
                } else {
                    if (j < complexFields.length - 1) {
                        sectionItems.push({
                            objectName: describeSource.name,
                            availableFields: [],
                            dataError: `Field ${complexFieldName} in not a lookup or master-detail`,
                            fieldName: undefined,
                            field: undefined
                        });
                        break;
                    }
                }
            }

            let lastSection = sectionItems[sectionItems.length - 1];
            if (lastSection.fieldName && lastSection.field && lastSection.field.isReference
                && (lastSection.fieldName.endsWith("__r")
                    || lastSection.fieldName.endsWith("Id") && lastSection.fieldName != "Id")) {
                sectionItems.push({
                    objectName: describeSource.name,
                    availableFields: lastSection.availableFields,
                    dataError: "",
                    fieldName: "Id",
                    field: undefined
                });
            } else if (lastSection.fieldName && lastSection.field && !lastSection.field.isReference) {
                lastSection.fieldName = lastSection.field.value;
            }

            sectionItems.forEach(item => {
                if (item.fieldName && item.fieldName.endsWith("Id") && item.fieldName != "Id") {
                    item.fieldName = item.fieldName.substr(0, item.fieldName.length - 2);
                }
            })

            sections.push({
                name: sectionItems.filter(f => f.fieldName).map(f => f.fieldName).join('.'),
                dataError: sectionItems.map(section => section.dataError).join(' ').trim(),
                items: sectionItems
            });

        }

        return sections;
    }


    async getObjectExtraData(userData: UserData, req: express.Request, fixWrongExternalId: boolean): Promise<any> {

        let sourceSObjectMap = userData.sourceSObjectsMap.get(this.name);
        let targetSObjectMap = userData.targetSObjectsMap.get(this.name);
        if (!sourceSObjectMap || !targetSObjectMap) {
            return {
                initialized: false
            };
        }

        let externalIdParts = await this.getExternalIdFieldSections(userData, fixWrongExternalId, req);

        let externalIdPartsFieldToObjectMap = {};
        let externalIdPartsToObjectMap = {};

        let externalIdComputed = externalIdParts.map(x => x.name).join(SFDMU_CONSTANTS.COMPLEX_FIELDS_SEPARATOR).trim();
        let externalIdDataError = externalIdParts.map(x => x.dataError).join(' ').trim();
        let externalIdIscomplex = this.isComplexExternalId;
        let externalIdAvailableOptions = externalIdParts[0].items[0].availableFields;
        let externalIdIsReadonly = externalIdParts[0].items[0].field && (externalIdParts[0].items[0].field.isAutoNumber || externalIdParts[0].items[0].field.isFormula);
        let externalIdIsAutonumber = externalIdParts[0].items[0].field && externalIdParts[0].items[0].field.isAutoNumber;
        let fields = this.fields.map(x => x.name);
        let availableFieldsForMocking = [...sourceSObjectMap.fieldsMap.values()]
            .filter(x => fields.indexOf(x.name) >= 0 && x.isReadonly && !x.isReference)
            .map(x => {
                return {
                    value: x.name,
                    label: x.label
                };
            });
        let temp = this.mockFields.map(x => x.name);
        let selectedFieldsForMocking = availableFieldsForMocking.filter(x => temp.indexOf(x.value) >= 0);
        availableFieldsForMocking = availableFieldsForMocking.filter(x => temp.indexOf(x.value) < 0);
        let mockPatterns = [
            {
                label: "Country",
                value: "country",
            },
            {
                label: "City",
                value: "city",
            },
            {
                label: "Zip",
                value: "zip()",
            },
            {
                label: "Street",
                value: "street",
            },
            {
                label: "Address",
                value: "address",
            },
            {
                label: "Address1",
                value: "address1",
            },
            {
                label: "Address2",
                value: "address2",
            },
            {
                label: "State",
                value: "state",
            },
            {
                label: "State abbr",
                value: "state_abbr",
            },
            {
                label: "Latitude",
                value: "latitude",
            },
            {
                label: "Longitude",
                value: "longitude",
            },
            {
                label: "Building number",
                value: "building_number",
            },
            {
                label: "Sentence",
                value: "sentence",
            },
            {
                label: "Title",
                value: "title",
            },
            {
                label: "Text",
                value: "text",
            },
            {
                label: "Short text",
                value: "string",
            },
            {
                label: "Description",
                value: "description",
            },
            {
                label: "Short description",
                value: "short_description",
            },
            {
                label: "Word",
                value: "word",
            },
            {
                label: "Letter",
                value: "letter",
            },
            {
                label: "IP Address",
                value: "ip",
            },
            {
                label: "Domain",
                value: "domain",
            },
            {
                label: "Url",
                value: "url",
            },
            {
                label: "Email",
                value: "email",
            },
            {
                label: "Browser user agent",
                value: "user_agent",
            },
            {
                label: "Name",
                value: "name",
            },
            {
                label: "Usernaconfigme",
                value: "username",
            },
            {
                label: "Fist name",
                value: "first_name",
            },
            {
                label: "Last name",
                value: "last_name",
            },
            {
                label: "Full name",
                value: "full_name",
            },
            {
                label: "Password",
                value: "full_name",
            },
            {
                label: "Name prefix",
                value: "name_prefix",
            },
            {
                label: "Name suffix",
                value: "name_suffix",
            },
            {
                label: "Company name",
                value: "company_name",
            },
            {
                label: "Company suffix",
                value: "company_suffix",
            },
            {
                label: "Catch phrase",
                value: "catch_phrase",
            },
            {
                label: "Phone",
                value: "phone",
            },
            {
                label: "From 0 to 1",
                value: "random",
            },
            {
                label: "Integer",
                value: "integer()",
            },
            {
                label: "Double",
                value: "double()",
            },
            {
                label: "Date",
                value: "date()",
            },
            {
                label: "Time",
                value: "time()",
            },
            {
                label: "Century",
                value: "century",
            },
            {
                label: "AM/PM",
                value: "am_pm",
            },
            {
                label: "Day of year",
                value: "day_of_year",
            },
            {
                label: "Day of month",
                value: "day_of_month",
            },
            {
                label: "Day of week",
                value: "day_of_week",
            },
            {
                label: "Month number",
                value: "month_number",
            },
            {
                label: "Year",
                value: "year",
            },
            {
                label: "Timezone",
                value: "timezone",
            },
            {
                label: "Credit card number",
                value: "card_number('Visa')",
            },
            {
                label: "Credit card type",
                value: "card_type",
            },
            {
                label: "Credit card exp",
                value: "card_exp",
            },
            {
                label: "Country code",
                value: "country_code",
            },
            {
                label: "Language code",
                value: "language_code",
            },
            {
                label: "Locale",
                value: "locale",
            },
            {
                label: "Currency code",
                value: "currency_code",
            },
            {
                label: "Currency symbol",
                value: "currency_symbol",
            },
            {
                label: "Currency name",
                value: "currency_name",
            },
            {
                label: "Mime type",
                value: "mime_type",
            },
            {
                label: "File extension",
                value: "file_extension",
            },
            {
                label: "Boolean",
                value: "boolean",
            },
            {
                label: "UUID",
                value: "uuid",
            },
            {
                label: "Color name",
                value: "color_name",
            },
            {
                label: "RGB HEX Color name",
                value: "rgb_hex",
            },
            {
                label: "Incremented days",
                value: `c_seq_date('2018-01-01','d')`
            },
            {
                label: "Autonumber",
                value: `c_seq_number('${this.name.replace("__c", "")}_',1,1)`
            },
            {
                label: "Record Id",
                value: `ids`
            }
        ];

        mockPatterns.sort((a, b) => (a.label > b.label) ? 1 : -1)

        let scriptDirectory = await userData.config.createAndGetScriptDirectory(userData);
        let csvFilename = path.join(scriptDirectory, `${this.name}.csv`);
        let csvSourceFileExist = fs.existsSync(csvFilename);
        let isReadonlyObject = READONLY_OBJECTS.indexOf(this.name) >= 0;

        return {
            initialized: true,
            operation: String(this.operation),
            csvSourceFileExist: csvSourceFileExist,
            fieldsCount: fields.length,

            isReadonlyObject: isReadonlyObject,

            externalId: this.externalId,
            externalIdParts: externalIdParts,
            externalIdPartsFieldToObjectMap: externalIdPartsFieldToObjectMap,
            externalIdPartsToObjectMap: externalIdPartsToObjectMap,
            externalIdComputed: externalIdComputed,
            externalIdDataError: externalIdDataError,
            externalIdIscomplex: externalIdIscomplex,
            externalIdIsAutonumber: externalIdIsAutonumber,
            externalIdIsReadonly: externalIdIsReadonly,
            externalIdAvailableOptions: externalIdAvailableOptions,

            limit: this.limit,
            where: this.where,
            orderBy: this.orderBy,
            deleteWhere: this.deleteWhere,

            updateWithMockData: this.updateWithMockData,
            mockCSVData: this.mockCSVData,
            mockFields: this.mockFields,
            availableFieldsForMocking: availableFieldsForMocking,
            selectedFieldsForMocking: selectedFieldsForMocking,
            mockPatterns: mockPatterns,

            deleteOldData: this.deleteOldData,
            allRecords: this.allRecords,            
            useCSVValuesMapping: this.useCSVValuesMapping,
            deleteAll: this.deleteAll,
            included: this.included,
            targetRecordsFilter: this.targetRecordsFilter,


            availableOperations: [...Object.values(Enums.OPERATION)]
                .filter(x => !isNumber(x))
                .map(x => {
                    return {
                        label: x,
                        value: x
                    }
                })
        };
    }


    get isComplexExternalId(): boolean {
        return this.externalId.indexOf(SFDMU_CONSTANTS.COMPLEX_FIELDS_SEPARATOR) >= 0
            || this.externalId.indexOf('.') >= 0
            || this.externalId.indexOf('__r') >= 0;
    }


    fixExtraDataAndObjectParameters(userData: UserData,
        config: Config,
        extraData: any, applyFixToObjectParameters: boolean = true): boolean {

        let changed = false;

        // --------------------
        // Fix object parameters & extra data

        // Fix  external id
        if ((extraData.externalIdComputed != this.externalId) && (!extraData.externalIdDataError)) {
            this.externalId = extraData.externalIdComputed;
            extraData.externalId = this.externalId;
            changed = true;
        }

        // Fix migration direction
        if (userData.sourceOrg.isEquals(userData.targetOrg)) {
            if (!config.useFileSource && !config.useFileTarget) {
                config.useFileSource = true;
                config.useFileTarget = false;
                changed = true;
            }
        }


        // Fix field list for mocking
        if ((
            this.operation != OPERATIONS.Insert
            && this.operation != OPERATIONS.Readonly
            && this.operation != OPERATIONS.Delete
        ) && !this.deleteOldData) {
            let externalIdPartsFields = extraData.externalIdPartsFieldToObjectMap[this.name];
            if (externalIdPartsFields) {
                extraData.availableFieldsForMocking = extraData.availableFieldsForMocking.filter(field => {
                    return externalIdPartsFields.indexOf(field.value) < 0;
                });
            }
        }

        // Fix operation
        if (extraData.isReadonlyObject) {
            extraData.operation = OPERATIONS.Readonly.toString();
            if (applyFixToObjectParameters) {
                this.operation = OPERATIONS.Readonly;
            }
            if (this.operation != OPERATIONS.Readonly) changed = true;
        } else if ((extraData.externalIdIsAutonumber && !this.deleteOldData || this.deleteOldData)
            && this.operation != OPERATIONS.Insert
            && this.operation != OPERATIONS.Delete
            && this.operation != OPERATIONS.Readonly
        ) {
            extraData.operation = OPERATIONS.Insert.toString();
            if (applyFixToObjectParameters) {
                this.operation = OPERATIONS.Insert;
            }
            changed = true;
        }

        // Fix available operators list
        extraData.availableOperations = extraData.availableOperations.filter(x =>
            x.value == OPERATIONS[OPERATIONS.Insert]
            || x.value == OPERATIONS[OPERATIONS.Delete]
            || x.value == OPERATIONS[OPERATIONS.Upsert]
            || x.value == OPERATIONS[OPERATIONS.Update]
            || x.value == OPERATIONS[OPERATIONS.Readonly]);

        if (extraData.externalIdIsAutonumber || this.deleteOldData) {
            extraData.availableOperations = extraData.availableOperations.filter(x =>
                x.value == OPERATIONS[OPERATIONS.Insert]
                || x.value == OPERATIONS[OPERATIONS.Delete]
                || x.value == OPERATIONS[OPERATIONS.Readonly]);
        }

        if (extraData.isReadonlyObject) {
            extraData.availableOperations = extraData.availableOperations.filter(x => x.value == OPERATIONS[OPERATIONS.Readonly]);
        }

        if (applyFixToObjectParameters) {
            config.objects.forEach(obj => {
                // Remove mocking rules for all external id fields (including complex) 
                let externalIdPartFields: Array<String> = extraData.externalIdPartsFieldToObjectMap[obj.name];
                if (externalIdPartFields) {
                    for (let index = obj.mockFields.length - 1; index >= 0; index--) {
                        let element = obj.mockFields[index];
                        if (externalIdPartFields.indexOf(element.name) >= 0 && ((
                            obj.operation != OPERATIONS.Insert
                            && obj.operation != OPERATIONS.Readonly
                            && obj.operation != OPERATIONS.Delete
                        ) && !obj.deleteOldData)) {
                            obj.mockFields.splice(index, 1);
                            changed = true;
                        }
                    }
                }
            });
        }

        // --------------------

        return changed;

    }


}


export class ConfigField {
    constructor(init?: Partial<ConfigField>) {
        Object.assign(this, init);
    }

    // Main members ---------------
    name: string;
}








// COMMON APP MODELS -------------------------------------------------------------
// ----------------------------------------------------------------------

export class SecureData {
    constructor(init?: Partial<SecureData>) {
        Object.assign(this, init);
    }
    data: string;
}


/**
 * User data
 * Stored in web session
 */
export class UserData {

    constructor(init?: Partial<UserData>) {
        Object.assign(this, init);
    }

    // Main members ---------------    
    @Type(() => Org)
    sourceOrg: Org;

    @Type(() => Org)
    targetOrg: Org;

    @Type(() => Config)
    config: Config;

    userDirectory: string;

    migrationDirection: DATA_MIGRATION_DIRECTIONS = DATA_MIGRATION_DIRECTIONS.Org2Org;


    // Utils members ---------------
    toObject(): object {
        return parseJson(AppUtils.stringifyObj(this));
    }

    get sourceSObjectsMap(): Map<string, SObjectDescribe> {
        return this.sourceOrg && this.sourceOrg.sObjectsMap;
    }

    get targetSObjectsMap(): Map<string, SObjectDescribe> {
        return this.sourceOrg && this.targetOrg.sObjectsMap;
    }



}

/**
 * Response for each APi call
 * In web session
 */
export class ApiResponse {

    constructor(init?: Partial<ApiResponse>) {
        Object.assign(this, init);
    }

    // Main members ---------------
    error: string;
    redirect: string;
    orgList: SelectListItem[];
    selectedOrgId: string;

    sourceOrg: {
        id: string,
        name: string
    };

    targetOrg: {
        id: string,
        name: string
    }

    configList: SelectListItem[];
    selectedConfigId: string;

    configDataError: string;

    objectList: SelectListObjectItem[];
    selectedObjectId: string;

    objects: SelectListObjectItem[];
    object: SelectListObjectItem;

    resultString: string;

}

/**
 * Page data holder (for HBS)
 */
export class PageStateBase {

    constructor(init?: Partial<PageStateBase>) {
        Object.assign(this, init);
        this.current = this.current || {};
    }

    // Main members ---------------    
    isAuthenticated: boolean;
    userName: string;
    isWebApp: boolean;
    isDebug: boolean;

    labels = {
        websiteName: "Salesforce DX Data Move Utility - GUI Application",
        websiteShortName: "SFDMU GUI"
    };


    current: any;
}


export class GenericPageState extends PageStateBase {
    constructor(init?: Partial<GenericPageState>) {
        super(init);
        Object.assign(this, init);
    }
}


export class SelectListItem {
    constructor(init?: Partial<SelectListItem>) {
        Object.assign(this, init);
    }

    // Main members ---------------
    selected: boolean;
    text: string;
    value: string;
    data: string;
    dataError: string;
    id: string;
    sortOrder: number = 1;

}


export class SelectListObjectItem extends SelectListItem {

    constructor(init?: Partial<SelectListObjectItem>) {
        super(init);
        this.fields = this.fields || new Array<SelectListFieldItem>();
        this.sourceFields = this.sourceFields || new Array<SelectListFieldItem>();
    }

    // Main members ---------------    
    fields: SelectListFieldItem[];
    sourceFields: SelectListFieldItem[];
    sObjectDescribe?: SObjectDescribe;
    serializedObjectExtraData: string;


    @serializable()
    get canInsert(): Boolean {
        return this.sObjectDescribe
            && OBJECTS_TO_EXCLUDE_FROM_OBJECTS_LIST.indexOf(this.value) < 0
            && (RESTRICTED_LIST_OF_OBJECTS_IN_OBJECTS_LIST.length > 0 && RESTRICTED_LIST_OF_OBJECTS_IN_OBJECTS_LIST.indexOf(this.value) >= 0 || RESTRICTED_LIST_OF_OBJECTS_IN_OBJECTS_LIST.length == 0 || this.custom)
            && this.sObjectDescribe.createable
            && this.fields.filter(f => !f.sFieldDescribe.canInsert).length == 0;

    }

    @serializable()
    get canUpdate(): Boolean {
        return this.sObjectDescribe
            && OBJECTS_TO_EXCLUDE_FROM_OBJECTS_LIST.indexOf(this.value) < 0
            && (RESTRICTED_LIST_OF_OBJECTS_IN_OBJECTS_LIST.length > 0 && RESTRICTED_LIST_OF_OBJECTS_IN_OBJECTS_LIST.indexOf(this.value) >= 0 || RESTRICTED_LIST_OF_OBJECTS_IN_OBJECTS_LIST.length == 0 || this.custom)
            && this.sObjectDescribe.updateable
            && this.fields.filter(f => !f.sFieldDescribe.canUpdate).length == 0;
    }

    @serializable()
    get canUpsert(): Boolean {
        return this.canInsert && this.canUpdate;
    }

    @serializable()
    get usableForDataMigration() : Boolean{
        return this.sObjectDescribe && this.sObjectDescribe.usableForDataMigration;
    }

    @serializable()
    get custom() {
        return this.sObjectDescribe && this.sObjectDescribe.custom;
    }


}


export class SfieldDescribeExtended extends SFieldDescribe {

    constructor(init?: Partial<SFieldDescribe>) {
        super(init);
    }

    @serializable()
    get canInsert(): Boolean {
        return this.creatable
            && !this.isFormula;
    }

    @serializable()
    get canUpdate(): Boolean {
        return this.updateable
            && !this.isFormula
            && !this.autoNumber
            && !this.isMasterDetail;
    }

    @serializable()
    get canUpsert(): Boolean {
        return this.canInsert && this.canUpdate;
    }

    get isLookup(): boolean {
        return this.isReference && !this.isMasterDetail;
    }

}


export class SelectListFieldItem extends SelectListItem {

    constructor(init?: Partial<SelectListItem>) {
        super(init);
    }

    sFieldDescribe?: SfieldDescribeExtended;

    @serializable()
    get category(): string {

        if (!!this.dataError) {
            return "Errors";
        }

        if (!this.sFieldDescribe) {
            return "";
        }

        let cat = [];

        if (this.sFieldDescribe.custom && !this.sFieldDescribe.isReference)
            cat.push("Custom (non-lookup)");

        else if (this.sFieldDescribe.custom && this.sFieldDescribe.isMasterDetail)
            cat.push("Custom master-detail");

        else if (this.sFieldDescribe.custom && this.sFieldDescribe.isLookup)
            cat.push("Custom lookup");



        else if (!this.sFieldDescribe.custom && !this.sFieldDescribe.isReference)
            cat.push("Standard (non-lookup)");

        else if (!this.sFieldDescribe.custom && this.sFieldDescribe.isMasterDetail)
            cat.push("Custom master-detail");

        else if (!this.sFieldDescribe.custom && this.sFieldDescribe.isLookup)
            cat.push("Custom lookup");



        else if (this.sFieldDescribe.autoNumber)
            cat.push("Autonumber");

        else if (this.sFieldDescribe.isFormula)
            cat.push("Formula");

        else
            cat.push("Other");

        return cat.join("+");

    }




}




// SFDX MODELS -------------------------------------------------------------
// ----------------------------------------------------------------------

@Expose()
export class Sfdx_ForceOrgList_OrgItem {

    @Expose()
    orgId: string;

    @Expose()
    instanceUrl: string;

    @Expose()
    loginUrl: string;

    @Expose()
    username: string;

    @Expose()
    clientId: string;

    @Expose()
    connectedStatus: string;

    @Expose()
    alias?: string;

    isScratchOrg: boolean = false;

    get isConnected(): boolean {
        return this.connectedStatus == "Connected";
    }

}


@Expose()
export class Sfdx_ForceOrgListResponseBody {

    @Expose()
    @Type(() => Sfdx_ForceOrgList_OrgItem)
    nonScratchOrgs: Sfdx_ForceOrgList_OrgItem[];

    @Expose()
    @Type(() => Sfdx_ForceOrgList_OrgItem)
    scratchOrgs: Sfdx_ForceOrgList_OrgItem[];
}


@Expose()
export class Sfdx_ForceOrgList_CommandResponse {
    @Expose()
    status: number;

    @Expose()
    result: Sfdx_ForceOrgListResponseBody;
}






// CONSTANTS / ENUMS -------------------------------------------------------------
// ----------------------------------------------------------------------

export enum ENVIRONMENTS {
    dev = "dev",
    prod = "prod",
    test = "test"
}


export enum OPERATIONS {
    Insert = "Insert",
    Add = "Add",
    Update = "Update",
    Merge = "Merge",
    Upsert = "Upsert",
    Readonly = "Readonly",
    Delete = "Delete"
}

export enum DATA_MIGRATION_DIRECTIONS {
    Org2Org = "Org2Org",
    File2Org = "File2Org",
    Org2File = "Org2File"
}

export const APP_CONSTANTS = {
    DB_NAME: 'db',
    DB_PATH: "SFDMU/data/",
    DEFAULT_EXTERNAL_ID_FIELD_NAMES: new Map<string, string>([
        ["*", "Name"],
        ["RecordType", "DeveloperName"]
    ]),
    DEFAULT_FIELD_NAMES: new Map<string, Array<string>>([
        ["*", ["Name"]],
        ["RecordType", ["DeveloperName", "SobjectType"]]
    ]),
    DEFAULT_OPERATIONS: new Map<string, OPERATIONS>([
        ["*", OPERATIONS.Upsert],
        ["RecordType", OPERATIONS.Readonly],
        ["User", OPERATIONS.Readonly],
    ]),
    CSV_FILE_SOURCE_ID: "File"
};


export const RESTRICTED_LIST_OF_OBJECTS_IN_OBJECTS_LIST = [
    // TODO:
    // --------
];

export const OBJECTS_TO_EXCLUDE_FROM_OBJECTS_LIST = [
    // TODO:
    // --------
    //"RecordType",
    //"Profile",
    //"User",
    //"Group"
];

export const OBJECTS_NOT_TO_ADD_TO_PACKAGE_WHILE_LOOKING_FOR_RELATED_OBJECTS = [
    // TODO:
    // --------
].concat(OBJECTS_TO_EXCLUDE_FROM_OBJECTS_LIST);


export const FIELDS_TO_EXCLUDE_FROM_OBJECT_FIELDS_LIST = [
    "UserOrGroupId",
    "DandbCompanyId",
    "IsDeleted",
    "CreatedById",
    "CreatedDate",
    "LastModifiedById",
    "LastModifiedDate",
    "SystemModstamp"
];


export const READONLY_OBJECTS = [
    "RecordType",
    "Profile",
    "User",
    "Group"
];


