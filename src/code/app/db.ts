import Datastore = require("nedb");
import * as path from "path";
import fs = require('fs');

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


export class Database {

    private datastore: Datastore;
    private filename: string;
    private filePath : string;

    constructor(filename: string, documentFolderPath: string) {
        
        const mkdir = require('mkdir-recursive');
        const platformFolders = require('platform-folders');
        const path = require("path");
       
        this.filePath =  path.join(platformFolders.getDocumentsFolder(), documentFolderPath);

        if (!fs.existsSync(this.filePath)) {
            mkdir.mkdirSync(this.filePath);
        }
        this.filename = path.join(this.filePath, filename + ".db");

        this.datastore = new Datastore({
            filename: this.filename,
            timestampData: true
        });

    }

    public async loadAsync(): Promise<void> {
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

    public async compactAsync(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.datastore.persistence.compactDatafile();
            this.datastore.on("compaction.done", function () {
                resolve();
            });
        });
    }

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


    public getFilename(): string {
        return this.filename;
    }


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
            multi: params && params.multi || true ,
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

