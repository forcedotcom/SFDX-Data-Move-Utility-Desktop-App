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
exports.Database = exports.NedbError = void 0;
const Datastore = require("nedb");
const fs = require("fs");
const mkdir_recursive_1 = __importDefault(require("mkdir-recursive"));
const path_1 = __importDefault(require("path"));
const statics_1 = require("./statics");
class NedbError extends Error {
}
exports.NedbError = NedbError;
/**
 * The local json database manager
 *
 * @export
 * @class Database
 */
class Database {
    constructor(filename, subPath, basePath) {
        this.filePath = path_1.default.join(basePath, subPath);
        if (!fs.existsSync(this.filePath)) {
            mkdir_recursive_1.default.mkdirSync(this.filePath);
        }
        this.filenameWithoutPath = filename + statics_1.CONSTANTS.DB_FILE_EXTENSION;
        this.filename = path_1.default.join(this.filePath, this.filenameWithoutPath);
        this.datastore = new Datastore({
            filename: this.filename,
            timestampData: true
        });
    }
    /**
     * Load database file
     *
     * @returns {Promise<void>}
     * @memberof Database
     */
    loadAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.datastore.loadDatabase(function (err) {
                    if (!err) {
                        resolve();
                    }
                    else {
                        reject(err);
                    }
                });
            });
        });
    }
    /**
     * Compact database json file
     *
     * @returns {Promise<void>}
     * @memberof Database
     */
    compactAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.datastore.persistence.compactDatafile();
                this.datastore.on("compaction.done", function () {
                    resolve();
                });
            });
        });
    }
    /**
     * Insert new object into database
     *
     * @param {(object | object[])} objectsToInsert Object to insert
     * @returns {Promise<IReturn>}
     * @memberof Database
     */
    insertAsync(objectsToInsert) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.datastore.insert(objectsToInsert, function (err, ret) {
                    resolve({
                        data: ret,
                        error: err,
                    });
                });
            });
        });
    }
    /**
     * Returns the filename of the database file including path
     *
     * @returns {string}
     * @memberof Database
     */
    getFilename() {
        return this.filename;
    }
    /**
     * Returns the filename only of the database file
     *
     * @returns {string}
     * @memberof Database
     */
    getFilenameWithoutPath() {
        return this.filenameWithoutPath;
    }
    /**
     * returns the directory to the database file
     *
     * @returns {string}
     * @memberof Database
     */
    getFilepath() {
        return this.filePath;
    }
    /**
     * Performs update / upsert
     * @param queryToUpdate ex. { a : 1 } => returns { a : 1, s : 2 }
     * @param updateWith { s : 5 } => updates to { a : 1, s : 5 }
     * @param params parameters
     */
    updateAsync(queryToUpdate, updateWith, params) {
        return __awaiter(this, void 0, void 0, function* () {
            updateWith = { $set: updateWith };
            const options = {
                multi: params && params.multi || true,
                upsert: params && params.upsert || false,
                returnUpdatedDocs: true,
            };
            return new Promise((resolve) => {
                this.datastore.update(queryToUpdate, updateWith, options, function (err, numAffected, affectedDocuments, upsert) {
                    resolve({
                        error: err,
                        numAffected,
                        affectedDocuments,
                        upsert,
                    });
                });
            });
        });
    }
    /**
     * Performs query
     * @param query ex. { a : 1 }
     * @param fieldsToReturn ex. { a : 1, b : 1 } => to return, { a : 0, b : 0 } => to omit
     * @param params
     */
    queryAsync(query, fieldsToReturn, params) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.keys(fieldsToReturn).forEach(key => {
                fieldsToReturn[key] = +fieldsToReturn[key];
            });
            params = params && params || {
                sort: { createdAt: 1 },
            };
            return new Promise((resolve) => {
                try {
                    this.datastore.find(query)
                        .projection(fieldsToReturn)
                        .sort(params.sort)
                        .skip(params.skip)
                        .limit(params.limit)
                        .exec(function (err, ret) {
                        resolve({
                            data: ret,
                            error: err,
                        });
                    });
                }
                catch (e) {
                    return {
                        data: [],
                        error: null
                    };
                }
            });
        });
    }
    /**
     * Performs delete
     * @param queryToDelete ex. { a : 1 }
     * @param multi if  want to remove all matched records or only first one
     */
    deleteAsync(queryToDelete, multi = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                multi,
            };
            return new Promise((resolve) => {
                this.datastore.remove(queryToDelete, params, function (err, numRemoved) {
                    resolve({
                        numRemoved,
                        error: err,
                    });
                });
            });
        });
    }
}
exports.Database = Database;
//# sourceMappingURL=db.js.map