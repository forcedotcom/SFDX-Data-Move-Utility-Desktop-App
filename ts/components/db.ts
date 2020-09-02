/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


import Datastore = require("nedb");
import fs = require('fs');
import mkdir from 'mkdir-recursive';
import path from "path";
import { CONSTANTS } from "./statics";

export class NedbError extends Error {
    public errorType: string;
    public key: string;
    public message: string;
}

export interface IReturn {
    data: object | object[];
    error: NedbError;
}

export interface IUpdateReturn {
    error: NedbError;
    numAffected: number;
    affectedDocuments: object[];
    upsert: boolean;
}

export interface IRemoveReturn {
    error: NedbError;
    numRemoved: number;
}

export interface IQueryParameters {
    sort?: object;
    skip?: number;
    limit?: number;
}

export interface IUpdateParameters {
    upsert?: boolean;
    multi?: boolean;
}

/**
 * The local json database manager
 *
 * @export
 * @class Database
 */
export class Database {

    private datastore: Datastore;
    private filename: string;
    private filenameWithoutPath: string;
    private filePath: string;

    constructor(filename: string, subPath: string, basePath: string) {
        
        this.filePath = path.join(basePath, subPath);

        if (!fs.existsSync(this.filePath)) {
            mkdir.mkdirSync(this.filePath);
        }
        this.filenameWithoutPath = filename + CONSTANTS.DB_FILE_EXTENSION;
        this.filename = path.join(this.filePath, this.filenameWithoutPath);

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
    public async loadAsync(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.datastore.loadDatabase(function (err) {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * Compact database json file
     *
     * @returns {Promise<void>}
     * @memberof Database
     */
    public async compactAsync(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.datastore.persistence.compactDatafile();
            this.datastore.on("compaction.done", function () {
                resolve();
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
    public async insertAsync(objectsToInsert: object | object[]): Promise<IReturn> {
        return new Promise<IReturn>((resolve) => {
            this.datastore.insert(objectsToInsert, function (err, ret) {
                resolve({
                    data: ret,
                    error: err as NedbError,
                } as IReturn);
            });
        });
    }

    /**
     * Returns the filename of the database file including path
     *
     * @returns {string}
     * @memberof Database
     */
    public getFilename(): string {
        return this.filename;
    }

    /**
     * Returns the filename only of the database file
     *
     * @returns {string}
     * @memberof Database
     */
    public getFilenameWithoutPath(): string {
        return this.filenameWithoutPath;
    }


    /**
     * returns the directory to the database file
     *
     * @returns {string}
     * @memberof Database
     */
    public getFilepath(): string {
        return this.filePath;
    }

    /**
     * Performs update / upsert
     * @param queryToUpdate ex. { a : 1 } => returns { a : 1, s : 2 }
     * @param updateWith { s : 5 } => updates to { a : 1, s : 5 }
     * @param params parameters
     */
    public async updateAsync(queryToUpdate: object, updateWith: object, params?: IUpdateParameters): Promise<IUpdateReturn> {
        updateWith = { $set: updateWith };
        const options = {
            multi: params && params.multi || true,
            upsert: params && params.upsert || false,
            returnUpdatedDocs: true,
        };
        return new Promise<IUpdateReturn>((resolve) => {
            this.datastore.update(queryToUpdate, updateWith, options, function (err, numAffected, affectedDocuments, upsert) {
                resolve({
                    error: err as NedbError,
                    numAffected,
                    affectedDocuments,
                    upsert,
                } as IUpdateReturn);
            });
        });
    }

    /**
     * Performs query
     * @param query ex. { a : 1 }
     * @param fieldsToReturn ex. { a : 1, b : 1 } => to return, { a : 0, b : 0 } => to omit
     * @param params
     */
    public async queryAsync(query: object,
        fieldsToReturn: object,
        params?: IQueryParameters): Promise<IReturn> {

        Object.keys(fieldsToReturn).forEach(key => {
            fieldsToReturn[key] = +fieldsToReturn[key];
        });

        params = params && params || {
            sort: { createdAt: 1 },
        };

        return new Promise<IReturn>((resolve) => {
            try {
                this.datastore.find(query)
                    .projection(fieldsToReturn)
                    .sort(params.sort)
                    .skip(params.skip)
                    .limit(params.limit)
                    .exec(function (err, ret) {
                        resolve({
                            data: ret,
                            error: err as NedbError,
                        } as IReturn);
                    });
            } catch (e) {
                return {
                    data: [],
                    error: null as NedbError
                } as IReturn;
            }

        });
    }

    /**
     * Performs delete
     * @param queryToDelete ex. { a : 1 }
     * @param multi if  want to remove all matched records or only first one
     */
    public async deleteAsync(queryToDelete: object, multi: boolean = true): Promise<IRemoveReturn> {
        const params = {
            multi,
        };
        return new Promise<IRemoveReturn>((resolve) => {
            this.datastore.remove(queryToDelete, params, function (err, numRemoved) {
                resolve({
                    numRemoved,
                    error: err as NedbError,
                } as IRemoveReturn);
            });
        });

    }
}

