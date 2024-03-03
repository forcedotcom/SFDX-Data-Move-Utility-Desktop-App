import { plainToInstance } from "class-transformer";
import { DescribeSObjectResult } from "jsforce";
import { BroadcastService, ConsoleService, DatabaseService, LogService, TranslationService } from ".";
import { CONSTANTS, DataSource, ProgressEventType } from "../common";
import { HelpArticlesConfig } from "../configurations";
import {
    Connection,
    ForceOrg, ForceOrgDisplayResult,
    IApiResultBase,
    IDataResult,
    IExecSfdxCommandResult, IForceOrgDisplayResponse,
    IForceOrgListResponse, IForceOrgListResult,
    IQueryResult, JSforceConnection, OrgDescribe,
    SFieldDescribe,
    SObjectDescribe,
    StatusCode
} from "../models";
import { CommonUtils, FsUtils, SfdmuUtils } from "../utils";


export class SfdmuService {

    /**
      * Executes an SFDX command.
      * @param {string} command - The SFDX command to execute.
      * @param {string} [targetusername] - The target username for the command.
      * @param {boolean} [killProcessOnFirstConsoleOutput=false] - Flag indicating whether to kill the process on the first console output.
      * @param {LongOperationProgressCallback} [progressCallback=null] - Callback function for progress updates.
      * @returns {Promise<IExecSfdxCommandResult>} - A promise that resolves to the execution result.
      */
    static async execSfdxCommandAsync(
        command: string,
        targetusername: string,
        killProcessOnFirstConsoleOutput = false
    ): Promise<IExecSfdxCommandResult> {

        let cliCommand = targetusername
            ? `sfdx ${command} --targetusername ${targetusername}`
            : `sfdx ${command}`;
        if (global.appGlobal.packageJson.appConfig.useSfCliCommands) {
            cliCommand = cliCommand.replaceStrings(
                { from: "sfdx", to: "sf" },
                { from: "force:org:display", to: "org display" },
                { from: "force:org:list", to: "org list" },
                { from: "--targetusername", to: "--target-org" }
            );
        }

        LogService.info(`Executing the CLI command ${cliCommand}...`);

        const { commandOutput, isError } = await ConsoleService.runCommandAsync(cliCommand, killProcessOnFirstConsoleOutput);

        if (isError) {
            LogService.warn(`Failed to execute the command ${cliCommand}`);
        } else {
            LogService.info(`Execution of the command ${cliCommand} has been completed`);
        }

        return {
            cliCommand,
            commandOutput,
            isError,
            statusCode: isError ? StatusCode.GeneralError : StatusCode.OK,
        };
    }


    /**
       * Executes the "force:org:list" command.
       * @returns {Promise<IForceOrgListResult>} - A promise that resolves to the execution result.
       */
    static async execForceOrgListAsync(): Promise<IForceOrgListResult> {
        let errorMessage = "";

        try {

            BroadcastService.broascastProgressUserMessage(ProgressEventType.ui_notification, 'SfdmuService:execForceOrgList', `SEARCHING_SFDX_ORGS`);

            LogService.info(`Looking for the available SFDX orgs...`);

            const response = await SfdmuService.execSfdxCommandAsync(
                "force:org:list --json",
                null,
                false
            );
            if (response.isError) {
                throw new Error(
                    TranslationService.translate({ key: 'FAILED_TO_EXECUTE_SFDX_COMMAND' })
                );
            }
            const responseObject = JSON.parse(response.commandOutput) as IForceOrgListResponse;

            if (responseObject.status == 0) {
                /**
                 * The result of the "force:org:list" command.
                 * @type {IForceOrgListResult}
                 */
                return {
                    orgs: [
                        ...responseObject.result.nonScratchOrgs.map(org => plainToInstance(ForceOrg, org)),
                        ...responseObject.result.scratchOrgs.map(org => {
                            org.isScratchOrg = true;
                            return plainToInstance(ForceOrg, org);
                        }),
                    ],
                    commandOutput: response.commandOutput,
                    isError: false,
                    errorMessage,
                    statusCode: StatusCode.OK,
                };
            } else {
                errorMessage = responseObject.message;
            }
        } catch (ex: any) {
            errorMessage = ex.message;
        }

        LogService.warn(`Unable to retrieve the list of SFDX orgs due to: ${errorMessage}`);

        /**
         * The execution result of the "force:org:list" command.
         * @type {IForceOrgListResult}
         */
        return {
            errorMessage,
            isError: true,
            statusCode: StatusCode.GeneralError,
        } as IForceOrgListResult;
    }


