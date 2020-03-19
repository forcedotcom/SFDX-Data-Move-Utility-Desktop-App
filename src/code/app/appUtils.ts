import { Database } from './db';
import { User, APP_CONSTANTS, Org, ENVIRONMENTS, UserData, Sfdx_ForceOrgList_CommandResponse, Sfdx_ForceOrgList_OrgItem } from './appModels';
import fs = require('fs');
import SimpleCrypto from "simple-crypto-js";
import path = require("path");
import platformFolders = require('platform-folders');
import mkdir = require('mkdir-recursive');
import "reflect-metadata";
import "es6-shim";
import { plainToClass } from "class-transformer";
import { SfdxUtils } from '../sfdmu-plugin/modules/sfdx';
import stringify = require('json-stringify');
import { OrgInfo } from '../sfdmu-plugin/modules/models';
import { consoleUtils } from './consoleUtils';



export default class AppUtils {

    private static _db: Database;


    // DATABASE -------------------------------------------------------------
    // ----------------------------------------------------------------------

    public static async db_loadOrCreateDatabaseAsync(): Promise<Database> {
        if (this._db) {
            return this._db;
        }
        let db = new Database(APP_CONSTANTS.DB_NAME, APP_CONSTANTS.DB_PATH);
        await db.loadAsync();
        let filename = db.getFilename();
        if (!fs.readFileSync(filename, 'utf-8').trim()) {
            let dummyUser = new User({
                email: 'dummy',
                password: 'dummy'
            });
            await db.insertAsync([dummyUser.toObject()]);
        }
        this._db = db;
        return db;
    }

    public static async db_getUserAsync(db: Database, email: string, userPassword: string): Promise<User> {
        var simpleCrypto = new SimpleCrypto(userPassword);
        let users = await db.queryAsync({}, {
            email: 1,
            password: 1,
            id: 1,
            orgs: 1,
            configs: 1
        });
        let u: User = undefined;
        [].concat(users.data).forEach(user => {
            let em: any;
            try {
                em = simpleCrypto.decrypt(user.email).toString();
            }
            catch (e) { }
            if (em && em == email) {
                user.userName = em;
                user.userPassword = userPassword;
                u = new User(user);
            }
        });
        return u;
    }

    static async db_createUserAsync(db: Database, email: any, userPassword: any): Promise<User> {
        var simpleCrypto = new SimpleCrypto(userPassword);
        let user = new User({
            email: simpleCrypto.encrypt(email),
            password: simpleCrypto.encrypt(userPassword)
        });
        let u = await db.insertAsync([user]);
        user.userName = email;
        user.userPassword = userPassword;
        return user;
    }

    static async db_updateUserAsync(db: Database, user: User): Promise<User> {
        await db.updateAsync({
            id: user.id
        }, user.toSequreObject());
        return user;
    }




    // WEB SESSION -------------------------------------------------------------
    // ----------------------------------------------------------------------

    // USER
    public static signOut(req: any) {
        this.setCurrentUser(req, undefined);
    }

    public static isAuthenticated(req: any) {
        let session = req.session;
        return !!session.user;
    }

    public static getCurrentUser(req: any): User {
        let session = req.session;
        return session.user ? plainToClass(User, session.user) : undefined;
    }

    public static setCurrentUser(req: any, user: User) {
        let session = req.session;
        session.user = user ? user.toObject() : undefined;
    }

    // USER DATA

    public static getServerUserData(req: any): UserData {
        let session = req.session;
        return session.userData ? plainToClass(UserData, session.userData, {
            enableImplicitConversion: true
        }) : new UserData();
    }

    public static setServerUserData(req: any, userData: UserData) {
        let session = req.session;
        session.userData = userData ? userData.toObject() : {};
    }




    // SFDX CLI COMMANDS -------------------------------------------------------------
    // ----------------------------------------------------------------------
    public static async execSfdxCommand(command: String, targetusername: String, killProcessOnFirstConsoleOutput: boolean = true): Promise<string> {

        let output: string = "";

        function callback(data: {
            message: string,
            isError: boolean,
            exitCode: number
        }): boolean {
            if (!data.isError && typeof data.exitCode == "undefined" && data.message) {
                output += data.message;
            }
            if (killProcessOnFirstConsoleOutput) {
                return true;
            }
            return false;
        }

        if (typeof targetusername != "undefined")
            await consoleUtils.callConsoleCommand(`sfdx ${command} --targetusername ${targetusername}`, callback);
        else
            await consoleUtils.callConsoleCommand(`sfdx ${command}`, callback);

        return output;

    };


    public static async sfdxCLI_ForceOrgList(): Promise<Array<Sfdx_ForceOrgList_OrgItem>> {
        try {
            //let responseString = SfdxUtils.execSfdx("force:org:list --json", undefined);
            let responseString = await AppUtils.execSfdxCommand("force:org:list --json", undefined);
            let jsonObject = JSON.parse(responseString);
            let responseObject = plainToClass(Sfdx_ForceOrgList_CommandResponse, jsonObject, {
                enableImplicitConversion: true,
                excludeExtraneousValues: true
            });
            if (responseObject.status == 0) {
                return [
                    ...responseObject.result.nonScratchOrgs,
                    ...responseObject.result.scratchOrgs.map(x => {
                        x.isScratchOrg = true;
                        return x;
                    })];
            }
        } catch (ex) {
        }
        return new Array<Sfdx_ForceOrgList_OrgItem>();
    }

