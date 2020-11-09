/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import stringify = require('json-stringify');
import { ConsoleUtils } from './consoleUtils';
import "reflect-metadata";
import "es6-shim";
import { plainToClass } from "class-transformer";
import { ForceOrgListResult, ForceOrgListCommandResponse, ForceOrgDisplayResult } from './helper_classes';
import { IOrgConnectionData, IPackageJson, IAppSettings, IFileEntry } from './helper_interfaces';
import { CONSTANTS, OPERATION } from './statics';
import { Org } from '../models/org';
import { SObjectDescribe } from '../models/sobjectDescribe';
import jsforce = require('jsforce');
import { QueryResult } from 'jsforce/lib/query';
import deepEqual from 'deep-equal';
import { SFieldDescribe } from '../models/sfieldDescribe';
import { DescribeSObjectResult } from 'jsforce';
import { RESOURCES } from './resources';
import { OpenDialogSyncOptions } from 'electron';
import path from "path";
import fs = require('fs');
let dialog = require('electron').remote.dialog;
let ncp = require('ncp').ncp;
const openExplorer = require('open-file-explorer');
const fse = require('fs-extra')
const { readdirSync } = require('fs')
const { distance, closest } = require('fastest-levenshtein')
var request = require("request")


//////////////////////////////////////////////
// Prototype Extensions //////////////////////
//////////////////////////////////////////////

declare global {
    interface String {
        format(...args: string[]): string;
    }
}

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match: any, number: any) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
};



//////////////////////////////////////////////
// Decorators ////////////////////////////////
//////////////////////////////////////////////

export function SerializableGetter(tags?: Array<string>) {
    return function (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
        let enumProperty = "____emum____" + String(propertyKey);
        let p = Object.getOwnPropertyDescriptor(target, '_serializableKeys');
        if (!p) {
            Object.defineProperty(target, "_serializableKeys", {
                enumerable: false,
                value: [{ propertyKey, enumProperty, tags }],
                writable: true
            });
        } else {
            target["_serializableKeys"].push({ propertyKey, enumProperty, tags });
        }
        if (descriptor) {
            descriptor.enumerable = true;
            Object.defineProperty(target, enumProperty, descriptor);
        }
    };
}

export function NonSerializable(tags?: Array<string>) {
    return function (target: object, propertyKey: string | symbol) {
        let p = Object.getOwnPropertyDescriptor(target, '_nonSerializableKeys');
        if (!p) {
            Object.defineProperty(target, "_nonSerializableKeys", {
                enumerable: false,
                value: [{ propertyKey, tags }],
                writable: true
            });
        } else {
            target["_nonSerializableKeys"].push({ propertyKey, tags });
        }
    }
}

export function NonSerializableIfDefault($default: any, tags?: Array<string>) {
    return function (target: object, propertyKey: string | symbol) {
        let p = Object.getOwnPropertyDescriptor(target, '_nonSerializableDefaults');
        if (!p) {
            Object.defineProperty(target, "_nonSerializableDefaults", {
                enumerable: false,
                value: [{ propertyKey, tags, $default }],
                writable: true
            });
        } else {
            target["_nonSerializableDefaults"].push({ propertyKey, tags, $default });
        }
    }
}



//////////////////////////////////////////////
// Utilities /////////////////////////////////
//////////////////////////////////////////////

export class AppUtils {

