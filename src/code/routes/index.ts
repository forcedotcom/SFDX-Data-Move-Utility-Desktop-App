import express = require("express");
const router = express.Router();
import AppUtils from '../app/appUtils';
import {
    PageStateBase,
    GenericPageState,
    ApiResponse,
    ENVIRONMENTS,
    Config,
    ConfigObject,
    ExtendedResponse,
    ConfigField,
    OPERATIONS,
    NON_USABLE_OBJECTS2,
    APP_CONSTANTS,
    DATA_MIGRATION_DIRECTIONS
} from '../app/appModels';
import * as deepClone from "deep.clone";
import { SfdxUtils } from "../sfdmu-plugin/modules/sfdx";
import { Enums, CONSTANTS } from "../sfdmu-plugin/modules/models";
import { CommonUtils } from "../sfdmu-plugin/modules/common";
import { fdatasync } from "fs";
import { consoleUtils } from "../app/consoleUtils";
const path = require("path");
const fs = require('fs');


/************* HTTP ACTION FUNCTIONS *******************/

// Home ---------------
router.get("/", async (req: express.Request, res: ExtendedResponse) => {
    let state = res.locals.state as PageStateBase;
    state.current = new GenericPageState(state);
    res.render("index", state);
});


// List Orgs ---------------
router.post("/orglist", (req: express.Request, res: ExtendedResponse) => {
    let user = AppUtils.getCurrentUser(req);
    res.jsonExt(new ApiResponse({
        orgList: user.getOrgListItems(res)
    }));
});


// Remove Org --------------
router.post("/removeorg", async (req: express.Request, res: ExtendedResponse) => {

    let id = req.body.id;
    if (!id) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);

    AppUtils.removeBy(user.orgs, "id", id);
    let db = await AppUtils.db_loadOrCreateDatabaseAsync();
    await AppUtils.db_updateUserAsync(db, user)
    AppUtils.setCurrentUser(req, user);

    res.jsonExt(new ApiResponse({
        orgList: user.getOrgListItems(res),
        selectedOrgId: user.orgs[0] && user.orgs[0].id
    }));



});


// Add Org ---------------
router.post("/addorg", async (req: express.Request, res: ExtendedResponse) => {

    let valid = AppUtils.validateHttpRequestBody(req);

    if (!valid) {
        res.jsonExt(new ApiResponse({
            error: "Please, enter valid org credentials."
        }));
        return;
    }

    let env: ENVIRONMENTS = AppUtils.stringToEnum(ENVIRONMENTS, req.body.environment);
    let org = await AppUtils.createOrgAsync(req, env);

    if (!org) {
        res.jsonExt(new ApiResponse({
            error: "Unable to connect."
        }));
    } else {

        let user = AppUtils.getCurrentUser(req);

        let db = await AppUtils.db_loadOrCreateDatabaseAsync();
        await AppUtils.db_updateUserAsync(db, user)
        AppUtils.setCurrentUser(req, user);

        res.jsonExt(new ApiResponse({
            orgList: user.getOrgListItems(res),
            selectedOrgId: org.id
        }));
    }
});





// Connect between Orgs --------------
router.post("/connectorgs", async (req: express.Request, res: ExtendedResponse) => {


    let sourceId = req.body.sourceId;
    let targetId = req.body.targetId;

    if (!sourceId || !targetId) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);

    if (sourceId == APP_CONSTANTS.CSV_FILE_SOURCE_ID) {
        // File source
        userData.migrationDirection = DATA_MIGRATION_DIRECTIONS.File2Org;
        sourceId = targetId;
    } else if (targetId == APP_CONSTANTS.CSV_FILE_SOURCE_ID) {
        // File target
        userData.migrationDirection = DATA_MIGRATION_DIRECTIONS.Org2File;
        targetId = sourceId;
    } else {
        userData.migrationDirection = DATA_MIGRATION_DIRECTIONS.Org2Org;
    }

    let ret = await AppUtils.connectBetweenOrgs(req, sourceId, targetId);

    if (ret[2]) {
        res.jsonExt(new ApiResponse({
            error: ret[2]
        }));
        return;
    }

    userData.sourceOrg = ret[0];
    userData.targetOrg = ret[1];

    if (user.configList.length > 0) {
        userData.config = user.configList[0];
    } else {
        userData.config = undefined;
    }
    AppUtils.setServerUserData(req, userData);

    res.jsonExt(new ApiResponse({
        sourceOrg: {
            id: ret[0].id,
            name: ret[0].orgUsername
        },
        targetOrg: {
            id: ret[1].id,
            name: ret[1].orgUsername
        },
        configList: user.getConfigListItems(userData),
        selectedConfigId: userData.config && userData.config.id
    }));

});