    /**
    * Executes the "force:org:display" command.
    * @param {string} userName - The username of the org.
    * @returns {Promise<ForceOrgDisplayResult>} - A promise that resolves to the execution result.
    */
    static async execForceOrgDisplayAsync(userName: string): Promise<ForceOrgDisplayResult> {
        try {

            BroadcastService.broascastProgressUserMessage(ProgressEventType.ui_notification, 'SfdmuService:execForceOrgDisplay', `CONNECTING_ORG`, userName);

            LogService.info(`Connecting the org ${userName}...`);

            const response = await SfdmuService.execSfdxCommandAsync(
                "force:org:display --json",
                userName,
                false
            );
            const jsonObject = JSON.parse(response.commandOutput) as IForceOrgDisplayResponse;
            if (jsonObject.status == 0) {
                /**
                 * The result of the "force:org:display" command.
                 * @type {ForceOrgDisplayResult}
                 */
                const responseObject = new ForceOrgDisplayResult(
                    Object.assign(jsonObject.result, {
                        cliCommand: response.cliCommand,
                        commandOutput: response.commandOutput,
                        statusCode: StatusCode.OK,
                    })
                );
                return responseObject;
            }
            response.errorMessage = `Unable to connect to the org ${userName}`;
            LogService.warn(response.errorMessage);
            return new ForceOrgDisplayResult({
                statusCode: StatusCode.GeneralError,
                errorMessage: response.errorMessage,
                isError: true,
            });
        } catch (ex) {
            const errorMessage = `Unable to connect to the org ${userName}`;
            LogService.warn(errorMessage);
            return {
                statusCode: StatusCode.GeneralError,
                errorMessage,
                isError: true,
            } as ForceOrgDisplayResult;
        }
    }


    /**
     * Connects to the specified orgs.
     * @param {Connection} connection - The connection to use.
     * @returns {Promise<Partial<IDataResult<OrgDescribe>>>} - A promise that resolves to the execution result.
     *                                                          Returns a partial data result of the org describe.
     *                                                          Contains map of sobjects and their describes.
     */
    static async connectToOrgAsync(connection: Connection): Promise<Partial<IDataResult<OrgDescribe>>> {

        LogService.info(`Connecting to the org ${connection.userName}...`);

        BroadcastService.broascastProgressUserMessage(ProgressEventType.ui_notification, 'SfdmuService:connectToOrgAsync', `RETRIEVENG_ORG_OBJECTS`, connection.userName);
        await CommonUtils.delayAsync(1000);

        try {
            LogService.info(`Retrieving standard sObjects in the org ${connection.userName}...`);

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
                LogService.info(`Retrieving standard sObjects in the org ${connection.userName} has failed due to: ${records.errorMessage}.`);
                return {
                    isError: true,
                    statusCode: records.statusCode,
                    errorMessage: records.errorMessage
                };
            } else {
                LogService.info(`Retrieving standard sObjects in the org ${connection.userName} was successful.`);
            }

            LogService.info(`Retrieving custom sObjects in the org ${connection.userName}...`);

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
                LogService.info(`Retrieving custom sObjects in the org ${connection.userName} has failed due to: ${records2.errorMessage}.`);
                return {
                    isError: true,
                    statusCode: records2.statusCode,
                    errorMessage: records2.errorMessage
                };
            }

            LogService.info(`Retrieving custom sObjects in the org ${connection.userName} was successful.`);
            records.records.push(...records2.records);

            const resultRecords = records.records
                .sort((a, b) => b.QualifiedApiName - a.QualifiedApiName)
                .map((record: any) => {
                    return new SObjectDescribe({
                        id: CommonUtils.randomString(),
                        label: String(record.Label),
                        name: String(record.QualifiedApiName),
                        creatable: !!record.IsEverCreatable,
                        updateable: !!record.IsEverUpdatable,
                        deleteable: !!record.IsEverDeletable,
                        keyPrefix: String(record.KeyPrefix),
                        custom: SfdmuUtils.isCustom(String(record.QualifiedApiName))
                    });
                });

            connection.orgDescribe = new OrgDescribe({
                objectsMap: resultRecords.toMap(o => o.name, o => o),
                name: connection.userName,
                id: connection.orgId,
                label: connection.alias,
            });