    public static makeId(length: Number = 10) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    public static stringifyObj(obj: any, tag?: string): string {
        return stringify(obj, (key: any, value: any) => {
            if (value instanceof Map) {
                let obj = Object.create(null);
                for (let [k, v] of value) {
                    obj[k] = v;
                }
                return obj;
            } else {
                try {
                    if (typeof value == 'object') {
                        let _serializableKeys = value.__proto__ && value.__proto__._serializableKeys;
                        let _nonSerializableKeys = value.__proto__ && value.__proto__._nonSerializableKeys;
                        let _nonSerializableDefaults = value.__proto__ && value.__proto__._nonSerializableDefaults;
                        if (_serializableKeys) {
                            let values = {};
                            _serializableKeys.forEach((key: { propertyKey: string, enumProperty: string }) => {
                                values[key.propertyKey] = value[key.enumProperty];
                            });
                            value = Object.assign({}, value);
                            _serializableKeys.forEach((key: { propertyKey: string, enumProperty: string, tags?: Array<string> }) => {
                                if (typeof values[key.propertyKey] != 'undefined') {
                                    if (!key.tags || key.tags.length == 0 || key.tags.indexOf(tag) >= 0)
                                        value[key.propertyKey] = values[key.propertyKey];
                                }
                                delete value[key.enumProperty];
                            });
                        }
                        if (_nonSerializableKeys) {
                            value = Object.assign({}, value);
                            _nonSerializableKeys.forEach((key: { propertyKey: string, tags: Array<string> }) => {
                                if (tag && key.tags) {
                                    if (key.tags.indexOf(tag) >= 0) {
                                        delete value[key.propertyKey];
                                    }
                                } else {
                                    if (!key.tags || key.tags.length == 0) {
                                        delete value[key.propertyKey];
                                    }
                                }
                            });
                        }
                        if (_nonSerializableDefaults) {
                            value = Object.assign({}, value);
                            _nonSerializableDefaults.forEach((key: { propertyKey: string, tags: Array<string>, $default: any }) => {
                                if (typeof key.$default != 'undefined'
                                    // Equals        
                                    && (key.$default == value[key.propertyKey]
                                        // Empty array
                                        || Array.isArray(key.$default) && Array.isArray(value[key.propertyKey]) && value[key.propertyKey].length == 0
                                        // Empty object
                                        || !Array.isArray(key.$default) && (typeof key.$default == 'object') && Object.keys(value[key.propertyKey]).length == 0)) {
                                    if (tag && key.tags && key.tags.indexOf(tag) >= 0 || !key.tags) {
                                        delete value[key.propertyKey];
                                    }
                                }
                            });
                        }
                    }

                } catch (e) {

                }
                return value;
            }
        });
    }