// Add Config ---------------
router.post("/addconfig", async (req: express.Request, res: ExtendedResponse) => {
    await addConfig(req, res);
});


// Add config from cfg file --------------
router.post("/addconfigfromfile", async (req: express.Request, res: ExtendedResponse) => {
    if (!req.body.json) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }
    req.body.configData = JSON.parse(req.body.json);
    await addConfig(req, res);
});



// Clone config --------------
router.post("/cloneconfig", async (req: express.Request, res: ExtendedResponse) => {

    let name = req.body.name;
    let id = req.body.id;

    if (!name || !id) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);

    let oldConfig = user.configList.filter(x => x.id == id)[0];

    if (oldConfig) {

        let config = deepClone.deepCloneSync(oldConfig);
        config.name = name;
        config.id = AppUtils.makeId(10);

        user.configList = user.configList.concat(config);
        userData.config = config;

        await user.saveUser(req, userData, config);

        res.jsonExt(new ApiResponse({
            configList: user.getConfigListItems(userData),
            selectedConfigId: userData.config.id
        }));

    } else {
        res.jsonExt(new ApiResponse({
            error: "The Configuration wasn't found."
        }));
    }
});


// Edit config name --------------
router.post("/editconfig", async (req: express.Request, res: ExtendedResponse) => {

    let name = req.body.name;

    let id = req.body.id;

    if (!name || !id) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);

    let oldConfig = user.configList.filter(x => x.id == id)[0];

    if (oldConfig) {

        oldConfig.name = name;
        userData.config = oldConfig;

        await user.saveUser(req, userData, oldConfig);

        res.jsonExt(new ApiResponse({
            configList: user.getConfigListItems(userData),
            selectedConfigId: userData.config.id
        }));

    } else {
        res.jsonExt(new ApiResponse({
            error: "The Configuration wasn't found."
        }));
    }
});


// Remove config --------------
router.post("/removeconfig", async (req: express.Request, res: ExtendedResponse) => {
    let id = req.body.id;
    if (!id) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    AppUtils.removeBy(user.configList, "id", id);
    let db = await AppUtils.db_loadOrCreateDatabaseAsync();
    await AppUtils.db_updateUserAsync(db, user)
    AppUtils.setCurrentUser(req, user);

    let userData = AppUtils.getServerUserData(req);
    if (user.configList.length > 0) {
        userData.config = user.configList[0];
    } else {
        userData.config = undefined;
    }
    AppUtils.setServerUserData(req, userData);

    res.jsonExt(new ApiResponse({
        configList: user.getConfigListItems(userData),
        selectedConfigId: userData.config && userData.config.id
    }));

});


