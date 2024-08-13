"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SfdmuService = void 0;
const class_transformer_1 = require("class-transformer");
const _1 = require(".");
const common_1 = require("../common");
const configurations_1 = require("../configurations");
const models_1 = require("../models");
const utils_1 = require("../utils");
class SfdmuService {
    /**
      * Executes an SFDX command.
      * @param {string} command - The SFDX command to execute.
      * @param {string} [targetusername] - The target username for the command.
      * @param {boolean} [killProcessOnFirstConsoleOutput=false] - Flag indicating whether to kill the process on the first console output.
      * @param {LongOperationProgressCallback} [progressCallback=null] - Callback function for progress updates.
      * @returns {Promise<IExecSfdxCommandResult>} - A promise that resolves to the execution result.
      */
    static async execSfdxCommandAsync(command, targetusername, killProcessOnFirstConsoleOutput = false) {
        let cliCommand = targetusername
            ? `sfdx ${command} --targetusername ${targetusername}`
            : `sfdx ${command}`;
        if (global.appGlobal.packageJson.appConfig.useSfCliCommands) {
            cliCommand = cliCommand.replaceStrings({ from: "sfdx", to: "sf" }, { from: "force:org:display", to: "org display" }, { from: "force:org:list", to: "org list" }, { from: "--targetusername", to: "--target-org" });
        }
        _1.LogService.info(`Executing the CLI command ${cliCommand}...`);
        const { commandOutput, isError } = await _1.ConsoleService.runCommandAsync(cliCommand, killProcessOnFirstConsoleOutput);
        if (isError) {
            _1.LogService.warn(`Failed to execute the command ${cliCommand}`);
        }
        else {
            _1.LogService.info(`Execution of the command ${cliCommand} has been completed`);
        }
        return {
            cliCommand,
            commandOutput,
            isError,
            statusCode: isError ? models_1.StatusCode.GeneralError : models_1.StatusCode.OK,
        };
    }
    /**
       * Executes the "force:org:list" command.
       * @returns {Promise<IForceOrgListResult>} - A promise that resolves to the execution result.
       */
    static async execForceOrgListAsync() {
        let errorMessage = "";
        try {
            _1.BroadcastService.broascastProgressUserMessage(common_1.ProgressEventType.ui_notification, 'SfdmuService:execForceOrgList', `SEARCHING_SFDX_ORGS`);
            _1.LogService.info(`Looking for the available SFDX orgs...`);
            const response = await SfdmuService.execSfdxCommandAsync("force:org:list --json", null, false);
            if (response.isError) {
                throw new Error(_1.TranslationService.translate({ key: 'FAILED_TO_EXECUTE_SFDX_COMMAND' }));
            }
            const responseObject = JSON.parse(response.commandOutput);
            if (responseObject.status == 0) {
                /**
                 * The result of the "force:org:list" command.
                 * @type {IForceOrgListResult}
                 */
                return {
                    orgs: [
                        ...responseObject.result.nonScratchOrgs.map(org => (0, class_transformer_1.plainToInstance)(models_1.ForceOrg, org)),
                        ...responseObject.result.scratchOrgs.map(org => {
                            org.isScratchOrg = true;
                            return (0, class_transformer_1.plainToInstance)(models_1.ForceOrg, org);
                        }),
                    ],
                    commandOutput: response.commandOutput,
                    isError: false,
                    errorMessage,
                    statusCode: models_1.StatusCode.OK,
                };
            }
            else {
                errorMessage = responseObject.message;
            }
        }
        catch (ex) {
            errorMessage = ex.message;
        }
        _1.LogService.warn(`Unable to retrieve the list of SFDX orgs due to: ${errorMessage}`);
        /**
         * The execution result of the "force:org:list" command.
         * @type {IForceOrgListResult}
         */
        return {
            errorMessage,
            isError: true,
            statusCode: models_1.StatusCode.GeneralError,
        };
    }
    /**
    * Executes the "force:org:display" command.
    * @param {string} userName - The username of the org.
    * @returns {Promise<ForceOrgDisplayResult>} - A promise that resolves to the execution result.
    */
    static async execForceOrgDisplayAsync(userName) {
        try {
            _1.BroadcastService.broascastProgressUserMessage(common_1.ProgressEventType.ui_notification, 'SfdmuService:execForceOrgDisplay', `CONNECTING_ORG`, userName);
            _1.LogService.info(`Connecting the org ${userName}...`);
            const response = await SfdmuService.execSfdxCommandAsync("force:org:display --json", userName, false);
            const jsonObject = JSON.parse(response.commandOutput);
            if (jsonObject.status == 0) {
                /**
                 * The result of the "force:org:display" command.
                 * @type {ForceOrgDisplayResult}
                 */
                const responseObject = new models_1.ForceOrgDisplayResult(Object.assign(jsonObject.result, {
                    cliCommand: response.cliCommand,
                    commandOutput: response.commandOutput,
                    statusCode: models_1.StatusCode.OK,
                }));
                return responseObject;
            }
            response.errorMessage = `Unable to connect to the org ${userName}`;
            _1.LogService.warn(response.errorMessage);
            return new models_1.ForceOrgDisplayResult({
                statusCode: models_1.StatusCode.GeneralError,
                errorMessage: response.errorMessage,
                isError: true,
            });
        }
        catch (ex) {
            const errorMessage = `Unable to connect to the org ${userName}`;
            _1.LogService.warn(errorMessage);
            return {
                statusCode: models_1.StatusCode.GeneralError,
                errorMessage,
                isError: true,
            };
        }
    }
    /**
     * Connects to the specified orgs.
     * @param {Connection} connection - The connection to use.
     * @returns {Promise<Partial<IDataResult<OrgDescribe>>>} - A promise that resolves to the execution result.
     *                                                          Returns a partial data result of the org describe.
     *                                                          Contains map of sobjects and their describes.
     */
    static async connectToOrgAsync(connection) {
        _1.LogService.info(`Connecting to the org ${connection.userName}...`);
        _1.BroadcastService.broascastProgressUserMessage(common_1.ProgressEventType.ui_notification, 'SfdmuService:connectToOrgAsync', `RETRIEVENG_ORG_OBJECTS`, connection.userName);
        await utils_1.CommonUtils.delayAsync(1000);
        try {
            _1.LogService.info(`Retrieving standard sObjects in the org ${connection.userName}...`);
            let query = `SELECT QualifiedApiName, Label,
                            IsEverUpdatable, 
                            IsEverCreatable, 
                            IsEverDeletable,
                            KeyPrefix 
                        FROM EntityDefinition 
                        WHERE IsRetrieveable = true 
                            AND IsQueryable = true 
                            AND IsIdEnabled = true 
                            AND IsDeprecatedAndHidden = false
                            AND (NOT KeyPrefix LIKE 'a%')`;
            const records = await SfdmuService.queryBatchedAsync(query, connection);
            if (records.isError) {
                _1.LogService.info(`Retrieving standard sObjects in the org ${connection.userName} has failed due to: ${records.errorMessage}.`);
                return {
                    isError: true,
                    statusCode: records.statusCode,
                    errorMessage: records.errorMessage
                };
            }
            else {
                _1.LogService.info(`Retrieving standard sObjects in the org ${connection.userName} was successful.`);
            }
            _1.LogService.info(`Retrieving custom sObjects in the org ${connection.userName}...`);
            query = `SELECT QualifiedApiName, Label,
                        IsEverUpdatable, 
                        IsEverCreatable, 
                        IsEverDeletable,
                        KeyPrefix 
                    FROM EntityDefinition 
                    WHERE IsRetrieveable = true 
                        AND IsQueryable = true 
                        AND IsIdEnabled = true 
                        AND IsDeprecatedAndHidden = false
                        AND (KeyPrefix LIKE 'a%')`;
            const records2 = await SfdmuService.queryBatchedAsync(query, connection);
            if (records2.isError) {
                _1.LogService.info(`Retrieving custom sObjects in the org ${connection.userName} has failed due to: ${records2.errorMessage}.`);
                return {
                    isError: true,
                    statusCode: records2.statusCode,
                    errorMessage: records2.errorMessage
                };
            }
            _1.LogService.info(`Retrieving custom sObjects in the org ${connection.userName} was successful.`);
            records.records.push(...records2.records);
            const resultRecords = records.records
                .sort((a, b) => b.QualifiedApiName - a.QualifiedApiName)
                .map((record) => {
                return new models_1.SObjectDescribe({
                    id: utils_1.CommonUtils.randomString(),
                    label: String(record.Label),
                    name: String(record.QualifiedApiName),
                    creatable: !!record.IsEverCreatable,
                    updateable: !!record.IsEverUpdatable,
                    deleteable: !!record.IsEverDeletable,
                    keyPrefix: String(record.KeyPrefix),
                    custom: utils_1.SfdmuUtils.isCustom(String(record.QualifiedApiName))
                });
            });
            connection.orgDescribe = new models_1.OrgDescribe({
                objectsMap: resultRecords.toMap(o => o.name, o => o),
                name: connection.userName,
                id: connection.orgId,
                label: connection.alias,
            });
            return {
                isError: false,
                statusCode: models_1.StatusCode.OK,
                data: [connection.orgDescribe]
            };
        }
        catch (ex) {
            _1.LogService.info(`Retrieving custom sObjects in the org ${connection.userName} has failed due to: ${ex.message}.`);
            return {
                isError: true,
                statusCode: models_1.StatusCode.GeneralError,
                errorMessage: ex.message
            };
        }
    }
    /**
     * Queries the specified org.
     * @param {string} soql - The SOQL query to execute.
     * @param {Connection} connection - The connection to use.
     * @param {boolean} [useBulkQueryApi=false] - Flag indicating whether to use the Bulk Query API.
     * @param {boolean} [skipConnectionVerification=false] - Flag indicating whether to skip connection verification.
     * @returns {Promise<Partial<IQueryResult<any>>>} - A promise that resolves to the execution result. Returns records.
     */
    static async queryAsync(soql, connection, useBulkQueryApi, skipConnectionVerification) {
        if (!skipConnectionVerification) {
            const verificationResult = await SfdmuService.verfyConnectionAsync(connection);
            if (verificationResult.isError) {
                return {
                    isError: true,
                    statusCode: verificationResult.statusCode,
                    errorMessage: verificationResult.errorMessage
                };
            }
        }
        try {
            _1.LogService.info(`Executing the SOQL query ${soql}...`);
            const conn = new models_1.JSforceConnection(connection);
            _1.BroadcastService.broascastProgressUserMessage(common_1.ProgressEventType.ui_notification, `SfdmuService:queryAsync`, `EXECUTING_SOQL_QUERY`, connection.userName);
            const parsedSoql = utils_1.SfdmuUtils.parseSoql(soql, true);
            return await _makeQuery(soql, parsedSoql, conn, useBulkQueryApi);
        }
        catch (ex) {
            _1.LogService.warn(`Failed to query the ${connection.instanceUrl} due to: ${ex.message}`);
            return {
                done: true,
                records: [],
                totalSize: 0,
                isError: true,
                errorMessage: ex.message,
                statusCode: models_1.StatusCode.GeneralError
            };
        }
        /* #region Inner functions */
        // Utility function to make a query
        async function _makeQuery(soql, parsedSoql, conn, useBulk) {
            const recordsBuffer = [];
            function onQueryRecord(record) {
                recordsBuffer.push(record);
            }
            function onQueryEnd(isBulk) {
                const fixedRecords = _fixRecords(recordsBuffer, parsedSoql.fields);
                _1.LogService.info(`SOQL query execution has been successfully completed. Fetched ${fixedRecords.length} records`);
                if (isBulk) {
                    return {
                        done: true,
                        records: fixedRecords,
                        totalSize: fixedRecords.length,
                        statusCode: models_1.StatusCode.OK
                    };
                }
                else {
                    return {
                        done: true,
                        records: fixedRecords,
                        totalSize: conn["totalSize"],
                        statusCode: models_1.StatusCode.OK
                    };
                }
            }
            if (useBulk && conn.bulk) {
                _1.LogService.info(`Using bulk query Api`);
                conn.bulk.pollTimeout = common_1.CONSTANTS.SFDMU.BULK_QUERY_API_POLL_TIMEOUT;
                return new Promise((resolve, reject) => {
                    conn.bulk.query(soql)
                        .on("record", onQueryRecord)
                        .on("end", () => resolve(onQueryEnd(true)))
                        .on("error", reject);
                });
            }
            else {
                _1.LogService.info(`Using REST Api`);
                return new Promise((resolve, reject) => {
                    conn.query(soql, {
                        headers: common_1.CONSTANTS.SFDMU.SFORCE_API_CALL_HEADERS
                    }).on("record", onQueryRecord)
                        .on("end", () => resolve(onQueryEnd(false)))
                        .on("error", reject)
                        .run({
                        autoFetch: true,
                        maxFetch: common_1.CONSTANTS.SFDMU.REST_API_MAX_FETCH_SIZE
                    });
                });
            }
        }
        // Utility function to fix and format records
        function _fixRecords(records, fields) {
            return records.map(record => {
                const newRecord = {};
                Object.keys(record).forEach(key => {
                    if (record[key] && typeof record[key] === 'object' && record[key].attributes) {
                        _parseNestedObject(key, record[key], newRecord);
                    }
                    else if (key != 'attributes') {
                        newRecord[key] = record[key] === '' ? null : record[key];
                    }
                });
                fields.forEach(field => {
                    if (!newRecord.hasOwnProperty(field)) {
                        newRecord[field] = null;
                    }
                });
                Object.keys(newRecord).forEach(key => {
                    if (!fields.includes(key)) {
                        delete newRecord[key];
                    }
                });
                return newRecord;
            });
        }
        // Utility function to parse nested objects
        function _parseNestedObject(prefix, obj, newRecord) {
            Object.keys(obj).forEach(innerKey => {
                if (innerKey !== 'attributes') {
                    const newKey = `${prefix}.${innerKey}`;
                    if (obj[innerKey] && typeof obj[innerKey] === 'object' && obj[innerKey].attributes) {
                        _parseNestedObject(newKey, obj[innerKey], newRecord);
                    }
                    else {
                        newRecord[newKey] = obj[innerKey] === '' ? null : obj[innerKey];
                    }
                }
            });
        }
        /* #endregion */
    }
    /**
     * Queries the specified org in batches.
     * If the query contains OFFSET or LIMIT clauses, the query is executed as is.
     * @param {string} soql - The SOQL query to execute.
     * @param {Connection} connection - The connection to use.
     * @returns {Promise<Partial<IQueryResult<any>>>} - A promise that resolves to the execution result. Returns all records combined from all batches.
     */
    static async queryBatchedAsync(soql, connection) {
        if (soql.includes('OFFSET') || soql.includes('LIMIT')) {
            return await SfdmuService.queryAsync(soql, connection);
        }
        let result = {};
        const maxBatchQueryRecordSize = common_1.CONSTANTS.SFDMU.BATCH_QUERY_MAX_RECORD_SIZE;
        let rowsReturned = common_1.CONSTANTS.SFDMU.BATCH_QUERY_MAX_RECORD_SIZE;
        let recordsProcessed = 0;
        while (rowsReturned == maxBatchQueryRecordSize) {
            const batchQuery = `${soql} LIMIT ${maxBatchQueryRecordSize} OFFSET ${recordsProcessed}`;
            const batchedResult = await this.queryAsync(batchQuery, connection, false, recordsProcessed > 0);
            batchedResult.records || (batchedResult.records = []);
            if (!result.statusCode) {
                result = batchedResult;
            }
            else {
                result.records.push(...batchedResult.records);
                result.statusCode = batchedResult.statusCode;
            }
            rowsReturned = batchedResult.records.length;
            recordsProcessed += rowsReturned;
            result.totalSize = recordsProcessed;
            if (result.statusCode != models_1.StatusCode.OK) {
                break;
            }
        }
        return result;
    }
    /**
     * Verifies the connection and reconnects if necessary.
     * This method updates the connection object if reconnect was successful.
     * @param connection  The connection to verify.
     * @returns  A promise that resolves to the execution result
     *
     */
    static async verfyConnectionAsync(connection) {
        const conn = new models_1.JSforceConnection(connection);
        try {
            _1.BroadcastService.broascastProgressUserMessage(common_1.ProgressEventType.ui_notification, `SfdmuService:queryAsync`, `VERIFYING_ORG_CONNECTION`, connection.userName);
            _1.LogService.info(`Verifying the connection to the org ${connection.userName}...`);
            // Check connection
            await conn.identity();
            _1.LogService.info(`Connection to the org ${connection.userName} has been verified`);
            return {
                isError: false,
                statusCode: models_1.StatusCode.OK
            };
        }
        catch (ex) {
            // Try to reconnect
            _1.LogService.info(`Unable to connect to the org ${connection.userName}. Trying to reconnect...`);
            const result = await SfdmuService.execForceOrgDisplayAsync(connection.userName);
            if (result.isError) {
                _1.LogService.warn(`Failed to reconnect to the org ${connection.userName} due to: ${result.errorMessage}`);
                return {
                    isError: true,
                    statusCode: models_1.StatusCode.GeneralError,
                    errorMessage: result.errorMessage
                };
            }
            // Cannot connect
            if (!result.isConnected) {
                _1.LogService.warn(`Failed to reconnect to the org ${connection.userName}`);
                return {
                    isError: true,
                    statusCode: models_1.StatusCode.Unauthorized,
                    errorMessage: `Failed to reconnect to the org ${connection.userName}`
                };
            }
            // Update connection
            _1.LogService.info(`Connection to the org ${connection.userName} has been re-established`);
            connection.accessToken = result.accessToken || connection.accessToken;
            connection.instanceUrl = result.instanceUrl || connection.instanceUrl;
            connection.orgId = result.orgId || result.id || connection.orgId;
            connection.apiVersion = result.apiVersion || connection.apiVersion || common_1.CONSTANTS.SFDMU.DEFAULT_API_VERSION;
            connection.alias = result.alias || connection.alias || connection.userName;
            return {
                isError: false,
                statusCode: models_1.StatusCode.OK
            };
        }
    }
    /**
     * Describes the specified sObject.
     * @param {Connection} connection - The connection to use.
     * @param {string} objectName - The name of the sObject to describe.
     * @param {boolean} [skipConnectionVerification=false] - Flag indicating whether to skip connection verification.
     * @returns {Promise<Partial<IDataResult<SObjectDescribe>>>} - A promise that resolves to the execution result.
     *                                                             Returns a partial data result of the sObject describe.
     */
    static async describeSObjectAsync(connection, objectName, skipConnectionVerification) {
        if (!skipConnectionVerification) {
            const verificationResult = await SfdmuService.verfyConnectionAsync(connection);
            if (verificationResult.isError) {
                return {
                    isError: true,
                    statusCode: verificationResult.statusCode,
                    errorMessage: verificationResult.errorMessage
                };
            }
        }
        const conn = new models_1.JSforceConnection(connection);
        const describeAsync = (name) => new Promise((resolve, reject) => {
            conn.sobject(name).describe().then((meta) => {
                resolve(meta);
            }).catch(reject);
        });
        const objectDescription = connection.orgDescribe.objectsMap.get(objectName);
        try {
            _1.BroadcastService.broascastProgressUserMessage(common_1.ProgressEventType.ui_notification, `SfdmuService:describeSObject`, `DESCRIBING_SOBJECT_ON_ORG`, connection.userName, objectName);
            _1.LogService.info(`Describing the sObject ${objectName}...`);
            const describeResult = await describeAsync(objectName);
            Object.assign(objectDescription, {
                name: objectDescription.name,
                createable: describeResult.createable,
                deleteable: describeResult.deletable,
                updateable: describeResult.updateable,
                custom: describeResult.custom,
                label: describeResult.label,
                keyPrefix: describeResult.keyPrefix
            });
            describeResult.fields.forEach((field) => {
                const fieldDescription = new models_1.SFieldDescribe({
                    name: field.name,
                    objectName: objectDescription.name,
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
                    referenceTo: field.referenceTo,
                    id: utils_1.CommonUtils.randomString()
                });
                objectDescription.fieldsMap.set(fieldDescription.name, fieldDescription);
            });
            common_1.CONSTANTS.SFDMU.MULTISELECT_KEYWORDS.forEach(keyword => {
                const fieldDescription = new models_1.SFieldDescribe({
                    name: keyword,
                    objectName: objectDescription.name,
                    type: 'string',
                    label: keyword,
                    isMultiSelect: true,
                    id: utils_1.CommonUtils.randomString()
                });
                objectDescription.fieldsMap.set(fieldDescription.name, fieldDescription);
            });
            _1.LogService.info(`Describing the sObject ${objectName} on connection ${connection.userName} has been completed`);
            return {
                isError: false,
                statusCode: models_1.StatusCode.OK,
                data: [objectDescription]
            };
        }
        catch (ex) {
            objectDescription.fieldsMap.clear();
            _1.LogService.warn(`Failed to describe the sObject ${objectName} on connection ${connection.userName} due to: ${ex.message}`);
            return {
                isError: true,
                errorMessage: ex.message,
                statusCode: models_1.StatusCode.GeneralError,
                data: [objectDescription]
            };
        }
    }
    /**
        * Creates an OrgDescribe object from the specified connections.
        * This describe object summarizes the sObjects from both connections.
        * @param {Connection} sourceConnection - The source connection.
        * @param {Connection} targetConnection - The target connection.
        * @returns {OrgDescribe} - The created OrgDescribe object.
        */
    static createOrgDescribeFromConnections(sourceConnection, targetConnection) {
        const sourceOrgObjects = [...sourceConnection.orgDescribe.objectsMap.values()];
        const targetOrgObjects = [...targetConnection.orgDescribe.objectsMap.values()];
        const orgDescribe = new models_1.OrgDescribe({
            id: utils_1.CommonUtils.randomString(),
            name: sourceConnection.userName,
        });
        sourceOrgObjects.fullJoin(targetOrgObjects, (sourceObject, targetObject) => sourceObject.name == targetObject.name, (sourceObject, targetObject) => {
            if (sourceObject && targetObject) {
                const describe = new models_1.SObjectDescribe().clone(sourceObject).set({
                    dataSource: common_1.DataSource.both
                });
                orgDescribe.objectsMap.set(sourceObject.name, describe);
            }
            else if (sourceObject) {
                const describe = new models_1.SObjectDescribe().clone(sourceObject).set({
                    dataSource: common_1.DataSource.source
                });
                orgDescribe.objectsMap.set(sourceObject.name, describe);
            }
            else if (targetObject) {
                const describe = new models_1.SObjectDescribe().clone(targetObject).set({
                    dataSource: common_1.DataSource.target
                });
                orgDescribe.objectsMap.set(targetObject.name, describe);
            }
        });
        return orgDescribe;
    }
    /**
     * Creates sObject describes from the specified source and target sObject describes.
     * It contains all fields from both sObject describes.
     * @param {OrgDescribe} orgDescribe - The org describe to use.
     * @param {SObjectDescribe} sourceSObjectDescribe - The source sObject describe.
     * @param {SObjectDescribe} targetSObjectDescribe - The target sObject describe.
     * @returns {SObjectDescribe} - The created sObject describe.
     *
     */
    static createSObjectDescribeFromSObjects(orgDescribe, sourceSObjectDescribe, targetSObjectDescribe) {
        const objectName = sourceSObjectDescribe.name || targetSObjectDescribe.name;
        const sObjectDescribe = orgDescribe.objectsMap.get(objectName) || new models_1.SObjectDescribe();
        if (sObjectDescribe.isInitialized) {
            const sourceFields = [...sourceSObjectDescribe.fieldsMap.values()];
            const targetFields = [...targetSObjectDescribe.fieldsMap.values()];
            sourceFields.fullJoin(targetFields, (sourceField, targetField) => sourceField.name == targetField.name, (sourceField, targetField) => {
                if (sourceField && targetField) {
                    sObjectDescribe.fieldsMap.set(sourceField.name, sourceField);
                    sourceField.dataSource = common_1.DataSource.both;
                }
                else if (sourceField) {
                    sObjectDescribe.fieldsMap.set(sourceField.name, sourceField);
                    sourceField.dataSource = common_1.DataSource.source;
                }
                else if (targetField) {
                    sObjectDescribe.fieldsMap.set(targetField.name, targetField);
                    targetField.dataSource = common_1.DataSource.target;
                }
            });
        }
        orgDescribe.objectsMap.set(objectName, sObjectDescribe);
        return sObjectDescribe;
    }
    /**
    *  Generate CLI command string from CLI JSON.
    * @param cliJson  The CLI JSON object to generate the command string from.
    * @returns  The CLI command string.
    */
    static generateCLIString(cliJson) {
        if (!cliJson) {
            return;
        }
        cliJson = { ...cliJson };
        const flagsMap = {
            sourceusername: "--sourceusername",
            targetusername: "--targetusername",
            path: "--path",
            quiet: "--quiet",
            silent: "--silent",
            concise: "--concise",
            verbose: "--verbose",
            filelog: "--filelog",
            loglevel: "--loglevel",
            logfullquery: "--logfullquery",
            json: "--json",
            noprompt: "--noprompt",
            nowarnings: "--nowarnings",
            canmodify: "--canmodify",
            apiversion: "--apiversion",
            usesf: "--usesf"
        };
        const db = _1.DatabaseService.getOrCreateAppDb();
        const ws = _1.DatabaseService.getWorkspace();
        const selectedTargetConnection = db.connections.find(c => c.userName === ws.cli.targetusername);
        const quote = global.appGlobal.isWindows ? '"' : "'";
        let command = global.appGlobal.packageJson.appConfig.useSfCliCommands ? "sf sfdmu run" : "sfdx sfdmu:run";
        // Logic to handle sourceusername
        if (cliJson['sourceusername'] === cliJson['targetusername']) {
            delete cliJson['sourceusername'];
        }
        // Logic to ensure "quiet, silent, verbose, concise" block each other
        const blockingFlags = ['quiet', 'silent', 'verbose', 'concise'];
        const setFlag = blockingFlags.find(flag => cliJson[flag]);
        if (setFlag) {
            for (const flag of blockingFlags) {
                if (flag !== setFlag) {
                    delete cliJson[flag];
                }
            }
        }
        for (const key of Object.keys(flagsMap)) {
            const flag = flagsMap[key];
            let value = cliJson[key];
            if (value !== undefined && value !== null) {
                if (key === 'sourceusername' || key === 'targetusername') {
                    if (value == common_1.CONSTANTS.SFDMU.CSV_FILE_OPTION_NAME) {
                        value = common_1.CONSTANTS.SFDMU.CSV_FILE_ORG_NAME;
                    }
                }
                // If it's a boolean flag and it's true, add just the flag
                if (typeof value === 'boolean' && value) {
                    if (key == 'canmodify' && (selectedTargetConnection === null || selectedTargetConnection === void 0 ? void 0 : selectedTargetConnection.instanceUrl)) {
                        command += ` ${flag} ${selectedTargetConnection.instanceUrl.replace('https://', '')}`;
                    }
                }
                // If the key is path, add it with quotes based on OS
                else if (key === 'path') {
                    command += ` ${flag} ${quote}${value}${quote}`;
                }
                // For other non-boolean flags, add the flag and its value
                else if (typeof value != 'boolean') {
                    command += ` ${flag} ${value}`;
                }
            }
        }
        return command;
    }
    /**
     * Navigates to a specific help article based on a search term.
     * The function looks up the search term in a predefined configuration object and directs the user accordingly.
     *
     * @param {string} searchTerm The search term used to find the corresponding help article URL.
     */
    static navigateToHelpArticle(searchTerm) {
        const encodeUri = (uri) => {
            return encodeURIComponent(uri).replace(/%23/g, '#').replace(/%2F/g, '/');
        };
        const url = utils_1.CommonUtils.findValueDeep(configurations_1.HelpArticlesConfig, (_path, key) => key.split(',').includes(searchTerm)
            || _path == searchTerm) || searchTerm;
        if (url.startsWith('http')) {
            utils_1.FsUtils.navigateToPathOrUrl(url);
            return;
        }
        if (url.startsWith('/')) {
            utils_1.FsUtils.navigateToPathOrUrl(`${global.appGlobal.packageJson.appConfig.knowledgebaseUrl}/${encodeUri(url.substring(1))}`);
            return;
        }
        utils_1.FsUtils.navigateToPathOrUrl(`${global.appGlobal.packageJson.appConfig.knowledgebaseSearchUrl}${encodeUri(url)}`);
    }
}
exports.SfdmuService = SfdmuService;
//# sourceMappingURL=sfdmu-service.js.map