    public static execAsyncSync(fn: () => Promise<any>, timeout?: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            setTimeout(async function () {
                if (!fn) {
                    resolve();
                } else {
                    try {
                        let result = await fn();
                        resolve(result);
                    } catch (err) {
                        reject(err.message);
                    }
                }
            }, timeout || 0);
        });
    }

    public static objectApply(thisObj: any, ...appliedObjs: any[]) {
        appliedObjs.forEach(obj => {
            Object.keys(obj).forEach(key => {
                if (obj[key]) {
                    thisObj[key] = obj[key];
                }
            });
        });
    }

    public static async execSfdxCommand(command: String,
        targetusername: String,
        killProcessOnFirstConsoleOutput: boolean = true):
        Promise<{ commandOutput: string, cliCommand: string }> {

        let commandOutput: string = "";

        let callback = (data: {
            message: string,
            isError: boolean,
            exitCode: number
        }): boolean => {
            if (!data.isError && typeof data.exitCode == "undefined" && data.message) {
                commandOutput += data.message;
            }
            if (killProcessOnFirstConsoleOutput) {
                return true;
            }
            return false;
        }
        let cliCommand = "";

        if (typeof targetusername != "undefined") {
            cliCommand = `sfdx ${command} --targetusername ${targetusername}`;
        }
        else {
            cliCommand = `sfdx ${command}`;
        }

        await ConsoleUtils.callConsoleCommand(cliCommand, callback);

        return {
            cliCommand,
            commandOutput
        };
    };

    public static async execForceOrgList(): Promise<{ orgs: Array<ForceOrgListResult>, commandOutput: string }> {
        try {
            //let responseString = SfdxUtils.execSfdx("force:org:list --json", undefined);
            let response = await AppUtils.execSfdxCommand("force:org:list --json", undefined);
            let jsonObject = JSON.parse(response.commandOutput);
            let responseObject = plainToClass(ForceOrgListCommandResponse, jsonObject, {
                enableImplicitConversion: true,
                excludeExtraneousValues: true
            });
            if (responseObject.status == 0) {
                return {
                    orgs: [
                        ...responseObject.result.nonScratchOrgs,
                        ...responseObject.result.scratchOrgs.map(x => {
                            x.isScratchOrg = true;
                            return x;
                        })],
                    commandOutput: response.commandOutput
                };
            }
        } catch (ex) {
        }
        return {
            orgs: new Array<ForceOrgListResult>(),
            commandOutput: RESOURCES.Home_Error_ExecuteSFDXFailed
        };

    }

    public static async execForceOrgDisplay(userName: string, asJson?: boolean): Promise<ForceOrgDisplayResult> {
        if (!asJson) {
            let response = await AppUtils.execSfdxCommand("force:org:display", userName);
            return this._parseForceOrgDisplayResult(response.cliCommand, response.commandOutput);
        }
        let response = await AppUtils.execSfdxCommand("force:org:display --json", userName);
        let result = new ForceOrgDisplayResult(JSON.parse(response.commandOutput));
        result.cliCommand = response.cliCommand;
        result.commandOutput = response.commandOutput;
        return result;
    }

    public static createOrgConnection(connectionData: IOrgConnectionData): any {
        return new jsforce.Connection({
            instanceUrl: connectionData.instanceUrl,
            accessToken: connectionData.accessToken,
            version: connectionData.apiVersion,
            maxRequest: CONSTANTS.MAX_CONCURRENT_PARALLEL_REQUESTS
        });
    }

    public static getStrOperation(operation: OPERATION | string): string {
        operation = typeof operation == 'undefined' || operation == null ? '' : operation;
        if ((typeof operation != "string") == true) {
            if (typeof OPERATION[operation] == 'undefined') {
                return OPERATION.Unknown.toString();
            }
            return OPERATION[operation].toString();
        }
        return operation.toString();
    }


    public static getOperation(operation: OPERATION | string): OPERATION {
        operation = typeof operation == 'undefined' || operation == null ? '' : operation;
        if ((typeof operation == "string") == true) {
            if (typeof OPERATION[operation.toString()] == 'undefined') {
                return OPERATION.Unknown;
            }
            return OPERATION[operation.toString()];
        }
        return <OPERATION>operation;
    }

    public static async queryAsync(org: Org, soql: string, useBulkQueryApi: boolean): Promise<QueryResult<object>> {

        const makeQueryAsync = (soql: string) => new Promise((resolve, reject) => {

            let conn = org.getConnection();
            let records = [];

            if (useBulkQueryApi && conn.bulk) {
                conn.bulk.pollTimeout = CONSTANTS.BULK_QUERY_API_POLL_TIMEOUT;
                conn.bulk.query(soql).on("record", function (record: any) {
                    records.push(record);
                }).on("end", function () {
                    ___fixRecords(records);
                    resolve(<QueryResult<object>>{
                        done: true,
                        records: records,
                        totalSize: records.length
                    });
                }).on("error", function (error: any) {
                    reject(error);
                });
            } else {
                let query = conn.query(soql).on("record", function (record: any) {
                    records.push(record);
                }).on("end", function () {
                    ___fixRecords(records);
                    resolve(<QueryResult<object>>{
                        done: true,
                        records: records,
                        totalSize: query.totalSize
                    });
                }).on("error", function (error: any) {
                    reject(error);
                }).run({
                    autoFetch: true,
                    maxFetch: CONSTANTS.MAX_FETCH_SIZE
                });
            }
        });

        return <QueryResult<object>>(await makeQueryAsync(soql));

        function ___fixRecords(records: Array<any>) {
            if (records.length == 0) return;
            let props = Object.keys(records[0]);
            records.forEach(record => {
                props.forEach(prop => {
                    if (record[prop] === "") {
                        record[prop] = null;
                    }
                });
                delete record.attributes;
            });
        }
    }

    public static async getOrgObjectsList(org: Org): Promise<Array<SObjectDescribe>> {
        let queryNoCustom = `SELECT QualifiedApiName, Label, DeveloperName,
                            IsEverUpdatable, IsEverCreatable, 
                            IsEverDeletable 
                        FROM EntityDefinition 
                        WHERE IsRetrieveable = true AND IsQueryable = true 
                            AND IsIdEnabled = true 
                            AND IsDeprecatedAndHidden = false and IsCustomizable = false`;

        let queryWithCustom = `SELECT QualifiedApiName, Label, DeveloperName,
                        IsEverUpdatable, IsEverCreatable, 
                        IsEverDeletable 
                    FROM EntityDefinition 
                    WHERE IsRetrieveable = true AND IsQueryable = true 
                        AND IsIdEnabled = true 
                        AND IsDeprecatedAndHidden = false and IsCustomizable = true`;                   
        let recordsWithNoCustom = await this.queryAsync(org, queryNoCustom, false);
        let recordsWithCustom = await this.queryAsync(org, queryWithCustom, false);
        let records = [...recordsWithNoCustom.records, ...recordsWithCustom.records];
        return records.filter((record: any) => {
            return (record.IsEverUpdatable && 
                    record.IsEverCreatable && 
                    record.IsEverDeletable)
                    || record.QualifiedApiName == 'RecordType'
        })
        .sort((a, b) => b.QualifiedApiName - a.QualifiedApiName)
        .map((record: any) => {
            return new SObjectDescribe({
                label: String(record["Label"]),
                name: String(record["QualifiedApiName"]),
                createable: true,
                updateable: true,
                custom: this.isCustomObject(String(record["QualifiedApiName"]))
            });
        });
    }

    public static async describeSObjectAsync(org: Org, objectName: string, sObjectDescribe?: SObjectDescribe): Promise<SObjectDescribe> {

        var conn = org.getConnection();

        const describeAsync = (name: string) => new Promise((resolve, reject) =>
            conn.sobject(name).describe(function (err: any, meta: any) {
                if (err)
                    reject(err);
                else
                    resolve(meta);
            }));

        let describeResult: DescribeSObjectResult = <DescribeSObjectResult>(await describeAsync(objectName));
        sObjectDescribe = sObjectDescribe || new SObjectDescribe({
            name: objectName,
            createable: describeResult.createable,
            custom: describeResult.custom,
            label: describeResult.label,
            updateable: describeResult.createable && describeResult.updateable
        });
        describeResult.fields.forEach((field: any) => {
            let f = new SFieldDescribe({
                name: field.name,
                objectName: objectName,
                nameField: field.nameField,
                unique: field.unique,
                type: field.type,
                label: field.label,
                custom: field.custom,
                updateable: field.updateable,
                autoNumber: field["autoNumber"],
                creatable: field.createable,
                calculated: field.calculated,
                cascadeDelete: field.cascadeDelete,
                lookup: field.referenceTo != null && field.referenceTo.length > 0,
                referencedObjectType: field.referenceTo[0],
                namePointing: field.namePointing,
                referenceTo: field.referenceTo
            });
            sObjectDescribe.fieldsMap.set(f.name, f);
        });
        return sObjectDescribe;
    };

    public static async connectOrg(org: Org): Promise<void> {
        let result = await this.execForceOrgDisplay(org.orgName);
        if (result.isConnected) {
            org.instanceUrl = result.InstanceUrl;
            org.accessToken = result.AccessToken;
        } else {
            throw new Error(RESOURCES.Home_Error_UnableToConnect);
        }
    }

    public static isCustomObject(objectName: string): boolean {
        if (!objectName) return false;
        return objectName.endsWith('__c')
            || objectName.endsWith('__pc')
            || objectName.endsWith('__s');
    }

    public static isEquals(object1: any, object2: any): boolean {
        return deepEqual(object1, object2);
    }

    public static intersect(array1: any[], array2: any[], propertyName: string): any[] {
        return array1.filter(function (obj1) {
            return array2.some(function (obj2) {
                return obj2[propertyName] == obj1[propertyName];
            });
        });
    }

    public static exclude(array1: any[], array2: any[], propertyName?: string): any[] {
        return array1.filter(function (obj1) {
            return !array2.some(function (obj2) {
                if (typeof obj2 == 'object' && typeof obj1 == 'object')
                    return obj2[propertyName] == obj1[propertyName];
                return obj2 == obj1;
            });
        });
    }

    public static objectAssignSafeDefined(target: any, ...sources: Array<any>): any {
        for (const source of sources) {
            for (const key of Object.keys(source)) {
                const val = source[key];
                if (val !== undefined && val != null) {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    public static objectAssignSafe(target: any, source: any): any {
        Object.getOwnPropertyNames(source).forEach(function (prop) {
            Object.defineProperty(
                target,
                prop,
                Object.getOwnPropertyDescriptor(source, prop)
            );
        });
        return target;
    }

    public static removeBy(array: Array<any>, propertyName: string, propertyValue: string) {
        if (!array) return array;
        return array.filter(it => it[propertyName] != propertyValue);
    }

    public static remove(array: Array<any>, item: any) {
        if (!array) return array;
        return array.filter(it => it != item);
    }

    public static distinctArray<T>(array: Array<T>, propName: string): Array<T> {
        if (!array) return array;
        var resArr = [];
        array.forEach(item => {
            if (!resArr.some(x => x[propName] == item[propName])) {
                resArr.push(item);
            }
        });
        return resArr;
    }

    public static uniqueArray(array: Array<any>): Array<any> {
        if (!array) return array;
        return [...new Set(array)];
    }

    public static sortArray(array: Array<any>, ...propNames: string[]): Array<any> {
        // --------------- Local functions ------------------- // 
        const ___fieldSorter = (propNames: Array<string>) => (a: any, b: any) => propNames.map(propName => {
            let dir = 1;
            if (propName[0] === '-') { dir = -1; propName = propName.substring(1); }
            return a[propName] > b[propName] || (String(a[propName]) || "").startsWith("**") ? dir : a[propName] < b[propName] ? -(dir) : 0;
        }).reduce((p, n) => p ? p : n, 0);

        if (!array) return array;
        return array.sort(___fieldSorter(propNames));
    }

    public static selectFolder(defaultPath: string): string[] {
        let options = <OpenDialogSyncOptions>{
            properties: ["openDirectory"],
            defaultPath
        };
        return dialog.showOpenDialogSync(options);
    }

    public static readPackageJson(): IPackageJson {
        let filePath = path.join(process.cwd(), 'package.json');
        let jsonObj: IPackageJson = require(filePath);
        return jsonObj;
    }

    public static readUserJson(): IAppSettings {
        let filePath = path.join(process.cwd(), CONSTANTS.USER_SETTINGS_FILE_NAME);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '{}');
        }
        let jsonObj: IAppSettings = require(filePath);
        return jsonObj;
    }

    public static writeUserJson(settings: IAppSettings): void {
        let filePath = path.join(process.cwd(), CONSTANTS.USER_SETTINGS_FILE_NAME);
        fs.writeFileSync(filePath, AppUtils.pretifyJson(settings));
    }

    public static async readRemoveJsonAsync(url: string): Promise<any> {
        return new Promise((resolve) => {
            request({
                url,
                json: true
            }, function (error: any, response: any, body: any) {
                if (!error && response.statusCode === 200) {
                    resolve(body);
                    return;
                }
                resolve({});
            });
        });
    }

    public static async copyDirAsync(source: string, destination: string): Promise<void> {
        return new Promise((resolve, reject) => {
            ncp.limit = 16;
            AppUtils.emptyDirs([destination]);
            ncp(source, destination, function (err: any) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public static deleteDirs(filePaths: string[]) {
        filePaths.forEach(path => {
            fse.removeSync(path);
        });
    }

    public static emptyDirs(filePaths: string[]) {
        filePaths.forEach(path => {
            if (fs.existsSync(path))
                fse.emptyDirSync(path);
        });
    }

    public static openExplorer(filePath: string) {
        openExplorer(filePath);
    }

    public static getListOfDirs(filePath: string): IFileEntry[] {
        if (!fs.existsSync(filePath)) return new Array<IFileEntry>();
        return readdirSync(filePath, { withFileTypes: true })
            .filter((dirent: any) => dirent.isDirectory())
            .map((dirent: any) => {
                return <IFileEntry>{
                    name: dirent.name,
                    fullPath: path.join(filePath, dirent.name),
                    isDirectory: true
                }
            });
    }

    public static textToHtmlString(text: string): string {
        return text.replace(new RegExp('\n', 'gi'), "<br/>").replace(/\r/g, '').replace(/\s/g, '&nbsp;');
    }

    public static pretifyJson(json: any): string {
        if (typeof json == 'string') {
            return JSON.stringify(JSON.parse(json), null, 4);
        }
        return JSON.stringify(json, null, 4);
    }

    public static transposeArray(array: Array<any>): any {
        if (!array) return {};
        let result = {};
        for (let row of array) {
            for (let [key, value] of Object.entries(row)) {
                result[key] = result[key] || [];
                result[key].push(value);
            }
        }
        return result;
    }

    public static transposeArrayMany(array: Array<any>, headerName: string, valuesArrayNamne: string): Array<any> {
        if (!array || array.length == 0) return [];
        let items = [];
        let propIndex = {};
        for (let prop in array[0]) {
            propIndex[prop] = items.length;
            items.push({
                [headerName]: prop,
                [valuesArrayNamne]: []
            })
        }
        array.forEach((item, index) => {
            for (let prop in item) {
                items[propIndex[prop]][valuesArrayNamne].push(item[prop]);
            }
        });
        return items;
    }


    /**
     * Pivot the array
     *
     * @static
     * @param {Array<any>} array Array to be converted
     * @param {number} rowIndex Index of column in array which is to be kept as first column
     * @param {number} colIndex Index of column whose values to be converted as columns in the output array
     * @param {number} dataIndex Index of column whose values to be used as data (displayed in tabular/grid format)
     * @returns {Array<any>}
     * @memberof AppUtils
     */
    public static getPivotArray(array: Array<any>, rowIndex: number, colIndex: number, dataIndex: number): Array<any> {
        var result = {}, ret = [];
        var newCols = [];
        for (var i = 0; i < array.length; i++) {

            if (!result[array[i][rowIndex]]) {
                result[array[i][rowIndex]] = {};
            }
            result[array[i][rowIndex]][array[i][colIndex]] = array[i][dataIndex];

            //To get column names
            if (newCols.indexOf(array[i][colIndex]) == -1) {
                newCols.push(array[i][colIndex]);
            }
        }

        newCols.sort();
        var item = [];

        //Add Header Row
        item.push('Item');
        item.push.apply(item, newCols);
        ret.push(item);

        //Add content 
        for (var key in result) {
            item = [];
            item.push(key);
            for (var i = 0; i < newCols.length; i++) {
                item.push(result[key][newCols[i]] || "-");
            }
            ret.push(item);
        }
        return ret;
    }

    public static searchClosest(itemToSearchFor: string, arrayToSearchIn: Array<string>): string {
        if (!itemToSearchFor) return itemToSearchFor;
        return closest(itemToSearchFor, arrayToSearchIn);
    }

    public static createSoqlKeywords(query: string, ...keywords: string[]): {
        query: string,
        keywords: Array<string>
    } {

        keywords = keywords && keywords.length > 0 ? keywords : CONSTANTS.SOQL_KEYWRDS;

        keywords = keywords.map(keyword => {
            let regex = keyword.split('|')[0];
            let key = keyword.split('|')[1];
            query = query.replace(new RegExp(regex, 'gi'), key);
            return key;
        });
        return {
            query,
            keywords
        };
    }

    public static parseSoql(soqlKeywords: {
        query: string,
        keywords: Array<string>
    }): Array<{
        index: number,
        word: string,
        text?: string
    }> {
        var found = new Array<{
            index: number,
            word: string,
            text?: string
        }>();
        soqlKeywords.keywords.forEach(function (word) {
            var idx = soqlKeywords.query.indexOf(word);

            while (idx !== -1) {
                found.push({
                    word: word,
                    index: idx
                });
                idx = soqlKeywords.query.indexOf(word, idx + 1);
            }
        });
        found.sort(function (x, y) { return x.index - y.index });
        found.forEach(function (x, i, xs) {
            if (i < xs.length - 1) {
                x.text = soqlKeywords.query.substring(x.index, xs[i + 1].index).replace(xs[i].word, "").trim();
            } else {
                x.text = soqlKeywords.query.substring(x.index).replace(xs[i].word, "").trim();
            }
        });
        return found;
    }

    public static listEnum(enumType: any): string[] {
        return Object.keys(enumType).filter(key => !isNaN(Number(enumType[key])));
    }

    public static sleepAsync(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    // ------------------------ Private members --------------------------------//
    private static _parseForceOrgDisplayResult(cliCommand: string, commandResult: string): ForceOrgDisplayResult {
        if (!commandResult) return null;
        let lines = commandResult.split('\n');
        let output: ForceOrgDisplayResult = new ForceOrgDisplayResult();
        output.commandOutput = commandResult;
        output.cliCommand = cliCommand;
        lines.forEach(line => {
            if (line.startsWith("Access Token"))
                output.AccessToken = line.split(' ').pop();
            if (line.startsWith("Client Id"))
                output.ClientId = line.split(' ').pop();
            if (line.startsWith("Connected Status"))
                output.ConnectedStatus = line.split(' ').pop();
            if (line.startsWith("Status"))
                output.Status = line.split(' ').pop();
            if (line.startsWith("Id"))
                output.OrgId = line.split(' ').pop();
            if (line.startsWith("Instance Url"))
                output.InstanceUrl = line.split(' ').pop();
            if (line.startsWith("Username"))
                output.Username = line.split(' ').pop();
        });
        return output;
    };

}