// Replace config with data from csv files --------------
router.post("/replaceconfigfromcsv", async (req: express.Request, res: ExtendedResponse) => {

    let id = req.body.id;

    if (!id) {

        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let config = user.configList.filter(x => x.id == id)[0];
    let userData = AppUtils.getServerUserData(req);
    let validObjectNames = userData.sourceOrg.getOrgObjectListItems(config, userData, false).map(x => x.value);

    if (config) {

        config.scriptDirectory = await config.createAndGetScriptDirectory();

        let names = fs.readdirSync(config.scriptDirectory)
            .filter(fn => fn.endsWith('.csv'))
            .map(fn => {
                return path.basename(fn, '.csv');
            }).filter(name => {
                return validObjectNames.indexOf(name) >= 0;
            });

        if (names.length > 0) {

            req.body.names = names;
            req.body.removeAllObjects = true;
            req.body.noResponse = true;
            names = await addObjects(req, res);

            if (!names) {
                return;
            } else if (names.length > 0) {
                for (let index = 0; index < names.length; index++) {
                    req.body.name = names[index];
                    await updateFieldsFromCSV(req, res);
                }
            }

        }

        user = AppUtils.getCurrentUser(req);
        config = user.configList.filter(x => x.id == id)[0];
        userData = AppUtils.getServerUserData(req);


        let objectList = userData.sourceOrg.getOrgObjectListItems(config, userData);
        let objects = await config.getConfigObjectListItems(userData, req);
        let configExtraData = await config.getConfigExtraData(userData, objects[0]);
        let resultString = JSON.stringify(configExtraData);


        res.jsonExt(new ApiResponse({
            objectList,
            selectedObjectId: undefined,
            objects: objects[0],
            configDataError: objects[1],
            resultString: resultString
        }));

    } else {
        res.jsonExt(new ApiResponse({
            error: "The Configuration wasn't found."
        }));
    }


});


// Get config data --------------
router.post("/getconfigdata", async (req: express.Request, res: ExtendedResponse) => {

    let id = req.body.id;

    if (!id) {

        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);
    let config = user.configList.filter(x => x.id == id)[0];

    if (config) {

        userData.config = config;

        let objectList = userData.sourceOrg.getOrgObjectListItems(config, userData);
        let objects = await config.getConfigObjectListItems(userData, req);
        let configExtraData = await config.getConfigExtraData(userData, objects[0]);
        let resultString = JSON.stringify(configExtraData);


        if (userData.migrationDirection == DATA_MIGRATION_DIRECTIONS.File2Org) {
            config.useFileSource = true;
            config.useFileTarget = false;
        } else if (userData.migrationDirection == DATA_MIGRATION_DIRECTIONS.Org2File) {
            config.useFileSource = false;
            config.useFileTarget = true;
        }

        AppUtils.setServerUserData(req, userData);

        res.jsonExt(new ApiResponse({
            objectList,
            selectedObjectId: undefined,
            objects: objects[0],
            configDataError: objects[1],
            resultString: resultString
        }));
    } else {
        res.jsonExt(new ApiResponse({
            error: "The Configuration wasn't found."
        }));

    }

});


// Create downloadable vewrsion of config and download it --------------
router.get("/downloadconfig", async (req: express.Request, res: ExtendedResponse) => {

    let id = req.query.id;

    if (!id) {

        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let config = user.configList.filter(x => x.id == id)[0];

    if (config) {

        if (!config.scriptDirectory || !fs.existsSync(config.scriptDirectory)) {
            config.scriptDirectory = await config.createAndGetScriptDirectory();
        }

        let obj = config.toExportableObject();
        let str = JSON.stringify(obj, undefined, 2);
        let filePath = path.join(config.scriptDirectory, `${config.getFileName()}.cfg`);
        fs.writeFileSync(filePath, str);

        res.download(filePath);
    } else {
        res.jsonExt(new ApiResponse({
            configDataError: ""
        }));
    }
});

// Add objects to config --------------
router.post("/addobjects", async (req: express.Request, res: ExtendedResponse) => {
    req.body.defaultFields = [APP_CONSTANTS.DEFAULT_EXTERNAL_ID_FIELD_NAME];
    await addObjects(req, res);
});


// Add related objects to config --------------
router.post("/addrelatedobjects", async (req: express.Request, res: ExtendedResponse) => {

    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;
    let selectedObjectNames = config.objects.map(x => x.name);

    let names: Set<string> = new Set<string>();

    for (let index = 0; index < config.objects.length; index++) {

        let object = config.objects[index];

        object.getSelectedFieldListItems(userData)
            .filter(field => {
                return field.sFieldDescribe.isReference
                    && selectedObjectNames.indexOf(field.sFieldDescribe.referencedObjectType) < 0
                    && NON_USABLE_OBJECTS2.indexOf(field.sFieldDescribe.referencedObjectType) < 0;
            }).forEach(field => {
                names.add(field.sFieldDescribe.referencedObjectType);
            });

    }

    if (names.size == 0) {

        let objectList = userData.sourceOrg.getOrgObjectListItems(config, userData);
        let objects = await config.getConfigObjectListItems(userData, req);

        res.jsonExt(new ApiResponse({
            objectList,
            selectedObjectId: undefined,
            objects: objects[0],
            configDataError: objects[1]
        }));

    } else {
        req.body.names = [...names.values()];
        req.body.operation = OPERATIONS.Readonly;
        req.body.defaultFields = [APP_CONSTANTS.DEFAULT_EXTERNAL_ID_FIELD_NAME];
        await addObjects(req, res);
    }

});

// Remove object from config --------------
router.post("/removeobject", async (req: express.Request, res: ExtendedResponse) => {

    let name = req.body.name;

    if (!name) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;
    AppUtils.removeBy(config.objects, "name", name);

    await user.saveUser(req, userData, config);

    let objectList = userData.sourceOrg.getOrgObjectListItems(config, userData);
    let objects = await config.getConfigObjectListItems(userData, req);

    res.jsonExt(new ApiResponse({
        objectList,
        selectedObjectId: undefined,
        objects: objects[0],
        configDataError: objects[1]
    }));

});

// Get object data  --------------
router.post("/getobject", async (req: express.Request, res: ExtendedResponse) => {

    let name = req.body.name;

    if (!name) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;

    let object = config.objects.filter(o => o.name == name)[0];

    if (userData.sourceSObjectsMap.get(name)) {
        await SfdxUtils.describeSObjectAsync(object.name, userData.sourceOrg.sOrg, userData.sourceSObjectsMap);
    }

    if (userData.targetSObjectsMap.get(name)) {
        await SfdxUtils.describeSObjectAsync(object.name, userData.targetOrg.sOrg, userData.targetSObjectsMap);
    }

    AppUtils.setServerUserData(req, userData);

    let extraData = await object.getObjectExtraData(userData, req, true);
    let changed = extraData.initialized ? object.fixExtraDataAndObjectParameters(userData, config, extraData) : false;

    if (changed) {
        await user.saveUser(req, userData, config);
    }

    let objects = await config.getConfigObjectListItems(userData, req);
    let configObject = objects[0].filter(x => x.value == name)[0];

    res.jsonExt(new ApiResponse({
        object: configObject,
        configDataError: objects[1]
    }));

});


// Update object parameters from csv --------------
router.post("/updateobjectfromcsv", async (req: express.Request, res: ExtendedResponse) => {
    await updateFieldsFromCSV(req, res);
});


// Update object fields --------------
router.post("/updatefields", async (req: express.Request, res: ExtendedResponse) => {
    await updateFields(req, res);
});


// Update object parameters from ui --------------
router.post("/updateobjectparameters", async (req: express.Request, res: ExtendedResponse) => {

    let name = req.body.name;
    let data = req.body.extraData;

    if (!name || !data) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    data = JSON.parse(data);

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;

    let object = config.objects.filter(o => o.name == name)[0];

    object.operation = (<any>Enums.OPERATION)[(<any>Enums.OPERATION)[data.operation]];
    object.limit = data.limit;
    object.where = data.where;
    object.mockFields = data.mockFields;
    object.updateWithMockData = data.updateWithMockData;
    object.deleteOldData = data.deleteOldData;

    object.deleteAll = data.deleteAll;
    object.included = data.included;
    object.targetRecordsFilter = data.targetRecordsFilter;

    object.deleteWhere = data.deleteWhere;

    object.externalId = (data.externalId || '').replace(' ', '').trim();

    let extraData = await object.getObjectExtraData(userData, req, true);
    if (!extraData.initialized) {
        res.jsonExt(new ApiResponse({
            configDataError: ""
        }));
        return;
    }
    object.fixExtraDataAndObjectParameters(userData, config, extraData);

    await user.saveUser(req, userData, config);

    let objects = await config.getConfigObjectListItems(userData, req);
    let configObject = objects[0].filter(x => x.value == name)[0];

    res.jsonExt(new ApiResponse({
        resultString: JSON.stringify(extraData),
        configDataError: objects[1],
        object: configObject
    }));

});


// Validated package and  generate errors --------------
router.post("/validatepackage", async (req: express.Request, res: ExtendedResponse) => {

    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;

    if (config) {
        let objects = await config.getConfigObjectListItems(userData, req);
        res.jsonExt(new ApiResponse({
            configDataError: objects[1]
        }));
    } else {
        res.jsonExt(new ApiResponse({
            configDataError: ""
        }));
    }

});

// Creates package.json file --------------
router.post("/createpackagescript", async (req: express.Request, res: ExtendedResponse) => {


    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;

    if (config) {

        let data = req.body.extraData;

        if (data) {
            data = JSON.parse(data);

            // Set parameters
            config.allOrNone = data.allOrNone;
            config.bulkApiV1BatchSize = data.bulkApiV1BatchSize;
            config.bulkApiVersion = data.bulkApiVersion ? "2.0" : "1.0";
            config.createTargetCSVFiles = data.createTargetCSVFiles;
            config.validateCSVFilesOnly = data.validateCSVFilesOnly;
            config.encryptDataFiles = data.encryptDataFiles;
            config.passwordSecured = data.passwordSecured;
            config.useFileSource = data.sourceTarget == "File2Org";
            config.useFileTarget = data.sourceTarget == "Org2File";

        }

        let state = res.locals.state as PageStateBase;
        let serializedScript = config.generatePackageScriptJsonString(userData, user.userPassword, state.isDebug);


        let db = await AppUtils.db_loadOrCreateDatabaseAsync();
        config.scriptDirectory = await config.createAndGetScriptDirectory(db);
        config.scriptPath = path.join(config.scriptDirectory, "export.json");


        if (!state.isWebApp) {
            config.commandString = `sfdx sfdmu:run --sourceusername ${config.useFileSource ? "csvfile" : userData.sourceOrg.orgUsername} --targetusername ${config.useFileTarget ? "csvfile" : userData.targetOrg.orgUsername}${config.passwordSecured ? " --encryptkey " + user.userPassword : ""} --path ${config.scriptDirectory} --filelog --verbose`;
        } else {
            config.commandString = `sfdx sfdmu:run --sourceusername ${config.useFileSource ? "csvfile" : userData.sourceOrg.orgUsername} --targetusername ${config.useFileTarget ? "csvfile" : userData.targetOrg.orgUsername}${config.passwordSecured ? " --encryptkey " + user.userPassword : ""} --filelog --verbose`;
        }

        fs.writeFileSync(config.scriptPath, serializedScript);

        await user.saveUser(req, userData, config);

        let objects = await config.getConfigObjectListItems(userData, req);

        let resultStringObject = {
            scriptJSON: serializedScript,
            allOrNone: config.allOrNone,
            bulkApiV1BatchSize: config.bulkApiV1BatchSize,
            bulkApiVersion: config.bulkApiVersion == "2.0",
            createTargetCSVFiles: config.createTargetCSVFiles,
            validateCSVFilesOnly: config.validateCSVFilesOnly,
            encryptDataFiles: config.encryptDataFiles,
            passwordSecured: config.passwordSecured,
            sourceTarget: config.useFileSource ? "File2Org" : config.useFileTarget ? "Org2File" : "Orgs",
            commandString: config.commandString,
            packageName: config.name,
            scriptDirectory: !state.isWebApp ? config.scriptDirectory : undefined,
            scriptPath: !state.isWebApp ? config.scriptPath : undefined
        };

        res.jsonExt(new ApiResponse({
            configDataError: objects[1],
            resultString: JSON.stringify(resultStringObject)
        }));

    } else {

        res.jsonExt(new ApiResponse({
            configDataError: ""
        }));
    }


});


// Opens package folder in Expolorer --------------
router.post("/openexportfolder", async (req: express.Request, res: ExtendedResponse) => {
    let state = res.locals.state as PageStateBase;
    if (!state.isWebApp) {
        let userData = AppUtils.getServerUserData(req);
        let config = userData.config;
        let scriptDirectory = await config.createAndGetScriptDirectory();
        const openExplorer = require('open-file-explorer');
        openExplorer(scriptDirectory);
    }
    res.jsonExt(new ApiResponse({
        configDataError: ""
    }));

});


// Opens main SFDMU folder in Expolorer --------------
router.post("/openrootexportfolder", async (req: express.Request, res: ExtendedResponse) => {
    let state = res.locals.state as PageStateBase;
    if (!state.isWebApp) {
        let userData = AppUtils.getServerUserData(req);
        let config = userData.config;
        let rootDirectory = await config.createAndGetScriptDirectory(undefined, true);
        const openExplorer = require('open-file-explorer');
        openExplorer(rootDirectory);
    }
    res.jsonExt(new ApiResponse({
        configDataError: ""
    }));

});


// Download package.json script file --------------
router.get("/downloadscript", (req: express.Request, res: ExtendedResponse) => {
    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;
    if (config.scriptPath && fs.existsSync(config.scriptPath)) {
        res.download(config.scriptPath);
    } else {
        res.jsonExt(new ApiResponse({
            configDataError: ""
        }));
    }
});




router.post("/killconsolecommand", (req: express.Request, res: ExtendedResponse) => {
    consoleUtils.killRunningConsoleProcess();
    res.jsonExt(new ApiResponse({
        configDataError: ""
    }));
});


router.post("/openurl", (req: express.Request, res: ExtendedResponse) => {
    let state = res.locals.state as PageStateBase;
    if (!state.isWebApp) {
        let url = req.body.url;
        var shell = require('electron').shell;
        shell.openExternal(url);
    }

    res.jsonExt(new ApiResponse({
        configDataError: ""
    }));
});



/************* HELPER FUNCTIONS *******************/
async function addObjects(req: express.Request, res: ExtendedResponse): Promise<Array<any>> {

    let names = req.body.names;
    let operation = req.body.operation || OPERATIONS.Upsert;
    let defaultFields = req.body.defaultFields || [];
    let removeAllObjects = req.body.removeAllObjects;
    let noResponse = req.body.noResponse;

    if (!names) {

        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    names = [...names];

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;

    names = names.filter(name => {
        return userData.sourceOrg.sObjectsMap.has(name);
    });

    if (names.length == 0) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    if (removeAllObjects) {
        config.objects = new Array<ConfigObject>();
    }

    config.objects = config.objects.concat([...userData.sourceOrg.sOrg.sObjectsMap.values()]
        .filter(o => names.indexOf(o.name) >= 0)
        .map(o => {
            let ob = new ConfigObject({
                name: o.name,
                label: o.label,
                operation: operation
            });
            if (defaultFields) {
                ob.fields = defaultFields.map(x => new ConfigField({
                    name: x
                }));
            }
            return ob;
        }));

    await user.saveUser(req, userData, config);

    if (!noResponse) {

        let objectList = userData.sourceOrg.getOrgObjectListItems(config, userData);
        let objects = await config.getConfigObjectListItems(userData, req);
        let configExtraData = await config.getConfigExtraData(userData, objects[0]);
        let resultString = JSON.stringify(configExtraData);

        res.jsonExt(new ApiResponse({
            objectList,
            selectedObjectId: undefined,
            objects: objects[0],
            configDataError: objects[1],
            resultString: resultString
        }));
    }

    return names;
}


async function updateFieldsFromCSV(req: express.Request, res: ExtendedResponse): Promise<any> {

    let name = req.body.name;
    let noResponse = req.body.noResponse;

    if (!name) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;

    let object = config.objects.filter(x => x.name == name)[0];
    let extraData = await object.getObjectExtraData(userData, req, false);

    let configObjects = await config.getConfigObjectListItems(userData, req);
    let configObject = configObjects[0].filter(x => x.value == name)[0];

    let csvFilePath = await config.createAndGetScriptDirectory();
    let csvFilename = path.join(csvFilePath, `${object.name}.csv`);

    if (fs.existsSync(csvFilename)) {

        // Read first line of csv
        let csvColumnsRow = await CommonUtils.readCsvFile(csvFilename, 1);
        let fieldsToAdd = new Set<String>();

        if (csvColumnsRow.length > 0) {
            let objectDescribtion = userData.sourceOrg.sObjectsMap.get(object.name).fieldsMap;
            Object.getOwnPropertyNames(csvColumnsRow[0]).forEach(csvColumn => {
                csvColumn = (csvColumn || '').trim();
                let columns = csvColumn.split(CONSTANTS.CSV_COMPLEX_FIELDS_COLUMN_SEPARATOR);
                columns.forEach(column => {
                    let descr = objectDescribtion.get(column);
                    if (descr && descr.name != "Id") {
                        let option = configObject.sourceFields.filter(x => x.value == descr.name);
                        if (option) {
                            fieldsToAdd.add(descr.name);
                        }
                    }
                });
            });

            if (fieldsToAdd.size > 0) {
                // Change fields by CSV
                req.body.fields = [...fieldsToAdd];
                await updateFields(req, res);
                return;
            }

        }
    }

    if (!noResponse) {
        res.jsonExt(new ApiResponse({
            object: configObject,
            configDataError: configObjects[1],
            resultString: JSON.stringify(extraData)
        }));
    }
}



async function updateFields(req: express.Request, res: ExtendedResponse): Promise<any> {

    let name = req.body.name;
    let fields = req.body.fields;
    let noResponse = req.body.noResponse;

    if (!name || !fields) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);
    let config = userData.config;

    let object = config.objects.filter(o => o.name == name)[0];
    object.fields = fields.map((f: any) => {
        return new ConfigField({
            name: f
        });
    });
    object.mockFields = object.mockFields.filter(x => fields.indexOf(x.name) >= 0);

    let extraData = await object.getObjectExtraData(userData, req, true);
    if (extraData.initialized) {
        object.fixExtraDataAndObjectParameters(userData, config, extraData);
        await user.saveUser(req, userData, config);
    }


    let objects = await config.getConfigObjectListItems(userData, req);
    let configObject = objects[0].filter(x => x.value == name)[0];

    if (!noResponse) {
        res.jsonExt(new ApiResponse({
            object: configObject,
            configDataError: objects[1],
            resultString: JSON.stringify(extraData)
        }));
    }

}

async function addConfig(req: express.Request, res: ExtendedResponse): Promise<any> {

    let name = req.body.name;
    let configData = req.body.configData;

    if (configData) {
        name = configData.name;
    }

    if (!name) {
        res.jsonExt(new ApiResponse({
            error: "Invalid remote call."
        }));
        return;
    }

    let user = AppUtils.getCurrentUser(req);
    let userData = AppUtils.getServerUserData(req);

    let config = new Config({
        name: name
    });

    if (configData) {
        config.fromObject(configData);
    }

    user.configList = user.configList.concat(config);
    userData.config = config;

    let db = await AppUtils.db_loadOrCreateDatabaseAsync();
    await AppUtils.db_updateUserAsync(db, user)
    AppUtils.setCurrentUser(req, user);
    AppUtils.setServerUserData(req, userData);

    res.jsonExt(new ApiResponse({
        configList: user.getConfigListItems(userData),
        selectedConfigId: userData.config.id
    }));
}






export default router;