    public static async sfdxCLI_ForceAuthWebLogin(env: ENVIRONMENTS = ENVIRONMENTS.dev): Promise<[string, Sfdx_ForceOrgList_OrgItem]> {
        let responseString = "";
        try {
            let loginUrl = this.getEnvLoginUrl(env);
            let responseString = await AppUtils.execSfdxCommand(`force:auth:web:login -r ${loginUrl}`, undefined);
            //let responseString = SfdxUtils.execSfdx(`force:auth:web:login -r ${loginUrl}`, undefined);
            responseString = responseString.replace("\n", " ");
            if (responseString.indexOf('Successfully authorized') >= 0) {
                let org: Sfdx_ForceOrgList_OrgItem = new Sfdx_ForceOrgList_OrgItem();
                org.loginUrl = loginUrl;
                org.orgId = /[\d\w]{18}/gi.exec(responseString)[0];
                org.username = /[\d\w\.\-_]+@[\d\w\.\-_]+/gi.exec(responseString)[0];
                org.connectedStatus = "Connected";
                return [responseString, org];
            }
        } catch (ex) {
            responseString = ex.message.replace("\n", " ");
        }
        return [responseString, new Sfdx_ForceOrgList_OrgItem()];
    }

    public static async sfdxCLI_ForceOrgDisplay(userName: string): Promise<OrgInfo> {
        let responseString = await AppUtils.execSfdxCommand("force:org:display", userName);
        return SfdxUtils.parseForceOrgDisplayResult(responseString);
    }




    // APP UTILITIES -------------------------------------------------------------
    // ----------------------------------------------------------------------

    public static async createOrgAsync(req: any, env: ENVIRONMENTS): Promise<Org> {
        let user = this.getCurrentUser(req);
        let loginUrl = this.getEnvLoginUrl(env);
        var result = await AppUtils.sfdxCLI_ForceAuthWebLogin(env);
        if (!result[1].isConnected) {
            return undefined;
        }
        let oldOrg = user.orgs.filter(org => user.getOrgUsername(org) == result[1].username)[0];
        if (oldOrg) {
            AppUtils.removeBy(user.orgs, "id", oldOrg.id);
        }
        let org = new Org().create(user.userPassword, result[1].username, loginUrl);
        user.orgs = user.orgs.concat(org);
        this.setCurrentUser(req, user);
        return org;
    }

    public static getEnvLoginUrl(env: ENVIRONMENTS) {
        switch (env) {
            case ENVIRONMENTS.dev:
            case ENVIRONMENTS.prod:
                return "https://login.salesforce.com";

            case ENVIRONMENTS.test:
                return "https://test.salesforce.com";
        }
    }

    public static async connectBetweenOrgs(req: any, sourceId: string, targetId: string): Promise<[Org, Org, string]> {
        let user = this.getCurrentUser(req);
        let sourceOrg = user.orgs.find(org => {
            return org.id == sourceId;
        });
        let targetOrg = user.orgs.find(org => {
            return org.id == targetId;
        });
        if (!sourceId || !targetId) {
            return [undefined, undefined, "Invalid remote call."];
        }
        try {
            await sourceOrg.connectAsync(user.userPassword, true);
            await SfdxUtils.describeSOrgAsync(sourceOrg.sOrg);
        } catch (e) {
            return [undefined, undefined, "Unable to connect to the source org. Verify user's access within SFDX CLI."];
        }
        try {
            await targetOrg.connectAsync(user.userPassword, false);
            await SfdxUtils.describeSOrgAsync(targetOrg.sOrg);
        } catch (e) {
            return [undefined, undefined, "Unable to connect to the target org. Verify user's access within SFDX CLI."];
        }
        return [sourceOrg, targetOrg, ""];
    }


    // COMMON UTILITIES -------------------------------------------------------------
    // ----------------------------------------------------------------------

    public static validateHttpRequestBody(req: any, requiredFields?: Array<string>): boolean {
        let valid = true;
        Object.keys(req.body).forEach(key => {
            if (!requiredFields || requiredFields.indexOf(key) >= 0) {
                if (!req.body[key])
                    valid = false;
            }
        });
        return valid;
    }

    public static stringToEnum<T, K extends string>(enumObj: { [P in K]: T }, str: string): T {
        const enumKey = str as K
        return enumObj[enumKey]
    }

    public static makeId(length: Number = 10) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    public static removeBy(arr: Array<object>, field: string, value: string): Array<object> {
        return arr.splice(arr.findIndex(item => item[field] == value), 1);
    }

    public static stringifyObj(obj: any): string {
        return stringify(obj, (key: any, value: any) => {
            if (value instanceof Map) {
                let obj = Object.create(null);
                for (let [k, v] of value) {
                    obj[k] = v;
                }
                return obj;
            } else {
                try {
                    if (value.__proto__ && value.__proto__._serializableKeys) {
                        value.__proto__._serializableKeys.forEach(key => {
                            value["__$$" + key] = value[key];
                        });
                    }
                } catch (e) {

                }
                return value;
            }
        });
    }

    public static distinctBy(array: Array<any>, prop: string): Array<any> {
        return array.filter((e, i) => array.findIndex(a => a[prop] === e[prop]) === i);
    }



}







