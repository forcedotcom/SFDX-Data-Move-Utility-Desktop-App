/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


import "reflect-metadata";
import "es6-shim";
import SimpleCrypto from "simple-crypto-js";
import { Database } from './db';
import fs = require('fs');
import { UserDataWrapper } from "../models/userDataWrapper";
import { ISecuredModel } from "./helper_interfaces";
import { CONSTANTS } from "./statics";
import { AppUIState } from "./appUIState";
import { AppUtils } from "./appUtils";


export class DbUtils {

    private static _db: Database;

    public static async loadOrCreateDatabaseAsync(): Promise<Database> {
        if (this._db) {
            return this._db;
        }
        this._db = new Database(
            AppUIState.appSettings.db_name,
            AppUIState.appSettings.db_path,
            AppUIState.appSettings.db_basePath);
        await this._db.loadAsync();
        let filename = this._db.getFilename();
        if (!fs.readFileSync(filename, 'utf-8').trim()) {
            let dummyUserData = new UserDataWrapper({
                plainEmail: CONSTANTS.DUMMY_DB_USER,
                plainPassword: CONSTANTS.DUMMY_DB_USER
            });
            await this._db.insertAsync([dummyUserData.toSecuredObject()]);
        }
        return this._db;
    }

    public static async saveUserAsync(userData: ISecuredModel): Promise<void> {
        await this.loadOrCreateDatabaseAsync();
        await this._db.updateAsync({
            id: userData.id
        }, userData.toSecuredObject());
    }

    public static async insertUserAsync(userData: ISecuredModel): Promise<void> {
        await this.loadOrCreateDatabaseAsync();
        await this._db.insertAsync([userData.toSecuredObject()]);
    }

    public static async findAndLoadUserDataAsync(plainEmail: string, plainPassword: string): Promise<ISecuredModel> {
        await this.loadOrCreateDatabaseAsync();
        var simpleCrypto = new SimpleCrypto(plainPassword);
        let users = await this._db.queryAsync({}, CONSTANTS.USER_OBJECT_SELECT_FIELDS);
        let ud: ISecuredModel;
        (users.data as Array<object>).forEach((userData: ISecuredModel) => {
            let em: any, psw: any;
            try {
                em = simpleCrypto.decrypt(userData.email).toString();
                psw = simpleCrypto.decrypt(userData.password).toString();
            }
            catch (e) { }
            if (em == plainEmail && (psw == plainPassword)) {
                ud = userData;
            }
        });
        return ud;
    }

    public static async moveDbAsync(moveFiles: boolean): Promise<void> {
        let oldFilename = DbUtils.getDbFilename();
        let oldFilePath = DbUtils.getDbFilePath()
        DbUtils._db = null;
        await DbUtils.loadOrCreateDatabaseAsync();
        let newFilename = DbUtils.getDbFilename();
        let newFilepath = DbUtils.getDbFilePath();
        if (!moveFiles && newFilename != oldFilename) {
            fs.copyFileSync(oldFilename, newFilename);
        } else if (newFilepath != oldFilePath) {
            await AppUtils.copyDirAsync(oldFilePath, newFilepath);
        }
        DbUtils._db = null;
        await DbUtils.loadOrCreateDatabaseAsync();
    }

    public static async compactDbAsync(): Promise<void> {
        await this.loadOrCreateDatabaseAsync();
        await this._db.compactAsync();
    }

    public static getDbFilename(): string {
        return this._db.getFilename();
    }

    public static getDbFilenameWithoutPath(): string {
        return this._db.getFilenameWithoutPath();
    }

    public static getDbFilePath(): string {
        return this._db.getFilepath();
    }
}