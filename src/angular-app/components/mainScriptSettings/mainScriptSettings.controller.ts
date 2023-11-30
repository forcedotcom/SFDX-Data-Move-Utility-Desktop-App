import { IScope } from 'angular';
import { DataCacheTypes, SetupFormOptions, View, WizardStepByView } from '../../../common';
import { DatabaseService, LogService } from '../../../services';
import { IAppService } from '../../services';
import { IActionEventArgParam } from '../../../models';

export class MainScriptSettingsController {

    static $inject = ['$app', '$scope'];

    static wizardStep = WizardStepByView[View.configuration];

    scriptSettingsSetup: SetupFormOptions;
    scriptSettingsJson: any;
    scriptSettingsTitles: string[];

    constructor(private $app: IAppService, private $scope: IScope) { }

    async $onInit() {
        LogService.info('Initializing MainScriptSettingsController...');
        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
    }

    /**
     * Setup the component.
     */
    private setup() {
        if (global.appGlobal.wizardStep == MainScriptSettingsController.wizardStep) {
            // This code will run when the controller is initializing
            const config = DatabaseService.getConfig();

            const createSelectOption = (options) => options.map(x => ({ value: x, label: x }));

            this.scriptSettingsSetup = {
                // API SETTINGS
                // Row 0
                bulkApiVersion: { type: 'select', label: 'bulkApiVersion', options: createSelectOption(['1.0', '2.0']), widthOf12: 3 },
                concurrencyMode: { type: 'select', label: 'concurrencyMode', options: createSelectOption(['Parallel', 'Serial']), required: false, widthOf12: 3 },
                apiVersion: { type: 'input', label: 'apiVersion', required: false, widthOf12: 3 },
                alwaysUseRestApiToUpdateRecords: { type: 'toggle', label: 'alwaysUseRestApiToUpdateRecords', required: false, widthOf12: 3 },
                // Row 1
                restApiBatchSize: { type: 'number', label: 'restApiBatchSize', required: false, min: 1, widthOf12: 3 },
                bulkApiV1BatchSize: { type: 'number', label: 'bulkApiV1BatchSize', required: false, min: 1, widthOf12: 3 },
                pollingIntervalMs: { type: 'number', label: 'pollingIntervalMs', required: false, min: 1, widthOf12: 3 },
                bulkThreshold: { type: 'number', label: 'bulkThreshold', required: false, min: 1, widthOf12: 3 },
                // Row 2
                queryBulkApiThreshold: { type: 'number', label: 'queryBulkApiThreshold', required: false, min: 1, widthOf12: 3 },
                pollingQueryTimeoutMs: { type: 'number', label: 'pollingQueryTimeoutMs', required: false, min: 1, widthOf12: 9 },

                // CSV HANDLING
                // Row 3
                validateCSVFilesOnly: { type: 'toggle', label: 'validateCSVFilesOnly', required: false, widthOf12: 3 },
                createTargetCSVFiles: { type: 'toggle', label: 'createTargetCSVFiles', required: false, widthOf12: 3 },
                importCSVFilesAsIs: { type: 'toggle', label: 'importCSVFilesAsIs', required: false, widthOf12: 3 },
                excludeIdsFromCSVFiles: { type: 'toggle', label: 'excludeIdsFromCSVFiles', required: false, widthOf12: 3 },
                // Row 4
                csvReadFileDelimiter: { type: 'select', label: 'csvReadFileDelimiter', options: createSelectOption([',', ';']), required: false, widthOf12: 3 },
                csvWriteFileDelimiter: { type: 'select', label: 'csvWriteFileDelimiter', options: createSelectOption([',', ';']), required: false, widthOf12: 3 },
                useSeparatedCSVFiles: { type: 'toggle', label: 'useSeparatedCSVFiles', required: false, widthOf12: 6 },
                // EXECUTION SETTINGS
                // Row 5
                keepObjectOrderWhileExecute: { type: 'toggle', label: 'keepObjectOrderWhileExecute', required: false, widthOf12: 3 },
                allowFieldTruncation: { type: 'toggle', label: 'allowFieldTruncation', required: false, widthOf12: 3 },
                parallelBinaryDownloads: { type: 'number', label: 'parallelBinaryDownloads', required: false, min: 1, widthOf12: 3 },
                simulationMode: { type: 'toggle', label: 'simulationMode', required: false, widthOf12: 3 },
                // ERROR HANDLING
                // Row 6
                allOrNone: { type: 'toggle', label: 'allOrNone', required: false, widthOf12: 3 },
                promptOnIssuesInCSVFiles: { type: 'toggle', label: 'promptOnIssuesInCSVFiles', required: false, widthOf12: 3 },
                promptOnMissingParentObjects: { type: 'toggle', label: 'promptOnMissingParentObjects', required: false, widthOf12: 6 },
                // OTHER SETTINGS
                // Row 7
                proxyUrl: { type: 'input', label: 'proxyUrl', required: false, widthOf12: 3 },
                binaryDataCache: { type: 'select', label: 'binaryDataCache', options: createSelectOption(Object.values(DataCacheTypes)), required: false, widthOf12: 3 },
                sourceRecordsCache: { type: 'select', label: 'sourceRecordsCache', options: createSelectOption(Object.values(DataCacheTypes)), required: false, widthOf12: 6 }
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

    handleScriptManagerFormChange(args: IActionEventArgParam<any>) {
        const json = args.args[0];
        const config = DatabaseService.getConfig();
        const ws = DatabaseService.getWorkspace();

        Object.assign(config.script, json);

        this.$app.$broadcast.broadcastAction('refreshObjectList', null, null);

        DatabaseService.updateConfig(ws.id, config);
        const propsToUpdate = Object.keys(json);
        LogService.info(`Script settings were updated:  ${propsToUpdate.take(3).join(', ')}, ...`);

    }


}
