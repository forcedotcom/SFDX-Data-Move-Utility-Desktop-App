"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainScriptSettingsController = void 0;
const common_1 = require("../../../common");
const services_1 = require("../../../services");
class MainScriptSettingsController {
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
    }
    async $onInit() {
        services_1.LogService.info('Initializing MainScriptSettingsController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
    }
    /**
     * Setup the component.
     */
    setup() {
        if (global.appGlobal.wizardStep == MainScriptSettingsController.wizardStep) {
            // This code will run when the controller is initializing
            const config = services_1.DatabaseService.getConfig();
            const createSelectOption = (options) => options.map(x => ({ value: x, label: x }));
            this.scriptSettingsSetup = {
                // API SETTINGS
                // Row 0
                bulkApiVersion: { type: 'select', label: 'bulkApiVersion', options: createSelectOption(['1.0', '2.0']), widthOf12: 3, helpSearchWord: "BULK_API_VERSION", addHelpLinks: true },
                concurrencyMode: { type: 'select', label: 'concurrencyMode', options: createSelectOption(['Parallel', 'Serial']), required: false, widthOf12: 3, helpSearchWord: "CONCURRENCY_MODE", addHelpLinks: true },
                apiVersion: { type: 'input', label: 'apiVersion', required: false, widthOf12: 3, helpSearchWord: "API_VERSION", addHelpLinks: true },
                alwaysUseRestApiToUpdateRecords: { type: 'toggle', label: 'alwaysUseRestApiToUpdateRecords', required: false, widthOf12: 3, helpSearchWord: "ALWAYS_USE_REST_API_TO_UPDATE_RECORDS", addHelpLinks: true },
                // Row 1
                restApiBatchSize: { type: 'number', label: 'restApiBatchSize', required: false, min: 1, widthOf12: 3, helpSearchWord: "OBJECT_REST_API_BATCH_SIZE", addHelpLinks: true },
                bulkApiV1BatchSize: { type: 'number', label: 'bulkApiV1BatchSize', required: false, min: 1, widthOf12: 3, helpSearchWord: "OBJECT_BULK_API_V1_BATCH_SIZE", addHelpLinks: true },
                pollingIntervalMs: { type: 'number', label: 'pollingIntervalMs', required: false, min: 1, widthOf12: 3, helpSearchWord: "POLLING_INTERVAL_MS", addHelpLinks: true },
                bulkThreshold: { type: 'number', label: 'bulkThreshold', required: false, min: 1, widthOf12: 3, helpSearchWord: "BULK_THRESHOLD", addHelpLinks: true },
                // Row 2
                queryBulkApiThreshold: { type: 'number', label: 'queryBulkApiThreshold', required: false, min: 1, widthOf12: 3, helpSearchWord: "QUERY_BULK_API_THRESHOLD", addHelpLinks: true },
                pollingQueryTimeoutMs: { type: 'number', label: 'pollingQueryTimeoutMs', required: false, min: 1, widthOf12: 9, helpSearchWord: "POLLING_QUERY_TIMEOUT_MS", addHelpLinks: true },
                // CSV HANDLING
                // Row 3
                validateCSVFilesOnly: { type: 'toggle', label: 'validateCSVFilesOnly', required: false, widthOf12: 3, helpSearchWord: "VALIDATE_CSV_FILES_ONLY", addHelpLinks: true },
                createTargetCSVFiles: { type: 'toggle', label: 'createTargetCSVFiles', required: false, widthOf12: 3, helpSearchWord: "CREATE_TARGET_CSV_FILES", addHelpLinks: true },
                importCSVFilesAsIs: { type: 'toggle', label: 'importCSVFilesAsIs', required: false, widthOf12: 3, helpSearchWord: "IMPORT_CSV_FILES_AS_IS", addHelpLinks: true },
                excludeIdsFromCSVFiles: { type: 'toggle', label: 'excludeIdsFromCSVFiles', required: false, widthOf12: 3, helpSearchWord: "EXCLUDE_IDS_FROM_CSV_FILES", addHelpLinks: true },
                // Row 4
                csvReadFileDelimiter: { type: 'select', label: 'csvReadFileDelimiter', options: createSelectOption([',', ';']), required: false, widthOf12: 3, helpSearchWord: "CSV_READ_FILE_DELIMITER", addHelpLinks: true },
                csvWriteFileDelimiter: { type: 'select', label: 'csvWriteFileDelimiter', options: createSelectOption([',', ';']), required: false, widthOf12: 3, helpSearchWord: "CSV_WRITE_FILE_DELIMITER", addHelpLinks: true },
                useSeparatedCSVFiles: { type: 'toggle', label: 'useSeparatedCSVFiles', required: false, widthOf12: 6, helpSearchWord: "USE_SEPARATED_CSV_FILES", addHelpLinks: true },
                // EXECUTION SETTINGS
                // Row 5
                keepObjectOrderWhileExecute: { type: 'toggle', label: 'keepObjectOrderWhileExecute', required: false, widthOf12: 3, helpSearchWord: "KEEP_OBJECT_ORDER_WHILE_EXECUTE", addHelpLinks: true },
                allowFieldTruncation: { type: 'toggle', label: 'allowFieldTruncation', required: false, widthOf12: 3, helpSearchWord: "ALLOW_FIELD_TRUNCATION", addHelpLinks: true },
                parallelBinaryDownloads: { type: 'number', label: 'parallelBinaryDownloads', required: false, min: 1, widthOf12: 3, helpSearchWord: "PARALLEL_BINARY_DOWNLOADS", addHelpLinks: true },
                simulationMode: { type: 'toggle', label: 'simulationMode', required: false, widthOf12: 3, helpSearchWord: "SIMULATION_MODE", addHelpLinks: true },
                // ERROR HANDLING
                // Row 6
                allOrNone: { type: 'toggle', label: 'allOrNone', required: false, widthOf12: 3, helpSearchWord: "ALL_OR_NONE", addHelpLinks: true },
                promptOnIssuesInCSVFiles: { type: 'toggle', label: 'promptOnIssuesInCSVFiles', required: false, widthOf12: 3, helpSearchWord: "PROMPT_ON_ISSUES_IN_CSV_FILES", addHelpLinks: true },
                promptOnMissingParentObjects: { type: 'toggle', label: 'promptOnMissingParentObjects', required: false, widthOf12: 6, helpSearchWord: "PROMPT_ON_MISSING_PARENT_OBJECTS", addHelpLinks: true },
                // OTHER SETTINGS
                // Row 7
                proxyUrl: { type: 'input', label: 'proxyUrl', required: false, widthOf12: 3, helpSearchWord: "PROXY_URL", addHelpLinks: true },
                binaryDataCache: { type: 'select', label: 'binaryDataCache', options: createSelectOption(Object.values(common_1.DataCacheTypes)), required: false, widthOf12: 3, helpSearchWord: "BINARY_DATA_CACHE", addHelpLinks: true },
                sourceRecordsCache: { type: 'select', label: 'sourceRecordsCache', options: createSelectOption(Object.values(common_1.DataCacheTypes)), required: false, widthOf12: 6, helpSearchWord: "SOURCE_RECORDS_CACHE", addHelpLinks: true }
            };
            this.scriptSettingsJson = {
                // API SETTINGS
                bulkApiVersion: config.script.bulkApiVersion,
                concurrencyMode: config.script.concurrencyMode,
                apiVersion: config.script.apiVersion,
                alwaysUseRestApiToUpdateRecords: config.script.alwaysUseRestApiToUpdateRecords,
                restApiBatchSize: config.script.restApiBatchSize,
                bulkApiV1BatchSize: config.script.bulkApiV1BatchSize,
                pollingIntervalMs: config.script.pollingIntervalMs,
                bulkThreshold: config.script.bulkThreshold,
                queryBulkApiThreshold: config.script.queryBulkApiThreshold,
                pollingQueryTimeoutMs: config.script.pollingQueryTimeoutMs,
                // CSV HANDLING
                validateCSVFilesOnly: config.script.validateCSVFilesOnly,
                createTargetCSVFiles: config.script.createTargetCSVFiles,
                importCSVFilesAsIs: config.script.importCSVFilesAsIs,
                excludeIdsFromCSVFiles: config.script.excludeIdsFromCSVFiles,
                csvReadFileDelimiter: config.script.csvReadFileDelimiter,
                csvWriteFileDelimiter: config.script.csvWriteFileDelimiter,
                useSeparatedCSVFiles: config.script.useSeparatedCSVFiles,
                // EXECUTION SETTINGS
                keepObjectOrderWhileExecute: config.script.keepObjectOrderWhileExecute,
                allowFieldTruncation: config.script.allowFieldTruncation,
                parallelBinaryDownloads: config.script.parallelBinaryDownloads,
                simulationMode: config.script.simulationMode,
                // ERROR HANDLING
                allOrNone: config.script.allOrNone,
                promptOnIssuesInCSVFiles: config.script.promptOnIssuesInCSVFiles,
                promptOnMissingParentObjects: config.script.promptOnMissingParentObjects,
                // OTHER SETTINGS (NETWORK SETTINGS, DATA CACHE SETTINGS were combined under "OTHER SETTINGS")
                proxyUrl: config.script.proxyUrl,
                binaryDataCache: config.script.binaryDataCache,
                sourceRecordsCache: config.script.sourceRecordsCache
            };
            this.scriptSettingsTitles = [
                // API SETTINGS
                this.$app.$translate.translate({ key: 'API_SETTINGS' }),
                '',
                '',
                // CSV HANDLING 
                this.$app.$translate.translate({ key: 'CSV_HANDLING' }),
                '',
                // EXECUTION SETTINGS 
                this.$app.$translate.translate({ key: 'EXECUTION_SETTINGS' }),
                // ERROR HANDLING
                this.$app.$translate.translate({ key: 'ERROR_HANDLING' }),
                // OTHER SETTINGS
                this.$app.$translate.translate({ key: 'OTHER_SETTINGS' })
            ];
        }
    }
    handleScriptManagerFormChange(args) {
        const json = args.args[0];
        const config = services_1.DatabaseService.getConfig();
        const ws = services_1.DatabaseService.getWorkspace();
        Object.assign(config.script, json);
        this.$app.$broadcast.broadcastAction('refreshObjectList', null, null);
        services_1.DatabaseService.updateConfig(ws.id, config);
        const propsToUpdate = Object.keys(json);
        services_1.LogService.info(`Script settings were updated:  ${propsToUpdate.take(3).join(', ')}, ...`);
    }
}
exports.MainScriptSettingsController = MainScriptSettingsController;
MainScriptSettingsController.$inject = ['$app', '$scope'];
MainScriptSettingsController.wizardStep = common_1.WizardStepByView[common_1.View.configuration];
//# sourceMappingURL=mainScriptSettings.controller.js.map