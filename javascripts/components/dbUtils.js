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
exports.DbUtils = void 0;
require("reflect-metadata");
require("es6-shim");
const simple_crypto_js_1 = __importDefault(require("simple-crypto-js"));
const db_1 = require("./db");
const fs = require("fs");
const userDataWrapper_1 = require("../models/userDataWrapper");
const statics_1 = require("./statics");
const appUIState_1 = require("./appUIState");
const appUtils_1 = require("./appUtils");
class DbUtils {
    static loadOrCreateDatabaseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._db) {
                return this._db;
            }
            this._db = new db_1.Database(appUIState_1.AppUIState.appSettings.db_name, appUIState_1.AppUIState.appSettings.db_path, appUIState_1.AppUIState.appSettings.db_basePath);
            yield this._db.loadAsync();
            let filename = this._db.getFilename();
            if (!fs.readFileSync(filename, 'utf-8').trim()) {
                let dummyUserData = new userDataWrapper_1.UserDataWrapper({
                    plainEmail: statics_1.CONSTANTS.DUMMY_DB_USER,
                    plainPassword: statics_1.CONSTANTS.DUMMY_DB_USER
                });
                yield this._db.insertAsync([dummyUserData.toSecuredObject()]);
            }
            return this._db;
        });
    }
    static saveUserAsync(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadOrCreateDatabaseAsync();
            yield this._db.updateAsync({
                id: userData.id
            }, userData.toSecuredObject());
        });
    }
    static insertUserAsync(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadOrCreateDatabaseAsync();
            yield this._db.insertAsync([userData.toSecuredObject()]);
        });
    }
    static findAndLoadUserDataAsync(plainEmail, plainPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadOrCreateDatabaseAsync();
            var simpleCrypto = new simple_crypto_js_1.default(plainPassword);
            let users = yield this._db.queryAsync({}, statics_1.CONSTANTS.USER_OBJECT_SELECT_FIELDS);
            let ud;
            users.data.forEach((userData) => {
                let em, psw;
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
        });
    }
    static moveDbAsync(moveFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            let oldFilename = DbUtils.getDbFilename();
            let oldFilePath = DbUtils.getDbFilePath();
            DbUtils._db = null;
            yield DbUtils.loadOrCreateDatabaseAsync();
            let newFilename = DbUtils.getDbFilename();
            let newFilepath = DbUtils.getDbFilePath();
            if (!moveFiles && newFilename != oldFilename) {
                fs.copyFileSync(oldFilename, newFilename);
            }
            else if (newFilepath != oldFilePath) {
                yield appUtils_1.AppUtils.copyDirAsync(oldFilePath, newFilepath);
            }
            DbUtils._db = null;
            yield DbUtils.loadOrCreateDatabaseAsync();
        });
    }
    static compactDbAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadOrCreateDatabaseAsync();
            yield this._db.compactAsync();
        });
    }
    static getDbFilename() {
        return this._db.getFilename();
    }
    static getDbFilenameWithoutPath() {
        return this._db.getFilenameWithoutPath();
    }
    static getDbFilePath() {
        return this._db.getFilepath();
    }
}
exports.DbUtils = DbUtils;
//# sourceMappingURL=dbUtils.js.map