"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppUtils = exports.NonSerializableIfDefault = exports.NonSerializable = exports.SerializableGetter = void 0;
const stringify = require("json-stringify");
const consoleUtils_1 = require("./consoleUtils");
require("reflect-metadata");
require("es6-shim");
const class_transformer_1 = require("class-transformer");
const helper_classes_1 = require("./helper_classes");
const statics_1 = require("./statics");
const sobjectDescribe_1 = require("../models/sobjectDescribe");
const jsforce = require("jsforce");
const deep_equal_1 = __importDefault(require("deep-equal"));
const sfieldDescribe_1 = require("../models/sfieldDescribe");
const resources_1 = require("./resources");
const path_1 = __importDefault(require("path"));
const fs = require("fs");
let dialog = require('electron').remote.dialog;
let ncp = require('ncp').ncp;
const openExplorer = require('open-file-explorer');
const fse = require('fs-extra');
const { readdirSync } = require('fs');
const { distance, closest } = require('fastest-levenshtein');
var request = require("request");
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
};
//////////////////////////////////////////////
// Decorators ////////////////////////////////
//////////////////////////////////////////////
function SerializableGetter(tags) {
    return function (target, propertyKey, descriptor) {
        let enumProperty = "____emum____" + String(propertyKey);
        let p = Object.getOwnPropertyDescriptor(target, '_serializableKeys');
        if (!p) {
            Object.defineProperty(target, "_serializableKeys", {
                enumerable: false,
                value: [{ propertyKey, enumProperty, tags }],
                writable: true
            });
        }
        else {
            target["_serializableKeys"].push({ propertyKey, enumProperty, tags });
        }
        if (descriptor) {
            descriptor.enumerable = true;
            Object.defineProperty(target, enumProperty, descriptor);
        }
    };
}
exports.SerializableGetter = SerializableGetter;
function NonSerializable(tags) {
    return function (target, propertyKey) {
        let p = Object.getOwnPropertyDescriptor(target, '_nonSerializableKeys');
        if (!p) {
            Object.defineProperty(target, "_nonSerializableKeys", {
                enumerable: false,
                value: [{ propertyKey, tags }],
                writable: true
            });
        }
        else {
            target["_nonSerializableKeys"].push({ propertyKey, tags });
        }
    };
}
exports.NonSerializable = NonSerializable;
function NonSerializableIfDefault($default, tags) {
    return function (target, propertyKey) {
        let p = Object.getOwnPropertyDescriptor(target, '_nonSerializableDefaults');
        if (!p) {
            Object.defineProperty(target, "_nonSerializableDefaults", {
                enumerable: false,
                value: [{ propertyKey, tags, $default }],
                writable: true
            });
        }
        else {
            target["_nonSerializableDefaults"].push({ propertyKey, tags, $default });
        }
    };
}
exports.NonSerializableIfDefault = NonSerializableIfDefault;
//////////////////////////////////////////////
// Utilities /////////////////////////////////
//////////////////////////////////////////////
class AppUtils {
    static makeId(length = 10) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    static stringifyObj(obj, tag) {
        return stringify(obj, (key, value) => {
            if (value instanceof Map) {
                let obj = Object.create(null);
                for (let [k, v] of value) {
                    obj[k] = v;
                }
                return obj;
            }
            else {
                try {
                    if (typeof value == 'object') {
                        let _serializableKeys = value.__proto__ && value.__proto__._serializableKeys;
                        let _nonSerializableKeys = value.__proto__ && value.__proto__._nonSerializableKeys;
                        let _nonSerializableDefaults = value.__proto__ && value.__proto__._nonSerializableDefaults;
                        if (_serializableKeys) {
                            let values = {};
                            _serializableKeys.forEach((key) => {
                                values[key.propertyKey] = value[key.enumProperty];
                            });
                            value = Object.assign({}, value);
                            _serializableKeys.forEach((key) => {
                                if (typeof values[key.propertyKey] != 'undefined') {
                                    if (!key.tags || key.tags.length == 0 || key.tags.indexOf(tag) >= 0)
                                        value[key.propertyKey] = values[key.propertyKey];
                                }
                                delete value[key.enumProperty];
                            });
                        }
                        if (_nonSerializableKeys) {
                            value = Object.assign({}, value);
                            _nonSerializableKeys.forEach((key) => {
                                if (tag && key.tags) {
                                    if (key.tags.indexOf(tag) >= 0) {
                                        delete value[key.propertyKey];
                                    }
                                }
                                else {
                                    if (!key.tags || key.tags.length == 0) {
                                        delete value[key.propertyKey];
                                    }
                                }
                            });
                        }
                        if (_nonSerializableDefaults) {
                            value = Object.assign({}, value);
                            _nonSerializableDefaults.forEach((key) => {
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
                }
                catch (e) {
                }
                return value;
            }
        });
    }
    static execAsyncSync(fn, timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!fn) {
                        resolve();
                    }
                    else {
                        try {
                            let result = yield fn();
                            resolve(result);
                        }
                        catch (err) {
                            reject(err.message);
                        }
                    }
                });
            }, timeout || 0);
        });
    }
    static objectApply(thisObj, ...appliedObjs) {
        appliedObjs.forEach(obj => {
            Object.keys(obj).forEach(key => {
                if (obj[key]) {
                    thisObj[key] = obj[key];
                }
            });
        });
    }
    static execSfdxCommand(command, targetusername, killProcessOnFirstConsoleOutput = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let commandOutput = "";
            let callback = (data) => {
                if (!data.isError && typeof data.exitCode == "undefined" && data.message) {
                    commandOutput += data.message;
                }
                if (killProcessOnFirstConsoleOutput) {
                    return true;
                }
                return false;
            };
            let cliCommand = "";
            if (typeof targetusername != "undefined") {
                cliCommand = `sfdx ${command} --targetusername ${targetusername}`;
            }
            else {
                cliCommand = `sfdx ${command}`;
            }
            yield consoleUtils_1.ConsoleUtils.callConsoleCommand(cliCommand, callback);
            return {
                cliCommand,
                commandOutput
            };
        });
    }
    ;
    static execForceOrgList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //let responseString = SfdxUtils.execSfdx("force:org:list --json", undefined);
                let response = yield AppUtils.execSfdxCommand("force:org:list --json", undefined);
                let jsonObject = JSON.parse(response.commandOutput);
                let responseObject = class_transformer_1.plainToClass(helper_classes_1.ForceOrgListCommandResponse, jsonObject, {
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
                            })
                        ],
                        commandOutput: response.commandOutput
                    };
                }
            }
            catch (ex) {
            }
            return {
                orgs: new Array(),
                commandOutput: resources_1.RESOURCES.Home_Error_ExecuteSFDXFailed
            };
        });
    }
    static execForceOrgDisplay(userName, asJson) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!asJson) {
                let response = yield AppUtils.execSfdxCommand("force:org:display", userName);
                return this._parseForceOrgDisplayResult(response.cliCommand, response.commandOutput);
            }
            let response = yield AppUtils.execSfdxCommand("force:org:display --json", userName);
            let result = new helper_classes_1.ForceOrgDisplayResult(JSON.parse(response.commandOutput));
            result.cliCommand = response.cliCommand;
            result.commandOutput = response.commandOutput;
            return result;
        });
    }
    static createOrgConnection(connectionData) {
        return new jsforce.Connection({
            instanceUrl: connectionData.instanceUrl,
            accessToken: connectionData.accessToken,
            version: connectionData.apiVersion,
            maxRequest: statics_1.CONSTANTS.MAX_CONCURRENT_PARALLEL_REQUESTS
        });
    }
    static getStrOperation(operation) {
        operation = typeof operation == 'undefined' || operation == null ? '' : operation;
        if ((typeof operation != "string") == true) {
            if (typeof statics_1.OPERATION[operation] == 'undefined') {
                return statics_1.OPERATION.Unknown.toString();
            }
            return statics_1.OPERATION[operation].toString();
        }
        return operation.toString();
    }
    static getOperation(operation) {
        operation = typeof operation == 'undefined' || operation == null ? '' : operation;
        if ((typeof operation == "string") == true) {
            if (typeof statics_1.OPERATION[operation.toString()] == 'undefined') {
                return statics_1.OPERATION.Unknown;
            }
            return statics_1.OPERATION[operation.toString()];
        }
        return operation;
    }
    static queryAsync(org, soql, useBulkQueryApi) {
        return __awaiter(this, void 0, void 0, function* () {
            const makeQueryAsync = (soql) => new Promise((resolve, reject) => {
                let conn = org.getConnection();
                let records = [];
                if (useBulkQueryApi && conn.bulk) {
                    conn.bulk.pollTimeout = statics_1.CONSTANTS.BULK_QUERY_API_POLL_TIMEOUT;
                    conn.bulk.query(soql).on("record", function (record) {
                        records.push(record);
                    }).on("end", function () {
                        ___fixRecords(records);
                        resolve({
                            done: true,
                            records: records,
                            totalSize: records.length
                        });
                    }).on("error", function (error) {
                        reject(error);
                    });
                }
                else {
                    let query = conn.query(soql).on("record", function (record) {
                        records.push(record);
                    }).on("end", function () {
                        ___fixRecords(records);
                        resolve({
                            done: true,
                            records: records,
                            totalSize: query.totalSize
                        });
                    }).on("error", function (error) {
                        reject(error);
                    }).run({
                        autoFetch: true,
                        maxFetch: statics_1.CONSTANTS.MAX_FETCH_SIZE
                    });
                }
            });
            return (yield makeQueryAsync(soql));
            function ___fixRecords(records) {
                if (records.length == 0)
                    return;
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
        });
    }
    static getOrgObjectsList(org) {
        return __awaiter(this, void 0, void 0, function* () {
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
            let recordsWithNoCustom = yield this.queryAsync(org, queryNoCustom, false);
            let recordsWithCustom = yield this.queryAsync(org, queryWithCustom, false);
            let records = [...recordsWithNoCustom.records, ...recordsWithCustom.records];
            return records.filter((record) => {
                return (record.IsEverUpdatable &&
                    record.IsEverCreatable &&
                    record.IsEverDeletable)
                    || record.QualifiedApiName == 'RecordType';
            })
                .sort((a, b) => b.QualifiedApiName - a.QualifiedApiName)
                .map((record) => {
                return new sobjectDescribe_1.SObjectDescribe({
                    label: String(record["Label"]),
                    name: String(record["QualifiedApiName"]),
                    createable: true,
                    updateable: true,
                    custom: this.isCustomObject(String(record["QualifiedApiName"]))
                });
            });
        });
    }
    static describeSObjectAsync(org, objectName, sObjectDescribe) {
        return __awaiter(this, void 0, void 0, function* () {
            var conn = org.getConnection();
            const describeAsync = (name) => new Promise((resolve, reject) => conn.sobject(name).describe(function (err, meta) {
                if (err)
                    reject(err);
                else
                    resolve(meta);
            }));
            let describeResult = (yield describeAsync(objectName));
            sObjectDescribe = sObjectDescribe || new sobjectDescribe_1.SObjectDescribe({
                name: objectName,
                createable: describeResult.createable,
                custom: describeResult.custom,
                label: describeResult.label,
                updateable: describeResult.createable && describeResult.updateable
            });
            describeResult.fields.forEach((field) => {
                let f = new sfieldDescribe_1.SFieldDescribe({
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
        });
    }
    ;
    static connectOrg(org) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.execForceOrgDisplay(org.orgName);
            if (result.isConnected) {
                org.instanceUrl = result.InstanceUrl;
                org.accessToken = result.AccessToken;
            }
            else {
                throw new Error(resources_1.RESOURCES.Home_Error_UnableToConnect);
            }
        });
    }
    static isCustomObject(objectName) {
        if (!objectName)
            return false;
        return objectName.endsWith('__c')
            || objectName.endsWith('__pc')
            || objectName.endsWith('__s');
    }
    static isEquals(object1, object2) {
        return deep_equal_1.default(object1, object2);
    }
    static intersect(array1, array2, propertyName) {
        return array1.filter(function (obj1) {
            return array2.some(function (obj2) {
                return obj2[propertyName] == obj1[propertyName];
            });
        });
    }
    static exclude(array1, array2, propertyName) {
        return array1.filter(function (obj1) {
            return !array2.some(function (obj2) {
                if (typeof obj2 == 'object' && typeof obj1 == 'object')
                    return obj2[propertyName] == obj1[propertyName];
                return obj2 == obj1;
            });
        });
    }
    static objectAssignSafeDefined(target, ...sources) {
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
    static objectAssignSafe(target, source) {
        Object.getOwnPropertyNames(source).forEach(function (prop) {
            Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
        });
        return target;
    }
    static removeBy(array, propertyName, propertyValue) {
        if (!array)
            return array;
        return array.filter(it => it[propertyName] != propertyValue);
    }
    static remove(array, item) {
        if (!array)
            return array;
        return array.filter(it => it != item);
    }
    static distinctArray(array, propName) {
        if (!array)
            return array;
        var resArr = [];
        array.forEach(item => {
            if (!resArr.some(x => x[propName] == item[propName])) {
                resArr.push(item);
            }
        });
        return resArr;
    }
    static uniqueArray(array) {
        if (!array)
            return array;
        return [...new Set(array)];
    }
    static sortArray(array, ...propNames) {
        // --------------- Local functions ------------------- // 
        const ___fieldSorter = (propNames) => (a, b) => propNames.map(propName => {
            let dir = 1;
            if (propName[0] === '-') {
                dir = -1;
                propName = propName.substring(1);
            }
            return a[propName] > b[propName] || (String(a[propName]) || "").startsWith("**") ? dir : a[propName] < b[propName] ? -(dir) : 0;
        }).reduce((p, n) => p ? p : n, 0);
        if (!array)
            return array;
        return array.sort(___fieldSorter(propNames));
    }
    static selectFolder(defaultPath) {
        let options = {
            properties: ["openDirectory"],
            defaultPath
        };
        return dialog.showOpenDialogSync(options);
    }
    static readPackageJson() {
        let filePath = path_1.default.join(process.cwd(), 'package.json');
        let jsonObj = require(filePath);
        return jsonObj;
    }
    static readUserJson() {
        let filePath = path_1.default.join(process.cwd(), statics_1.CONSTANTS.USER_SETTINGS_FILE_NAME);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '{}');
        }
        let jsonObj = require(filePath);
        return jsonObj;
    }
    static writeUserJson(settings) {
        let filePath = path_1.default.join(process.cwd(), statics_1.CONSTANTS.USER_SETTINGS_FILE_NAME);
        fs.writeFileSync(filePath, AppUtils.pretifyJson(settings));
    }
    static readRemoveJsonAsync(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                request({
                    url,
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        resolve(body);
                        return;
                    }
                    resolve({});
                });
            });
        });
    }
    static copyDirAsync(source, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                ncp.limit = 16;
                AppUtils.emptyDirs([destination]);
                ncp(source, destination, function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
        });
    }
    static deleteDirs(filePaths) {
        filePaths.forEach(path => {
            fse.removeSync(path);
        });
    }
    static emptyDirs(filePaths) {
        filePaths.forEach(path => {
            if (fs.existsSync(path))
                fse.emptyDirSync(path);
        });
    }
    static openExplorer(filePath) {
        openExplorer(filePath);
    }
    static getListOfDirs(filePath) {
        if (!fs.existsSync(filePath))
            return new Array();
        return readdirSync(filePath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => {
            return {
                name: dirent.name,
                fullPath: path_1.default.join(filePath, dirent.name),
                isDirectory: true
            };
        });
    }
    static textToHtmlString(text) {
        return text.replace(new RegExp('\n', 'gi'), "<br/>").replace(/\r/g, '').replace(/\s/g, '&nbsp;');
    }
    static pretifyJson(json) {
        if (typeof json == 'string') {
            return JSON.stringify(JSON.parse(json), null, 4);
        }
        return JSON.stringify(json, null, 4);
    }
    static transposeArray(array) {
        if (!array)
            return {};
        let result = {};
        for (let row of array) {
            for (let [key, value] of Object.entries(row)) {
                result[key] = result[key] || [];
                result[key].push(value);
            }
        }
        return result;
    }
    static transposeArrayMany(array, headerName, valuesArrayNamne) {
        if (!array || array.length == 0)
            return [];
        let items = [];
        let propIndex = {};
        for (let prop in array[0]) {
            propIndex[prop] = items.length;
            items.push({
                [headerName]: prop,
                [valuesArrayNamne]: []
            });
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
    static getPivotArray(array, rowIndex, colIndex, dataIndex) {
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
    static searchClosest(itemToSearchFor, arrayToSearchIn) {
        if (!itemToSearchFor)
            return itemToSearchFor;
        return closest(itemToSearchFor, arrayToSearchIn);
    }
    static createSoqlKeywords(query, ...keywords) {
        keywords = keywords && keywords.length > 0 ? keywords : statics_1.CONSTANTS.SOQL_KEYWRDS;
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
    static parseSoql(soqlKeywords) {
        var found = new Array();
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
        found.sort(function (x, y) { return x.index - y.index; });
        found.forEach(function (x, i, xs) {
            if (i < xs.length - 1) {
                x.text = soqlKeywords.query.substring(x.index, xs[i + 1].index).replace(xs[i].word, "").trim();
            }
            else {
                x.text = soqlKeywords.query.substring(x.index).replace(xs[i].word, "").trim();
            }
        });
        return found;
    }
    static listEnum(enumType) {
        return Object.keys(enumType).filter(key => !isNaN(Number(enumType[key])));
    }
    static sleepAsync(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // ------------------------ Private members --------------------------------//
    static _parseForceOrgDisplayResult(cliCommand, commandResult) {
        if (!commandResult)
            return null;
        let lines = commandResult.split('\n');
        let output = new helper_classes_1.ForceOrgDisplayResult();
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
    }
    ;
}
exports.AppUtils = AppUtils;
//# sourceMappingURL=appUtils.js.map