            return {
                isError: false,
                statusCode: StatusCode.OK,
                data: [connection.orgDescribe]
            };

        } catch (ex) {
            LogService.info(`Retrieving custom sObjects in the org ${connection.userName} has failed due to: ${ex.message}.`);
            return {
                isError: true,
                statusCode: StatusCode.GeneralError,
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
    static async queryAsync(soql: string, connection: Connection, useBulkQueryApi?: boolean, skipConnectionVerification?: boolean): Promise<Partial<IQueryResult<any>>> {

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
            LogService.info(`Executing the SOQL query ${soql}...`);
            const conn: JSforceConnection = new JSforceConnection(connection);

            BroadcastService.broascastProgressUserMessage(ProgressEventType.ui_notification, `SfdmuService:queryAsync`, `EXECUTING_SOQL_QUERY`, connection.userName);

            const parsedSoql = SfdmuUtils.parseSoql(soql, true);

            return await _makeQuery(soql, parsedSoql, conn, useBulkQueryApi);

        } catch (ex) {
            LogService.warn(`Failed to query the ${connection.instanceUrl} due to: ${ex.message}`);
            return {
                done: true,
                records: [],
                totalSize: 0,
                isError: true,
                errorMessage: ex.message,
                statusCode: StatusCode.GeneralError
            } as IQueryResult<any>;
        }


        /* #region Inner functions */
        // Utility function to make a query
        async function _makeQuery(soql: string, parsedSoql: any, conn: any, useBulk: boolean): Promise<IQueryResult<any>> {
            const recordsBuffer: Record<string, any>[] = [];

            function onQueryRecord(record: any) {
                recordsBuffer.push(record);
            }

            function onQueryEnd(isBulk: boolean) {
                const fixedRecords = _fixRecords(recordsBuffer, parsedSoql.fields);
                LogService.info(`SOQL query execution has been successfully completed. Fetched ${fixedRecords.length} records`);

                if (isBulk) {
                    return {
                        done: true,
                        records: fixedRecords,
                        totalSize: fixedRecords.length,
                        statusCode: StatusCode.OK
                    } as IQueryResult<any>;
                } else {
                    return {
                        done: true,
                        records: fixedRecords,
                        totalSize: conn["totalSize"],
                        statusCode: StatusCode.OK
                    } as IQueryResult<any>;
                }
            }

            if (useBulk && conn.bulk) {
                LogService.info(`Using bulk query Api`);
                conn.bulk.pollTimeout = CONSTANTS.SFDMU.BULK_QUERY_API_POLL_TIMEOUT;
                return new Promise((resolve, reject) => {
                    conn.bulk.query(soql)
                        .on("record", onQueryRecord)
                        .on("end", () => resolve(onQueryEnd(true)))
                        .on("error", reject);
                });
            } else {
                LogService.info(`Using REST Api`);
                return new Promise((resolve, reject) => {
                    conn.query(soql, {
                        headers: CONSTANTS.SFDMU.SFORCE_API_CALL_HEADERS
                    }).on("record", onQueryRecord)
                        .on("end", () => resolve(onQueryEnd(false)))
                        .on("error", reject)
                        .run({
                            autoFetch: true,
                            maxFetch: CONSTANTS.SFDMU.REST_API_MAX_FETCH_SIZE
                        });
                });
            }
        }


        // Utility function to fix and format records
        function _fixRecords(records: Record<string, any>[], fields: string[]): Record<string, any>[] {
            return records.map(record => {
                const newRecord: Record<string, any> = {};
                Object.keys(record).forEach(key => {
                    if (record[key] && typeof record[key] === 'object' && record[key].attributes) {
                        _parseNestedObject(key, record[key], newRecord);
                    } else if (key != 'attributes') {
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
        function _parseNestedObject(prefix: string, obj: Record<string, any>, newRecord: Record<string, any>): void {
            Object.keys(obj).forEach(innerKey => {
                if (innerKey !== 'attributes') {
                    const newKey = `${prefix}.${innerKey}`;
                    if (obj[innerKey] && typeof obj[innerKey] === 'object' && obj[innerKey].attributes) {
                        _parseNestedObject(newKey, obj[innerKey], newRecord);
                    } else {
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
    static async queryBatchedAsync(soql: string, connection: Connection): Promise<Partial<IQueryResult<any>>> {

        if (soql.includes('OFFSET') || soql.includes('LIMIT')) {
            return await SfdmuService.queryAsync(soql, connection);
        }

        let result: Partial<IQueryResult<any>> = {};

        const maxBatchQueryRecordSize = CONSTANTS.SFDMU.BATCH_QUERY_MAX_RECORD_SIZE;
        let rowsReturned = CONSTANTS.SFDMU.BATCH_QUERY_MAX_RECORD_SIZE;

        let recordsProcessed = 0;

        while (rowsReturned == maxBatchQueryRecordSize) {
            const batchQuery = `${soql} LIMIT ${maxBatchQueryRecordSize} OFFSET ${recordsProcessed}`;

            const batchedResult = await this.queryAsync(batchQuery, connection, false, recordsProcessed > 0);
            batchedResult.records ||= [];

            if (!result.statusCode) {
                result = batchedResult;
            } else {
                result.records.push(...batchedResult.records);
                result.statusCode = batchedResult.statusCode;
            }

            rowsReturned = batchedResult.records.length;
            recordsProcessed += rowsReturned;
            result.totalSize = recordsProcessed;

            if (result.statusCode != StatusCode.OK) {
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
    static async verfyConnectionAsync(connection: Connection): Promise<IApiResultBase> {
        const conn: JSforceConnection = new JSforceConnection(connection);
        try {

            BroadcastService.broascastProgressUserMessage(ProgressEventType.ui_notification, `SfdmuService:queryAsync`, `VERIFYING_ORG_CONNECTION`, connection.userName);

            LogService.info(`Verifying the connection to the org ${connection.userName}...`);

            // Check connection
            await conn.identity();
            LogService.info(`Connection to the org ${connection.userName} has been verified`);
            return {
                isError: false,
                statusCode: StatusCode.OK
            };
        } catch (ex) {
            // Try to reconnect
            LogService.info(`Unable to connect to the org ${connection.userName}. Trying to reconnect...`);
            const result = await SfdmuService.execForceOrgDisplayAsync(connection.userName);
            if (result.isError) {
                LogService.warn(`Failed to reconnect to the org ${connection.userName} due to: ${result.errorMessage}`);
                return {
                    isError: true,
                    statusCode: StatusCode.GeneralError,
                    errorMessage: result.errorMessage
                };
            }
            // Cannot connect
            if (!result.isConnected) {
                LogService.warn(`Failed to reconnect to the org ${connection.userName}`);
                return {
                    isError: true,
                    statusCode: StatusCode.Unauthorized,
                    errorMessage: `Failed to reconnect to the org ${connection.userName}`
                };
            }

            // Update connection
            LogService.info(`Connection to the org ${connection.userName} has been re-established`);

            connection.accessToken = result.accessToken || connection.accessToken;
            connection.instanceUrl = result.instanceUrl || connection.instanceUrl;
            connection.orgId = result.orgId || result.id || connection.orgId;
            connection.apiVersion = result.apiVersion || connection.apiVersion || CONSTANTS.SFDMU.DEFAULT_API_VERSION;
            connection.alias = result.alias || connection.alias || connection.userName;

            return {
                isError: false,
                statusCode: StatusCode.OK
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
    static async describeSObjectAsync(connection: Connection, objectName: string, skipConnectionVerification?: boolean): Promise<Partial<IDataResult<SObjectDescribe>>> {

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

        const conn: JSforceConnection = new JSforceConnection(connection);

        const describeAsync = (name: string) => new Promise((resolve: (meta: DescribeSObjectResult) => void, reject) => {
            conn.sobject(name).describe((err: any, meta: DescribeSObjectResult) => {
                if (err) reject(err);
                else resolve(meta);
            });
        });

        const objectDescription = connection.orgDescribe.objectsMap.get(objectName);

        try {
            BroadcastService.broascastProgressUserMessage(ProgressEventType.ui_notification,
                `SfdmuService:describeSObject`, `DESCRIBING_SOBJECT_ON_ORG`,
                connection.userName, objectName);

            LogService.info(`Describing the sObject ${objectName}...`);
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

            describeResult.fields.forEach((field: any) => {
                const fieldDescription = new SFieldDescribe({
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
                    id: CommonUtils.randomString()
                });
                objectDescription.fieldsMap.set(fieldDescription.name, fieldDescription);
            });

            CONSTANTS.SFDMU.MULTISELECT_KEYWORDS.forEach(keyword => {
                const fieldDescription = new SFieldDescribe({
                    name: keyword,
                    objectName: objectDescription.name,
                    type: 'string',
                    label: keyword,
                    isMultiSelect: true,
                    id: CommonUtils.randomString()
                });
                objectDescription.fieldsMap.set(fieldDescription.name, fieldDescription);
            });

            LogService.info(`Describing the sObject ${objectName} on connection ${connection.userName} has been completed`);
            return {
                isError: false,
                statusCode: StatusCode.OK,
                data: [objectDescription]
            }

        } catch (ex) {
            objectDescription.fieldsMap.clear();
            LogService.warn(`Failed to describe the sObject ${objectName} on connection ${connection.userName} due to: ${ex.message}`);
            return {
                isError: true,
                errorMessage: ex.message,
                statusCode: StatusCode.GeneralError,
                data: [objectDescription]
            }
        }

    }

    /**
        * Creates an OrgDescribe object from the specified connections.
        * This describe object summarizes the sObjects from both connections.
        * @param {Connection} sourceConnection - The source connection.
        * @param {Connection} targetConnection - The target connection.
        * @returns {OrgDescribe} - The created OrgDescribe object.
        */
    static createOrgDescribeFromConnections(sourceConnection: Connection, targetConnection: Connection): OrgDescribe {

        const sourceOrgObjects = [...sourceConnection.orgDescribe.objectsMap.values()];
        const targetOrgObjects = [...targetConnection.orgDescribe.objectsMap.values()];

        const orgDescribe = new OrgDescribe({
            id: CommonUtils.randomString(),
            name: sourceConnection.userName,
        });

        sourceOrgObjects.fullJoin(targetOrgObjects, (sourceObject, targetObject) => sourceObject.name == targetObject.name, (sourceObject, targetObject) => {
            if (sourceObject && targetObject) {
                const describe = new SObjectDescribe().clone(sourceObject).set({
                    dataSource: DataSource.both
                });
                orgDescribe.objectsMap.set(sourceObject.name, describe);
            } else if (sourceObject) {
                const describe = new SObjectDescribe().clone(sourceObject).set({
                    dataSource: DataSource.source
                });
                orgDescribe.objectsMap.set(sourceObject.name, describe);
            } else if (targetObject) {
                const describe = new SObjectDescribe().clone(targetObject).set({
                    dataSource: DataSource.target
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
    static createSObjectDescribeFromSObjects(orgDescribe: OrgDescribe, sourceSObjectDescribe: SObjectDescribe, targetSObjectDescribe: SObjectDescribe): SObjectDescribe {

        const objectName = sourceSObjectDescribe.name || targetSObjectDescribe.name;
        const sObjectDescribe = orgDescribe.objectsMap.get(objectName) || new SObjectDescribe();

        if (sObjectDescribe.isInitialized) {

            const sourceFields = [...sourceSObjectDescribe.fieldsMap.values()];
            const targetFields = [...targetSObjectDescribe.fieldsMap.values()];

            sourceFields.fullJoin(targetFields, (sourceField, targetField) => sourceField.name == targetField.name, (sourceField, targetField) => {
                if (sourceField && targetField) {
                    sObjectDescribe.fieldsMap.set(sourceField.name, sourceField);
                    sourceField.dataSource = DataSource.both;
                } else if (sourceField) {
                    sObjectDescribe.fieldsMap.set(sourceField.name, sourceField);
                    sourceField.dataSource = DataSource.source;
                } else if (targetField) {
                    sObjectDescribe.fieldsMap.set(targetField.name, targetField);
                    targetField.dataSource = DataSource.target;
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

    static generateCLIString(cliJson: any): string {
        if (!cliJson) {
            return
        }
        const flagsMap: { [key: string]: string } = {
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

        const db = DatabaseService.getOrCreateAppDb();
        const ws = DatabaseService.getWorkspace();
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
                    if (value == 'CSV_FILE') {
                        value = CONSTANTS.SFDMU.CSV_FILE_ORG_NAME
                    }
                }

                // If it's a boolean flag and it's true, add just the flag
                if (typeof value === 'boolean' && value) {
                    if (key == 'canmodify' && selectedTargetConnection?.instanceUrl) {
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
     * Navigates to the specified help article.
     * @param searchTerm The search term.
     */
    static navigateToHelpArticle(searchTerm: string) {

        const encodeUri = (uri) => {
            return encodeURIComponent(uri).replace(/%23/g, '#').replace(/%2F/g, '/');
        }

        const configArticle = Object.keys(HelpArticlesConfig).find(x => x.split(',').includes(searchTerm));

        searchTerm = configArticle && HelpArticlesConfig[configArticle] || searchTerm;

        if (searchTerm.startsWith('http')) {
            FsUtils.navigateToPathOrUrl(searchTerm);
            return;
        }
        if (searchTerm.startsWith('/')) {
            FsUtils.navigateToPathOrUrl(`${global.appGlobal.packageJson.appConfig.knowledgebaseUrl}/${encodeUri(searchTerm.substring(1))}`);
            return;
        }
        FsUtils.navigateToPathOrUrl(`${global.appGlobal.packageJson.appConfig.knowledgebaseSearchUrl}${encodeUri(searchTerm)}`);

    }


}